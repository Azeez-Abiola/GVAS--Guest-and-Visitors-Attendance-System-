require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');


const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only check for env vars at runtime, not during Vercel build
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
  console.log('📊 Database: Supabase PostgreSQL');
} else {
  console.warn('⚠️ Supabase credentials not found - some features will not work');
}

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes

// Get all hosts
app.get('/api/hosts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hosts')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pre-register visitor
app.post('/api/pre-register', async (req, res) => {
  try {
    const { name, email, phone, company, host, purpose, visitor_id } = req.body;

    // Generate QR code
    const visitorId = visitor_id || await generateVisitorId();
    const guestCode = await generateGuestCode();
    const qrData = JSON.stringify({ id: visitorId, type: 'pre-registered', guestCode });
    const qrCode = await QRCode.toDataURL(qrData);

    // Get host details
    const { data: hostData, error: hostError } = await supabase
      .from('hosts')
      .select('id, name, tenant_id, floor_number')
      .eq('name', host)
      .single();

    if (hostError) {
      console.error('Host lookup error:', hostError);
    }

    // Insert visitor
    const { data, error } = await supabase
      .from('visitors')
      .insert([{
        visitor_id: visitorId,
        name,
        email,
        phone,
        company,
        host_id: hostData?.id,
        host_name: host,
        tenant_id: hostData?.tenant_id,
        floor_number: hostData?.floor_number,
        purpose,
        qr_code: qrCode,
        guest_code: guestCode,
        status: 'pre-registered',
        approval_status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      visitor_id: visitorId,
      qrCode,
      message: 'Visitor pre-registered successfully',
      guestCode
    });
  } catch (error) {
    console.error('Pre-registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get visitor by ID (for QR scan or code lookup)
app.get('/api/visitor/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by visitor_id or guest_code
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .or(`visitor_id.eq.${id},guest_code.ilike.${id}%,id.eq.${id}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check-in visitor (walk-in or pre-registered)
app.post('/api/checkin', async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      phone,
      company,
      host,
      purpose,
      photo,
      signature,
      consentGiven,
      isPreRegistered = false
    } = req.body;

    const checkInTime = new Date().toISOString();
    const consentTimestamp = consentGiven ? checkInTime : null;

    if (isPreRegistered) {
      // Update existing pre-registered visitor
      const { data, error } = await supabase
        .from('visitors')
        .update({
          photo,
          signature,
          consent_given: consentGiven,
          consent_timestamp: consentTimestamp,
          status: 'checked-in',
          check_in_time: checkInTime
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Pre-registered visitor not found' });
        }
        throw error;
      }

      res.json({
        id: data.id,
        visitor_id: data.visitor_id,
        status: 'checked-in',
        checkInTime,
        message: 'Pre-registered visitor checked in successfully'
      });
    } else {
      // Create new walk-in visitor
      const visitorId = await generateVisitorId();

      // Get host details
      const { data: hostData } = await supabase
        .from('hosts')
        .select('id, name, tenant_id, floor_number')
        .eq('name', host)
        .single();

      const { data, error } = await supabase
        .from('visitors')
        .insert([{
          visitor_id: visitorId,
          name,
          email,
          phone,
          company,
          host_id: hostData?.id,
          host_name: host,
          tenant_id: hostData?.tenant_id,
          floor_number: hostData?.floor_number,
          purpose,
          photo,
          signature,
          consent_given: consentGiven,
          consent_timestamp: consentTimestamp,
          status: 'checked-in',
          check_in_time: checkInTime
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: data.id,
        visitor_id: visitorId,
        status: 'checked-in',
        checkInTime,
        message: 'Walk-in visitor checked in successfully'
      });
    }
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all visitors with filters
app.get('/api/visitors', async (req, res) => {
  try {
    const { status, date, limit = 100 } = req.query;

    let query = supabase
      .from('visitors')
      .select('*');

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('created_at', today.toISOString());
    }

    // Apply limit and order
    query = query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send guest invitation
app.post('/api/invite-guest', async (req, res) => {
  try {
    const { guestEmail, guestName, hostName, hostId, personalMessage, registrationLink } = req.body;

    if (!guestEmail || !registrationLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Configure transporter
    // Note: In production, use environment variables
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@gvas-system.com',
      to: guestEmail,
      subject: `Invitation to visit ${hostName || 'us'} at UAC House`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0f172a; text-align: center;">You're Invited!</h2>
          <p>Dear ${guestName || 'Guest'},</p>
          <p>${hostName ? `<strong>${hostName}</strong>` : 'A host'} has invited you to complete your pre-registration for a visit to UAC House.</p>
          
          ${personalMessage ? `<p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; font-style: italic;">"${personalMessage}"</p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Registration</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">
            Pre-registering will speed up your check-in process upon arrival. You'll receive a QR code pass immediately after registration.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Guest & Visitors Attendance System (GVAS)
          </p>
        </div>
      `
    };

    // If credentials are not set, just log it (development mode)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ EMAIL_USER or EMAIL_PASS not set. Skipping actual email send.');
      console.log('📧 Mock Email Payload:', JSON.stringify(mailOptions, null, 2));
      return res.json({
        success: true,
        message: 'Invitation logged (Email credentials not configured)',
        mock: true
      });
    }

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Invitation email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send invitation email' });
  }
});

// Notify host
app.post('/api/notify-host', async (req, res) => {
  try {
    const { visitorId, message } = req.body;

    // Create notification record
    const { data: visitor } = await supabase
      .from('visitors')
      .select('*, hosts(*)')
      .eq('id', visitorId)
      .single();

    if (visitor && visitor.hosts) {
      await supabase
        .from('notifications')
        .insert([{
          visitor_id: visitorId,
          host_id: visitor.host_id,
          type: 'email',
          template: 'visitor_arrival',
          recipient_email: visitor.hosts.email,
          subject: `Guest Arrival: ${visitor.name}`,
          message: message || `${visitor.name} has arrived and is waiting at reception.`,
          status: 'pending'
        }]);
    }

    // For now, just log (real implementation would send actual email/SMS)
    console.log(`Host notification for visitor ${visitorId}: ${message}`);

    res.json({
      success: true,
      message: 'Host notification queued successfully'
    });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check-out visitor
app.post('/api/checkout/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const checkOutTime = new Date().toISOString();

    const { data, error } = await supabase
      .from('visitors')
      .update({
        status: 'checked-out',
        check_out_time: checkOutTime
      })
      .eq('visitor_id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      throw error;
    }

    res.json({
      id: data.id,
      visitor_id: data.visitor_id,
      status: 'checked-out',
      checkOutTime,
      message: 'Visitor checked out successfully'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (error) throw error;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      type: 'Supabase PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Badge Management APIs

// Get all badges with optional status filter
app.get('/api/badges', async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('badges')
      .select(`
        *,
        current_visitor:visitors(id, name, visitor_id)
      `)
      .order('badge_number');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new badge
// Create new badge
app.post('/api/badges', async (req, res) => {
  try {
    const { badge_number, type, status = 'available' } = req.body;

    // Check if badge number already exists
    const { data: existing } = await supabase
      .from('badges')
      .select('id')
      .eq('badge_number', badge_number)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Badge number already exists' });
    }

    const { data, error } = await supabase
      .from('badges')
      .insert([{
        badge_number,
        badge_type: type,
        status
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update badge status
app.patch('/api/badges/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('badges')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating badge status:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Floors API ---

// Get all floors
app.get('/api/floors', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('floors')
      .select('*')
      .order('number');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create floor
app.post('/api/floors', async (req, res) => {
  try {
    const { name, number, type } = req.body;

    // Check if floor number already exists
    const { data: existing } = await supabase
      .from('floors')
      .select('id')
      .eq('number', number)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Floor number already exists' });
    }

    const { data, error } = await supabase
      .from('floors')
      .insert([{ name, number, type }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating floor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete floor
app.delete('/api/floors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('floors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Floor deleted' });
  } catch (error) {
    console.error('Error deleting floor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Return badge (make available again)
app.post('/api/badges/:id/return', async (req, res) => {
  try {
    const { id } = req.params;

    // First, get the badge to find the visitor
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('current_visitor_id')
      .eq('id', id)
      .single();

    if (badgeError) throw badgeError;

    // Update badge to available
    const { data: updatedBadge, error: updateError } = await supabase
      .from('badges')
      .update({
        status: 'available',
        current_visitor_id: null,
        assigned_at: null,
        notes: null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update visitor's badge_id to null
    if (badge.current_visitor_id) {
      await supabase
        .from('visitors')
        .update({ badge_id: null })
        .eq('id', badge.current_visitor_id);
    }

    res.json(updatedBadge);
  } catch (error) {
    console.error('Error returning badge:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tenants
app.get('/api/tenants', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('floor_number');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AUDIT LOGS API ====================

// Get audit logs with filtering
app.get('/api/audit-logs', async (req, res) => {
  try {
    const { action, resource_type, user_id, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users:user_id(email, full_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) query = query.eq('action', action);
    if (resource_type) query = query.eq('resource_type', resource_type);
    if (user_id) query = query.eq('user_id', user_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create audit log entry
app.post('/api/audit-logs', async (req, res) => {
  try {
    const { action, resource_type, resource_id, old_values, new_values, details } = req.body;

    const { data, error } = await supabase.rpc('create_audit_log', {
      p_action: action,
      p_resource_type: resource_type,
      p_resource_id: resource_id,
      p_old_values: old_values,
      p_new_values: new_values,
      p_details: details
    });

    if (error) throw error;
    res.json({ id: data, success: true });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== INCIDENTS API ====================

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const { status, severity, type, assigned_to } = req.query;

    let query = supabase
      .from('incidents')
      .select(`
        *,
        reporter:reported_by(email, full_name),
        assignee:assigned_to(email, full_name),
        visitor:visitor_id(visitor_id, name, company),
        badge:badge_id(badge_number, type)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    if (type) query = query.eq('incident_type', type);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new incident
app.post('/api/incidents', async (req, res) => {
  try {
    const {
      title,
      description,
      incident_type,
      severity = 'medium',
      location,
      visitor_id,
      badge_id,
      occurred_at,
      evidence_photos = []
    } = req.body;

    const { data, error } = await supabase
      .from('incidents')
      .insert([{
        title,
        description,
        incident_type,
        severity,
        location,
        visitor_id,
        badge_id,
        occurred_at,
        evidence_photos
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update incident
app.put('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYSTEM SETTINGS API ====================

// Get system settings
app.get('/api/settings', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update system setting
app.put('/api/settings/:category/:key', async (req, res) => {
  try {
    const { category, key } = req.params;
    const { value } = req.body;

    const { data, error } = await supabase.rpc('update_setting', {
      p_category: category,
      p_key: key,
      p_value: value
    });

    if (error) throw error;
    res.json({ success: data });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DOCUMENTS API ====================

// Get documents for visitor
app.get('/api/documents', async (req, res) => {
  try {
    const { visitor_id, status } = req.query;

    let query = supabase
      .from('documents')
      .select(`
        *,
        verifier:verified_by(email, full_name),
        uploader:uploaded_by(email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (visitor_id) query = query.eq('visitor_id', visitor_id);
    if (status) query = query.eq('verification_status', status);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify document
app.post('/api/documents/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const { data, error } = await supabase.rpc('verify_document', {
      p_document_id: id,
      p_status: status,
      p_notes: notes
    });

    if (error) throw error;
    res.json({ success: data });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS & REPORTS API ====================

// Get analytics data
app.get('/api/analytics/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { period = 'today', from_date, to_date } = req.query;

    const cacheKey = `analytics_${metric}_${period}_${from_date}_${to_date}`;

    // Try to get cached data first
    const { data: cachedData } = await supabase.rpc('get_analytics_cache', {
      p_cache_key: cacheKey,
      p_ttl_minutes: 30
    });

    if (cachedData) {
      return res.json(cachedData);
    }

    // Generate fresh analytics based on metric type
    let analyticsData = {};

    switch (metric) {
      case 'visitor_summary':
        // Get visitor statistics
        const today = new Date().toISOString().split('T')[0];

        const { data: visitors } = await supabase
          .from('visitors')
          .select('*')
          .gte('created_at', today);

        const { data: checkedIn } = await supabase
          .from('visitors')
          .select('*')
          .not('check_in_time', 'is', null)
          .is('check_out_time', null);

        analyticsData = {
          total_today: visitors?.length || 0,
          checked_in: checkedIn?.length || 0,
          checked_out: (visitors?.length || 0) - (checkedIn?.length || 0),
          badge_usage: checkedIn?.filter(v => v.badge_number).length || 0
        };
        break;

      case 'floor_distribution':
        const { data: floorData } = await supabase
          .from('visitors')
          .select(`
            *,
            hosts:host_id(tenant_id),
            tenants:hosts.tenant_id(floor_number)
          `)
          .not('check_in_time', 'is', null)
          .is('check_out_time', null);

        analyticsData = floorData?.reduce((acc, visitor) => {
          const floor = visitor.hosts?.tenants?.floor_number || 'Unknown';
          acc[floor] = (acc[floor] || 0) + 1;
          return acc;
        }, {}) || {};
        break;

      default:
        analyticsData = { message: 'Metric not implemented yet' };
    }

    // Cache the result
    await supabase.rpc('set_analytics_cache', {
      p_cache_key: cacheKey,
      p_data: analyticsData,
      p_ttl_minutes: 30
    });

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get report templates
app.get('/api/reports/templates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate report
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { template_id, parameters, date_range_start, date_range_end } = req.body;

    // For now, return mock data - implement actual report generation later
    const reportData = {
      summary: { total: 100, change: '+5%' },
      data: [
        { date: '2025-12-01', visitors: 45 },
        { date: '2025-12-02', visitors: 52 },
        { date: '2025-12-03', visitors: 38 }
      ]
    };

    const { data, error } = await supabase
      .from('generated_reports')
      .insert([{
        template_id,
        name: `Report ${new Date().toISOString().split('T')[0]}`,
        data: reportData,
        parameters,
        date_range_start,
        date_range_end,
        status: 'completed'
      }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SUPER ADMIN APIs ====================

// Get platform-wide stats (Revenue, Clients, Visitors)
app.get('/api/super-admin/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_stats')
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Super Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all organizations
app.get('/api/super-admin/organizations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Super Admin organizations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new organization
app.post('/api/super-admin/organizations', async (req, res) => {
  try {
    const orgData = req.body;
    const { data, error } = await supabase
      .from('system_organizations')
      .insert([orgData])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Super Admin org creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions/subscriptions
app.get('/api/super-admin/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_subscriptions')
      .select(`
        *,
        organization:org_id(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Super Admin transactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function generateVisitorId() {
  const { data, error } = await supabase.rpc('generate_visitor_id');
  if (error) {
    // Fallback if function doesn't exist
    return 'V' + Math.floor(1000 + Math.random() * 9000);
  }
  return data;
}

async function generateGuestCode() {
  const { data, error } = await supabase.rpc('generate_guest_code');
  if (error) {
    // Fallback if function doesn't exist
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  return data;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only when running directly (not when imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Guest Experience API running on port ${PORT}`);
    console.log(`📊 Database: Supabase PostgreSQL`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Supabase URL: ${supabaseUrl}`);
  });
}

// Export for Vercel serverless
module.exports = app;