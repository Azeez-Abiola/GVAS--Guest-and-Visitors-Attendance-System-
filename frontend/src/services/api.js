import { supabase } from '../lib/supabase';

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.useDirectSupabase = true; // Toggle to use Supabase directly or via backend API
    this.supabase = supabase; // Expose supabase for direct access when needed
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Supabase project URL for edge functions
  }

  // Subscribe to real-time visitor updates
  subscribeToVisitors(callback) {
    return this.supabase
      .channel('public:visitors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors'
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }

  // Generate 8-character alphanumeric guest code
  generateGuestCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Check if a string is a valid UUID
  isValidUUID(str) {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Hosts - Query hosts table directly (better for public guest registration)
  async getHosts() {
    if (this.useDirectSupabase) {
      try {
        // Try fetching from 'hosts' table first (likely has public read access)
        const { data: hostsData, error: hostsError } = await supabase
          .from('hosts')
          .select('*')
          .eq('active', true)
          .order('name');

        if (!hostsError && hostsData && hostsData.length > 0) {
          // Return formatted hosts
          return hostsData.map(h => ({
            id: h.id,
            name: h.name, // 'hosts' table usually has a 'name' column
            email: h.email,
            phone: h.phone || '',
            floor_number: h.floor_number,
            office_number: h.office_number,
            active: true
          }));
        }

        console.log('Falling back to users table for hosts...');

        // Fallback: Query users table (might fail due to RLS if unauthenticated)
        const { data: hostUsers, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name, phone, is_active')
          .eq('role', 'host')
          .eq('is_active', true)
          .order('full_name');

        if (usersError) throw usersError;

        // Get additional host details
        const { data: hostDetails } = await supabase
          .from('hosts')
          .select('email, floor_number, office_number')
          .eq('active', true);

        return hostUsers.map(user => {
          const details = hostDetails?.find(h => h.email === user.email) || {};
          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            phone: user.phone,
            floor_number: details.floor_number || null,
            office_number: details.office_number || '',
            active: user.is_active,
            tenant: null
          };
        });
      } catch (error) {
        console.error('Error fetching hosts:', error);
        return [];
      }
    }
    return this.request('/hosts');
  }

  // Tenants (new - UAC House floors)
  async getTenants() {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('floor_number');

    if (error) throw error;
    return data;
  }

  // Badges (new - physical badge management)
  async getBadges(status = null) {
    let query = supabase
      .from('badges')
      .select('*')
      .order('badge_number');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getAvailableBadges() {
    return this.getBadges('available');
  }

  // Visitors
  async getVisitors(filters = {}) {
    if (this.useDirectSupabase) {
      let query = supabase
        .from('visitors')
        .select(`
          *,
          host:hosts!visitors_host_id_fkey(id, name, email, tenant_id),
          tenant:tenants(id, name, floor_number)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }
      if (filters.date) {
        query = query.gte('created_at', `${filters.date}T00:00:00`)
          .lte('created_at', `${filters.date}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    const params = new URLSearchParams(filters);
    return this.request(`/visitors?${params}`);
  }

  async getVisitor(id) {
    if (this.useDirectSupabase) {
      // Try to find visitor by guest_code or visitor_id (not UUID id to avoid errors)
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          *,
          host:hosts!visitors_host_id_fkey(id, name, email, tenant_id),
          tenant:tenants(id, name, floor_number)
        `)
        .or(`visitor_id.eq.${id},guest_code.eq.${id}`)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle "not found" gracefully

      if (error) throw error;
      return data;
    }
    return this.request(`/visitor/${id}`);
  }

  async getVisitorById(uuid) {
    if (this.useDirectSupabase) {
      // Get visitor by UUID (for refreshing data)
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          *,
          host:hosts!visitors_host_id_fkey(id, name, email, tenant_id),
          tenant:tenants(id, name, floor_number)
        `)
        .eq('id', uuid)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
    return this.request(`/visitor/${uuid}`);
  }

  async createVisitor(data) {
    if (this.useDirectSupabase) {
      // Fetch host details to populate required fields
      let visitorData = { ...data };

      // Clean up optional fields specifically for UUIDs to avoid 22P02 "invalid input syntax"
      if (!visitorData.host_id) delete visitorData.host_id;
      if (!visitorData.tenant_id) delete visitorData.tenant_id;
      // Also clean up email if it's an empty string (optional field)
      if (visitorData.email === '') visitorData.email = null;

      if (data.host_id) {
        console.log('Looking up host with ID:', data.host_id);

        // Try hosts table first
        let host = null;
        let hostError = null;

        const { data: hostsData, error: hostsTableError } = await supabase
          .from('hosts')
          .select('tenant_id, name, email, floor_number')
          .eq('id', data.host_id)
          .maybeSingle();

        if (hostsTableError) {
          console.warn('Error querying hosts table:', hostsTableError);
        }

        if (hostsData) {
          host = hostsData;
          console.log('Host found in hosts table:', host);
        } else {
          // Fallback to users table if not found in hosts table
          console.log('Host not in hosts table, checking users table...');

          const { data: userData, error: usersTableError } = await supabase
            .from('users')
            .select('id, email, full_name, phone, assigned_floors')
            .eq('id', data.host_id)
            .eq('role', 'host')
            .maybeSingle();

          if (usersTableError) {
            console.error('Error querying users table:', usersTableError);
            hostError = usersTableError;
          }

          if (userData) {
            // Map user data to host format
            // assigned_floors might be a JSON array or already parsed
            let floorNum = null;
            if (userData.assigned_floors) {
              if (Array.isArray(userData.assigned_floors) && userData.assigned_floors.length > 0) {
                floorNum = userData.assigned_floors[0];
              } else if (typeof userData.assigned_floors === 'string') {
                // Try parsing if it's a string
                try {
                  const parsed = JSON.parse(userData.assigned_floors);
                  if (Array.isArray(parsed) && parsed.length > 0) floorNum = parsed[0];
                  else if (typeof parsed === 'number' || typeof parsed === 'string') floorNum = parsed;
                } catch (e) {
                  // If parsing fails, use the string value itself if it's "simple"
                  if (userData.assigned_floors.length < 5) floorNum = userData.assigned_floors;
                  console.log('Using raw assigned_floors string:', userData.assigned_floors);
                }
              } else if (typeof userData.assigned_floors === 'number') {
                floorNum = userData.assigned_floors;
              }
            }

            host = {
              tenant_id: null, // Users don't have tenant_id, will be removed later
              name: userData.full_name,
              email: userData.email,
              floor_number: floorNum
            };
            console.log('Host found in users table:', host);
          }
        }

        console.log('Final host lookup result:', { host, hostError });

        if (hostError && !host) {
          console.error('Failed to fetch host details:', hostError);
          throw new Error(`Error looking up host: ${hostError.message}`);
        }

        if (!host) {
          console.error('Host not found with ID:', data.host_id);
          throw new Error('The selected host could not be found. Please select a different host or contact support.');
        }

        // Populate all required fields from host
        // Only use host's tenant_id if it's a valid UUID
        if (host.tenant_id && this.isValidUUID(host.tenant_id)) {
          visitorData.tenant_id = host.tenant_id;
        } else if (visitorData.tenant_id && this.isValidUUID(visitorData.tenant_id)) {
          // Keep existing if valid
        } else {
          // Don't include tenant_id if no valid UUID available
          delete visitorData.tenant_id;
        }
        visitorData.host_name = host.name || visitorData.host_name;

        // Use host's floor number if not provided
        if (!visitorData.floor_number && host.floor_number) {
          visitorData.floor_number = host.floor_number;
        }

        console.log('Populated visitor data:', {
          tenant_id: visitorData.tenant_id,
          host_name: visitorData.host_name,
          floor_number: visitorData.floor_number
        });
      } else {
        // If no host selected, use a default value for host_name to satisfy DB constraint
        if (!visitorData.host_name) {
          visitorData.host_name = 'Reception Walk-in';
        }
      }

      // Generate visitor_id if not provided
      if (!visitorData.visitor_id) {
        visitorData.visitor_id = `VIS-${Date.now()}`;
      }

      // Generate guest_code (8-character alphanumeric code)
      if (!visitorData.guest_code) {
        visitorData.guest_code = this.generateGuestCode();
      }

      // Generate QR code data
      if (!visitorData.qr_code) {
        visitorData.qr_code = visitorData.guest_code; // QR code contains the guest code
      }

      // Set default status if not provided
      if (!visitorData.status) {
        visitorData.status = 'pending'; // Valid values: pending, pre-registered, checked-in, checked-out, cancelled
      }

      console.log('Final visitor data before insert:', visitorData);

      // Ensure all required fields are present (tenant_id is now optional)

      const requiredFields = ['name', 'visitor_id', 'purpose'];
      const missingFields = requiredFields.filter(field => !visitorData[field]);

      if (missingFields.length > 0) {
        console.error('Missing fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }



      const { data: visitor, error } = await supabase
        .from('visitors')
        .insert([visitorData])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Visitor created successfully:', visitor);

      // Try to create notifications (but don't fail if it fails)
      this.createVisitorNotifications(visitor).catch(err => {
        console.warn('Background notification creation failed:', err);
      });

      return visitor;
    }

    return this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper method for notifications
  async createVisitorNotifications(visitor) {
    try {
      const notifications = [];

      // 1. Notification for the host
      // Note: visitor.host_id maps to user_id in the notifications table
      // We store additional metadata in the 'data' JSONB column
      notifications.push({
        user_id: visitor.host_id,
        type: 'visitor_pre_registered',
        title: 'Guest Pre-registered',
        message: `New visitor ${visitor.name} from ${visitor.company || 'N/A'} has pre-registered to visit you on ${visitor.visit_date || new Date().toISOString().split('T')[0]}`,
        is_read: false,
        data: {
          visitor_id: visitor.id,
          host_id: visitor.host_id,
          role: 'host'
        },
        created_at: new Date().toISOString()
      });

      // 2. Notification for admin(s)
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (admins && admins.length > 0) {
        admins.forEach(admin => {
          notifications.push({
            user_id: admin.id,
            type: 'visitor_pre_registered',
            title: 'Guest Pre-registered',
            message: `New visitor ${visitor.name} has pre-registered to visit ${visitor.host_name} on ${visitor.visit_date || new Date().toISOString().split('T')[0]}`,
            is_read: false,
            data: {
              visitor_id: visitor.id,
              host_id: visitor.host_id,
              role: 'admin'
            },
            created_at: new Date().toISOString()
          });
        });
      }

      // 3. Notification for receptionist(s)
      if (visitor.floor_number !== null && visitor.floor_number !== undefined) {
        const { data: receptionists } = await supabase
          .from('users')
          .select('id, assigned_floors')
          .eq('role', 'reception')
          .eq('is_active', true);

        if (receptionists && receptionists.length > 0) {
          receptionists.forEach(receptionist => {
            // Check if assigned
            let isAssigned = false;
            let floors = [];

            if (receptionist.assigned_floors) {
              if (Array.isArray(receptionist.assigned_floors)) {
                floors = receptionist.assigned_floors;
              } else if (typeof receptionist.assigned_floors === 'string') {
                // Try to parse if it looks like JSON, otherwise treat as single string
                try {
                  const parsed = JSON.parse(receptionist.assigned_floors);
                  if (Array.isArray(parsed)) floors = parsed;
                  else floors = [receptionist.assigned_floors];
                } catch (e) {
                  floors = [receptionist.assigned_floors];
                }
              } else if (typeof receptionist.assigned_floors === 'number') {
                floors = [receptionist.assigned_floors];
              }
            }

            // Loose matching to handle "9" vs 9
            if (floors.some(f => String(f) === String(visitor.floor_number))) {
              isAssigned = true;
            }

            if (isAssigned) {
              notifications.push({
                user_id: receptionist.id,
                type: 'visitor_pre_registered',
                title: 'Guest Pre-registered',
                message: `New visitor ${visitor.name} will visit floor ${visitor.floor_number} on ${visitor.visit_date || new Date().toISOString().split('T')[0]}`,
                is_read: false,
                data: {
                  visitor_id: visitor.id,
                  host_id: visitor.host_id,
                  role: 'reception',
                  floor: visitor.floor_number
                },
                created_at: new Date().toISOString()
              });
            }
          });
        }
      }

      if (notifications.length > 0) {
        const { error } = await supabase.from('notifications').insert(notifications);

        if (error) {
          console.error('Failed to create notifications:', error);
        } else {
          console.log(`Created ${notifications.length} notifications`);
        }
      }
    } catch (e) {
      console.error('Notification logic error:', e);
    }
  }

  async updateVisitor(id, updates) {
    if (this.useDirectSupabase) {
      const { data, error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return this.request(`/visitors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async preRegisterVisitor(data) {
    // Use backend API for this to trigger notification logic
    return this.request('/pre-register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async inviteGuest(data) {
    return this.request('/invite-guest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkInVisitor(data) {
    // Use backend API for this to trigger badge assignment and notifications
    return this.request('/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkOutVisitor(id) {
    // Use backend API for this to trigger badge release
    return this.request(`/checkout/${id}`, {
      method: 'POST',
    });
  }

  // Shorthand aliases for convenience
  async checkIn(visitorId) {
    if (this.useDirectSupabase) {
      // First, try to assign an available badge
      let badgeAssigned = null;
      try {
        badgeAssigned = await this.assignBadge(visitorId, 'visitor');
        console.log(`✅ Badge ${badgeAssigned.badge_number} assigned to visitor`);
      } catch (badgeError) {
        console.warn('⚠️ Badge assignment failed:', badgeError.message);
        // Continue check-in even if badge assignment fails
      }

      // Update visitor status to checked-in
      const { data, error } = await supabase
        .from('visitors')
        .update({
          status: 'checked_in',
          check_in_time: new Date().toISOString()
        })
        .eq('id', visitorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return this.checkInVisitor({ visitor_id: visitorId });
  }

  async checkOut(visitorId) {
    if (this.useDirectSupabase) {
      // First, release the badge back to inventory
      try {
        await this.releaseBadge(visitorId);
        console.log('✅ Badge released back to inventory');
      } catch (badgeError) {
        console.warn('⚠️ Badge release failed:', badgeError.message);
        // Continue check-out even if badge release fails
      }

      // Update visitor status to checked-out
      const { data, error } = await supabase
        .from('visitors')
        .update({
          status: 'checked_out',
          check_out_time: new Date().toISOString()
        })
        .eq('id', visitorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return this.checkOutVisitor(visitorId);
  }

  // Badge Management Functions
  async assignBadge(visitorId, badgeType = 'visitor') {
    // Find first available badge of the specified type
    const { data: availableBadges, error: fetchError } = await supabase
      .from('badges')
      .select('*')
      .eq('badge_type', badgeType)
      .eq('status', 'available')
      .order('badge_number', { ascending: true })
      .limit(1);

    if (fetchError) throw fetchError;

    if (!availableBadges || availableBadges.length === 0) {
      throw new Error(`No available ${badgeType} badges. Please add more badges to inventory.`);
    }

    const badge = availableBadges[0];

    // Update visitor record with badge info
    const { error: updateVisitorError } = await supabase
      .from('visitors')
      .update({
        badge_id: badge.id,
        badge_number: badge.badge_number
      })
      .eq('id', visitorId);

    if (updateVisitorError) throw updateVisitorError;

    // Update badge status to issued
    const { error: updateBadgeError } = await supabase
      .from('badges')
      .update({
        status: 'issued',
        current_visitor_id: visitorId,
        last_issued_at: new Date().toISOString()
      })
      .eq('id', badge.id);

    if (updateBadgeError) throw updateBadgeError;

    return badge;
  }

  async releaseBadge(visitorId) {
    // Get visitor's badge info
    const { data: visitor, error: visitorError } = await supabase
      .from('visitors')
      .select('badge_id, badge_number')
      .eq('id', visitorId)
      .single();

    if (visitorError) throw visitorError;

    // If visitor has no badge, nothing to release
    if (!visitor.badge_id) {
      return null;
    }

    // Release badge back to inventory
    const { error: updateBadgeError } = await supabase
      .from('badges')
      .update({
        status: 'available',
        current_visitor_id: null
      })
      .eq('id', visitor.badge_id);

    if (updateBadgeError) throw updateBadgeError;

    // Clear badge from visitor record
    const { error: clearVisitorError } = await supabase
      .from('visitors')
      .update({
        badge_id: null,
        badge_number: null
      })
      .eq('id', visitorId);

    if (clearVisitorError) throw clearVisitorError;

    return visitor.badge_number;
  }

  async getAvailableBadges(badgeType = null) {
    if (this.useDirectSupabase) {
      let query = supabase
        .from('badges')
        .select('*')
        .eq('status', 'available')
        .order('badge_number', { ascending: true });

      if (badgeType) {
        query = query.eq('badge_type', badgeType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return this.request(`/badges?status=available${badgeType ? `&type=${badgeType}` : ''}`);
  }

  async getBadgeStats() {
    if (this.useDirectSupabase) {
      const { data, error } = await supabase
        .from('badges')
        .select('badge_type, status');

      if (error) throw error;

      // Calculate stats
      const stats = {
        total: data.length,
        available: data.filter(b => b.status === 'available').length,
        issued: data.filter(b => b.status === 'issued').length,
        lost: data.filter(b => b.status === 'lost').length,
        damaged: data.filter(b => b.status === 'damaged').length,
        byType: {}
      };

      // Group by type
      ['visitor', 'contractor', 'vip', 'delivery'].forEach(type => {
        const typeBadges = data.filter(b => b.badge_type === type);
        stats.byType[type] = {
          total: typeBadges.length,
          available: typeBadges.filter(b => b.status === 'available').length,
          issued: typeBadges.filter(b => b.status === 'issued').length
        };
      });

      return stats;
    }
    return this.request('/badges/stats');
  }

  async notifyHost(visitorId, message) {
    return this.request('/notify-host', {
      method: 'POST',
      body: JSON.stringify({ visitorId, message }),
    });
  }

  // Real-time subscriptions
  subscribeToVisitors(callback) {
    return supabase
      .channel('visitors-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'visitors' },
        callback
      )
      .subscribe();
  }

  subscribeToBadges(callback) {
    return supabase
      .channel('badges-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'badges' },
        callback
      )
      .subscribe();
  }

  subscribeToNotifications(callback) {
    return supabase
      .channel('notifications-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        callback
      )
      .subscribe();
  }

  // Evacuation feature (UAC House requirement)
  async getCheckedInVisitors() {
    // Use direct query instead of RPC to match status values
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('status', 'checked_in')
      .order('floor_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Blacklist management (UAC House requirement)
  async getBlacklist() {
    const { data, error } = await supabase
      .from('blacklist')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Floor Management APIs
  async getFloors() {
    if (this.useDirectSupabase) {
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .order('number');
      if (error) throw error;
      return data;
    }
    return this.request('/floors');
  }

  async createFloor(floorData) {
    if (this.useDirectSupabase) {
      const { data, error } = await supabase
        .from('floors')
        .insert([floorData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return this.request('/floors', {
      method: 'POST',
      body: JSON.stringify(floorData)
    });
  }

  async deleteFloor(floorId) {
    if (this.useDirectSupabase) {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', floorId);
      if (error) throw error;
      return true;
    }
    return this.request(`/floors/${floorId}`, {
      method: 'DELETE'
    });
  }

  async addToBlacklist(visitorData, reason) {
    const { data, error } = await supabase
      .from('blacklist')
      .insert({
        name: visitorData.name,
        email: visitorData.email,
        phone: visitorData.phone,
        reason: reason,
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkBlacklist(email, phone) {
    const { data, error } = await supabase
      .from('blacklist')
      .select('*')
      .eq('active', true)
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(1);

    if (error) throw error;
    return data.length > 0 ? data[0] : null;
  }

  // Badge Management APIs
  async assignBadgeToVisitor(badgeId, visitorId, notes = '') {
    const { data, error } = await supabase
      .rpc('assign_badge_to_visitor', {
        p_badge_id: badgeId,
        p_visitor_id: visitorId,
        p_notes: notes
      });

    if (error) throw error;
    return data;
  }

  async returnBadge(badgeId) {
    // Use backend API for badge return
    return this.request(`/badges/${badgeId}/return`, {
      method: 'POST'
    });
  }

  async createBadge(badgeData) {
    if (this.useDirectSupabase) {
      const { data, error } = await supabase
        .from('badges')
        .insert([{
          badge_number: badgeData.badge_number,
          badge_type: badgeData.type || 'visitor',
          status: badgeData.status || 'available'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return this.request('/badges', {
      method: 'POST',
      body: JSON.stringify(badgeData)
    });
  }

  async updateBadgeStatus(badgeId, status) {
    // Use backend API for status update
    return this.request(`/badges/${badgeId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Visitor Approval APIs
  async getPendingApprovals(hostId = null) {
    let query = supabase
      .from('visitor_approvals')
      .select(`
        *,
        visitor:visitors(*),
        host:hosts(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (hostId) {
      query = query.eq('host_id', hostId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async approveVisitor(approvalId, notes = '') {
    const { data, error } = await supabase
      .rpc('approve_visitor', {
        p_approval_id: approvalId,
        p_notes: notes
      });

    if (error) throw error;
    return data;
  }

  async rejectVisitor(approvalId, reason) {
    const { data, error } = await supabase
      .from('visitor_approvals')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        approved_rejected_at: new Date().toISOString()
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // User Management APIs
  async getUsers(filters = {}) {
    if (this.useDirectSupabase) {
      let query = supabase
        .from('users')
        .select('*, tenant:tenants(id, name, floor_number)')
        .order('created_at', { ascending: false });

      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    return this.request('/users');
  }

  async getUser(id) {
    if (this.useDirectSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*, tenant:tenants(id, name, floor_number)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    if (this.useDirectSupabase) {
      // Use Edge Function for user creation (bypasses rate limits and uses admin API)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to create users')
      }

      const response = await fetch(`${this.supabaseUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create user')
      }

      return result.user
    }
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, updates) {
    if (this.useDirectSupabase) {
      // If password update is requested, we MUST use the Edge Function
      if (updates.password) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('You must be logged in to update users');

        const response = await fetch(`${this.supabaseUrl}/functions/v1/update-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...updates })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update user password');
        }

        return result.user;
      }

      // Standard update for non-sensitive fields
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(id) {
    if (this.useDirectSupabase) {
      // Use edge function to delete user from both auth and database
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${this.supabaseUrl}/functions/v1/delete-user/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }

      return result;
    }
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Audit Logs APIs
  async getAuditLogs(filters = {}) {
    // For now, return empty array as audit_logs table may not exist yet
    // TODO: Implement when audit_logs table is created
    return [];
  }

  async healthCheck() {
    return this.request('/health');
  }

  // Super Admin APIs
  async getSuperAdminStats() {
    return this.request('/super-admin/stats');
  }

  async getOrganizations() {
    return this.request('/super-admin/organizations');
  }

  async createOrganization(data) {
    return this.request('/super-admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTransactions() {
    return this.request('/super-admin/transactions');
  }
}

export default new ApiService();