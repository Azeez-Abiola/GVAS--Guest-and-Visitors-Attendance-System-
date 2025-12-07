import { supabase } from '../lib/supabase';

const API_BASE = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.useDirectSupabase = true; // Toggle to use Supabase directly or via backend API
    this.supabase = supabase; // Expose supabase for direct access when needed
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Supabase project URL for edge functions
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

  // Hosts - Query users table with role='host'
  async getHosts() {
    if (this.useDirectSupabase) {
      // Query users table for host role, then join with hosts table for floor info
      const { data: hostUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, phone, is_active')
        .eq('role', 'host')
        .eq('is_active', true)
        .order('full_name');
      
      if (usersError) throw usersError;
      
      // Get additional host details from hosts table
      const { data: hostDetails, error: hostsError } = await supabase
        .from('hosts')
        .select('email, floor_number, office_number')
        .eq('active', true);
      
      if (hostsError) throw hostsError;
      
      // Merge the data
      const hosts = hostUsers.map(user => {
        const details = hostDetails?.find(h => h.email === user.email) || {};
        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          floor_number: details.floor_number || null,
          office_number: details.office_number || '',
          active: user.is_active,
          tenant: null // Can be populated if needed
        };
      });
      
      return hosts;
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
      
      if (data.host_id) {
        console.log('Looking up host with ID:', data.host_id);
        
        const { data: host, error: hostError } = await supabase
          .from('hosts')
          .select('tenant_id, name')
          .eq('id', data.host_id)
          .single();
        
        console.log('Host lookup result:', { host, hostError });
        
        if (hostError || !host) {
          console.error('Failed to fetch host details:', hostError);
          throw new Error(`Invalid host selected or host not found: ${hostError?.message || 'Host not found'}`);
        }
        
        // Populate all required fields from host
        visitorData.tenant_id = host.tenant_id;
        visitorData.host_name = host.name;
        
        console.log('Populated visitor data:', { tenant_id: visitorData.tenant_id, host_name: visitorData.host_name });
      } else {
        throw new Error('host_id is required');
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
      
      // Ensure all required fields are present
      const requiredFields = ['name', 'email', 'phone', 'host_id', 'host_name', 'tenant_id', 'visitor_id', 'purpose'];
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
      return visitor;
    }
    return this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
}

export default new ApiService();