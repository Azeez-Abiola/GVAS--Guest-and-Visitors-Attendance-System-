-- Migration: Create system settings table
-- Description: Store application configuration and settings

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- general, notifications, security, badges, etc.
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can non-admin users read this setting?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category, setting_key)
);

-- Default system settings
INSERT INTO system_settings (category, setting_key, setting_value, data_type, description, is_public) VALUES
-- General Settings
('general', 'building_name', 'UAC House', 'string', 'Name of the building', true),
('general', 'building_floors', '12', 'number', 'Total number of floors', true),
('general', 'max_visitors_per_floor', '50', 'number', 'Maximum visitors allowed per floor', false),
('general', 'visitor_check_in_timeout', '15', 'number', 'Minutes before visitor check-in times out', false),
('general', 'auto_logout_time', '8', 'number', 'Hours of inactivity before auto logout', false),

-- Badge Settings
('badges', 'total_badges', '50', 'number', 'Total number of physical badges available', false),
('badges', 'badge_return_reminder', '4', 'number', 'Hours before badge return reminder', false),
('badges', 'auto_return_badges', 'true', 'boolean', 'Automatically return badges after visitor checkout', false),

-- Security Settings  
('security', 'photo_required', 'false', 'boolean', 'Require visitor photo during check-in', false),
('security', 'id_verification_required', 'false', 'boolean', 'Require ID verification for visitors', false),
('security', 'blacklist_auto_check', 'true', 'boolean', 'Automatically check visitors against blacklist', false),
('security', 'max_visit_duration', '8', 'number', 'Maximum visit duration in hours', false),

-- Notification Settings
('notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications', false),
('notifications', 'sms_enabled', 'false', 'boolean', 'Enable SMS notifications', false),
('notifications', 'host_arrival_notification', 'true', 'boolean', 'Notify hosts when visitors arrive', false),
('notifications', 'daily_summary_email', 'true', 'boolean', 'Send daily visitor summary email', false),
('notifications', 'email_from_address', 'noreply@uachouse.com', 'string', 'From address for system emails', false),

-- Emergency Settings
('emergency', 'evacuation_auto_print', 'true', 'boolean', 'Auto-print evacuation list during emergency', false),
('emergency', 'emergency_contact_phone', '+234-XXX-XXXX', 'string', 'Emergency contact phone number', true),
('emergency', 'evacuation_refresh_interval', '10', 'number', 'Seconds between evacuation list refreshes', false),

-- Integration Settings
('integrations', 'access_control_enabled', 'false', 'boolean', 'Enable access control system integration', false),
('integrations', 'camera_system_enabled', 'false', 'boolean', 'Enable camera system integration', false),
('integrations', 'elevator_control_enabled', 'false', 'boolean', 'Enable elevator access control', false);

-- Indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);

-- RLS Policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage all settings
CREATE POLICY "system_settings_admin_access" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- All authenticated users can read public settings
CREATE POLICY "system_settings_public_read" ON system_settings
    FOR SELECT USING (
        is_public = true AND auth.uid() IS NOT NULL
    );

-- Function to get setting value with default
CREATE OR REPLACE FUNCTION get_setting(
    p_category TEXT,
    p_key TEXT,
    p_default TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_value TEXT;
BEGIN
    SELECT setting_value INTO v_value
    FROM system_settings
    WHERE category = p_category AND setting_key = p_key;
    
    RETURN COALESCE(v_value, p_default);
END;
$$;

-- Function to update setting
CREATE OR REPLACE FUNCTION update_setting(
    p_category TEXT,
    p_key TEXT,
    p_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can update settings';
    END IF;
    
    INSERT INTO system_settings (category, setting_key, setting_value, updated_at)
    VALUES (p_category, p_key, p_value, NOW())
    ON CONFLICT (category, setting_key) 
    DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = NOW();
    
    -- Log the change
    PERFORM create_audit_log(
        'UPDATE',
        'system_settings',
        NULL,
        NULL,
        jsonb_build_object('category', p_category, 'key', p_key, 'value', p_value),
        'Setting updated: ' || p_category || '.' || p_key
    );
    
    RETURN TRUE;
END;
$$;