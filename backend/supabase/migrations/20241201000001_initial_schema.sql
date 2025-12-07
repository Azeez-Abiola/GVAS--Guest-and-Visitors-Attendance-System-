-- GVAS Complete Database Schema for UAC House Multi-Tenant Building
-- Migration: Initial Schema
-- Date: 2024-12-01

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TENANTS TABLE (Companies on each floor)

-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    floor_number INTEGER NOT NULL CHECK (floor_number >= 1 AND floor_number <= 12),
    company_logo TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenants_floor ON tenants(floor_number);
CREATE INDEX idx_tenants_active ON tenants(active);

-- =====================================================
-- 2. HOSTS TABLE (Employees/Representatives)
-- =====================================================
CREATE TABLE IF NOT EXISTS hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    office_number TEXT,
    floor_number INTEGER NOT NULL CHECK (floor_number >= 1 AND floor_number <= 12),
    role TEXT DEFAULT 'host', -- host, admin, security, reception
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hosts_tenant ON hosts(tenant_id);
CREATE INDEX idx_hosts_email ON hosts(email);
CREATE INDEX idx_hosts_floor ON hosts(floor_number);
CREATE INDEX idx_hosts_active ON hosts(active);

-- =====================================================
-- 3. BADGES TABLE (Physical badge inventory)
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_number TEXT UNIQUE NOT NULL,
    badge_type TEXT NOT NULL, -- visitor, contractor, vip, delivery
    color_code TEXT, -- red, blue, green, yellow
    status TEXT DEFAULT 'available', -- available, issued, lost, damaged
    current_visitor_id UUID,
    last_issued_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_status ON badges(status);
CREATE INDEX idx_badges_type ON badges(badge_type);
CREATE INDEX idx_badges_number ON badges(badge_number);

-- =====================================================
-- 4. VISITORS TABLE (Main visitor records)
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT UNIQUE NOT NULL, -- V1234 format
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    
    -- Host & Tenant Info
    host_id UUID REFERENCES hosts(id),
    host_name TEXT NOT NULL, -- Denormalized for quick access
    tenant_id UUID REFERENCES tenants(id),
    floor_number INTEGER CHECK (floor_number >= 1 AND floor_number <= 12),
    
    -- Visit Details
    purpose TEXT NOT NULL,
    expected_duration INTEGER, -- in minutes
    
    -- Identity & Security
    photo TEXT, -- base64 or URL
    id_photo TEXT, -- government ID photo
    signature TEXT, -- base64 signature
    
    -- Badge Assignment
    badge_id UUID REFERENCES badges(id),
    badge_number TEXT,
    
    -- Status & Timestamps
    status TEXT DEFAULT 'pending', -- pending, pre-registered, checked-in, checked-out, cancelled
    approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    expected_checkout_time TIMESTAMP WITH TIME ZONE,
    
    -- Consent & Privacy
    consent_given BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    privacy_notice_accepted BOOLEAN DEFAULT FALSE,
    
    -- Pre-registration
    qr_code TEXT,
    guest_code TEXT UNIQUE, -- 8-character code
    invitation_sent BOOLEAN DEFAULT FALSE,
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Escort & Security
    requires_escort BOOLEAN DEFAULT FALSE,
    escort_assigned TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES hosts(id)
);

CREATE INDEX idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX idx_visitors_guest_code ON visitors(guest_code);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_approval_status ON visitors(approval_status);
CREATE INDEX idx_visitors_host ON visitors(host_id);
CREATE INDEX idx_visitors_tenant ON visitors(tenant_id);
CREATE INDEX idx_visitors_floor ON visitors(floor_number);
CREATE INDEX idx_visitors_check_in ON visitors(check_in_time);
CREATE INDEX idx_visitors_check_out ON visitors(check_out_time);
CREATE INDEX idx_visitors_created_at ON visitors(created_at);

