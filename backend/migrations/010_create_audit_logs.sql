-- Migration: Create audit logs table
-- Description: Track all system activities and changes for compliance and debugging

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    resource_type VARCHAR(50) NOT NULL, -- visitors, badges, users, etc.
    resource_id UUID, -- ID of the affected resource
    old_values JSONB, -- Previous state (for updates/deletes)
    new_values JSONB, -- New state (for creates/updates)
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    details TEXT, -- Additional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS Policy
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin can see all audit logs
CREATE POLICY "audit_logs_admin_access" ON audit_logs
    FOR ALL USING (
        auth.jwt() ->> 'email' LIKE '%admin%' OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can see their own audit logs
CREATE POLICY "audit_logs_user_access" ON audit_logs
   FOR SELECT USING (user_id = auth.uid());

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        details
    ) VALUES (
        auth.uid(),
        p_action,
        p_resource_type,
        p_resource_id,
        p_old_values,
        p_new_values,
       p_details
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$;