-- =====================================================
-- 5. VISITOR_APPROVALS TABLE (Approval workflow)
-- =====================================================
CREATE TABLE IF NOT EXISTS visitor_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    host_id UUID REFERENCES hosts(id),
    status TEXT NOT NULL, -- pending, approved, rejected
    approved_by UUID REFERENCES hosts(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approvals_visitor ON visitor_approvals(visitor_id);
CREATE INDEX idx_approvals_host ON visitor_approvals(host_id);
CREATE INDEX idx_approvals_status ON visitor_approvals(status);

-- =====================================================
-- 6. BLACKLIST TABLE (Restricted visitors)
-- =====================================================
CREATE TABLE IF NOT EXISTS blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    id_number TEXT, -- national ID or passport
    reason TEXT NOT NULL,
    added_by UUID REFERENCES hosts(id),
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blacklist_name ON blacklist(name);
CREATE INDEX idx_blacklist_email ON blacklist(email);
CREATE INDEX idx_blacklist_phone ON blacklist(phone);
CREATE INDEX idx_blacklist_active ON blacklist(active);

-- =====================================================
-- 7. NOTIFICATIONS TABLE (Email/SMS queue)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES visitors(id),
    host_id UUID REFERENCES hosts(id),
    type TEXT NOT NULL, -- email, sms, push
    template TEXT NOT NULL, -- invitation, arrival, checkout, approval_request
    recipient_email TEXT,
    recipient_phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_visitor ON notifications(visitor_id);
CREATE INDEX idx_notifications_host ON notifications(host_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);

-- =====================================================
-- 8. AUDIT_LOGS TABLE (Complete activity tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL, -- check_in, check_out, pre_register, approve, reject, badge_issue, badge_return
    entity_type TEXT NOT NULL, -- visitor, badge, host, tenant
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 9. BADGE_HISTORY TABLE (Badge assignment tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS badge_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_id UUID REFERENCES badges(id),
    visitor_id UUID REFERENCES visitors(id),
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    issued_by UUID REFERENCES hosts(id),
    return_condition TEXT, -- good, damaged, lost
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badge_history_badge ON badge_history(badge_id);
CREATE INDEX idx_badge_history_visitor ON badge_history(visitor_id);
CREATE INDEX idx_badge_history_issued_at ON badge_history(issued_at);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON hosts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blacklist_updated_at BEFORE UPDATE ON blacklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate visitor ID (V1234 format)
CREATE OR REPLACE FUNCTION generate_visitor_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    id_exists BOOLEAN;
BEGIN
    LOOP
        new_id := 'V' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM visitors WHERE visitor_id = new_id) INTO id_exists;
        EXIT WHEN NOT id_exists;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate guest code (8 characters)
CREATE OR REPLACE FUNCTION generate_guest_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing characters
    result TEXT := '';
    i INTEGER;
    code_exists BOOLEAN;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
        END LOOP;
        SELECT EXISTS(SELECT 1 FROM visitors WHERE guest_code = result) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if visitor is blacklisted
CREATE OR REPLACE FUNCTION is_visitor_blacklisted(
    p_name TEXT,
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blacklist
        WHERE active = TRUE
        AND (
            LOWER(name) = LOWER(p_name)
            OR (p_email IS NOT NULL AND LOWER(email) = LOWER(p_email))
            OR (p_phone IS NOT NULL AND phone = p_phone)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA FOR UAC HOUSE
-- =====================================================

-- Insert sample tenants (12 floors)
INSERT INTO tenants (name, floor_number, contact_email, contact_phone) VALUES
('UAC Foods Limited', 1, 'contact@uacfoods.com', '+234-1-2345001'),
('Grand Cereals Limited', 2, 'info@grandcereals.com', '+234-1-2345002'),
('UAC Property Development Company', 3, 'property@uac.com', '+234-1-2345003'),
('Portland Paints & Products', 4, 'sales@portlandpaints.com', '+234-1-2345004'),
('UAC Restaurants', 5, 'info@uacrestaurants.com', '+234-1-2345005'),
('Champion Breweries', 6, 'contact@championbreweries.com', '+234-1-2345006'),
('UPDC Facilities Management', 7, 'facilities@updc.com', '+234-1-2345007'),
('UAC Energy & Logistics', 8, 'energy@uac.com', '+234-1-2345008'),
('MDS Logistics Limited', 9, 'logistics@mds.com', '+234-1-2345009'),
('UAC Corporate Services', 10, 'corporate@uac.com', '+234-1-2345010'),
('UAC Finance & Investment', 11, 'finance@uac.com', '+234-1-2345011'),
('UAC Executive Management', 12, 'executive@uac.com', '+234-1-2345012')
ON CONFLICT DO NOTHING;

-- Insert sample hosts for each tenant
INSERT INTO hosts (tenant_id, name, email, phone, office_number, floor_number, role)
SELECT 
    t.id,
    'John Smith',
    'john.smith@' || LOWER(REPLACE(t.name, ' ', '')) || '.com',
    '+234-800-' || LPAD((t.floor_number * 1000)::TEXT, 4, '0'),
    t.floor_number || 'A',
    t.floor_number,
    'host'
FROM tenants t
ON CONFLICT (email) DO NOTHING;

-- Insert sample badge inventory
INSERT INTO badges (badge_number, badge_type, color_code, status) VALUES
('VIS-001', 'visitor', 'blue', 'available'),
('VIS-002', 'visitor', 'blue', 'available'),
('VIS-003', 'visitor', 'blue', 'available'),
('VIS-004', 'visitor', 'blue', 'available'),
('VIS-005', 'visitor', 'blue', 'available'),
('CON-001', 'contractor', 'yellow', 'available'),
('CON-002', 'contractor', 'yellow', 'available'),
('VIP-001', 'vip', 'gold', 'available'),
('VIP-002', 'vip', 'gold', 'available'),
('DEL-001', 'delivery', 'green', 'available')
ON CONFLICT (badge_number) DO NOTHING;

COMMENT ON TABLE tenants IS 'Companies occupying each floor of UAC House';
COMMENT ON TABLE hosts IS 'Employee representatives who can invite and manage visitors';
COMMENT ON TABLE badges IS 'Physical badge inventory for visitor identification';
COMMENT ON TABLE visitors IS 'Complete visitor records including pre-registration and check-in/out';
COMMENT ON TABLE visitor_approvals IS 'Host approval workflow for pre-registered visitors';
COMMENT ON TABLE blacklist IS 'Restricted visitors who should not be allowed entry';
COMMENT ON TABLE notifications IS 'Email/SMS notification queue and delivery status';
COMMENT ON TABLE audit_logs IS 'Complete activity audit trail for compliance';
COMMENT ON TABLE badge_history IS 'Historical record of badge issuance and returns';
