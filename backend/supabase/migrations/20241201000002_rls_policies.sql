-- Row Level Security (RLS) Policies for GVAS
-- Migration: Security Policies
-- Date: 2024-12-01

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TENANTS POLICIES
-- =====================================================

-- Anyone can view active tenants (for host selection)
CREATE POLICY "Allow public read access to active tenants"
    ON tenants FOR SELECT
    USING (active = TRUE);

-- Only admins can insert/update/delete tenants
CREATE POLICY "Allow admins to manage tenants"
    ON tenants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE hosts.email = auth.jwt() ->> 'email'
            AND hosts.role = 'admin'
        )
    );

-- =====================================================
-- HOSTS POLICIES
-- =====================================================

-- Hosts can view other hosts in their tenant
CREATE POLICY "Hosts can view hosts in their tenant"
    ON hosts FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM hosts
            WHERE email = auth.jwt() ->> 'email'
        )
        OR
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('admin', 'security')
        )
    );

-- Hosts can update their own profile
CREATE POLICY "Hosts can update their own profile"
    ON hosts FOR UPDATE
    USING (email = auth.jwt() ->> 'email');

-- Admins can manage all hosts
CREATE POLICY "Admins can manage hosts"
    ON hosts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role = 'admin'
        )
    );

-- =====================================================
-- BADGES POLICIES
-- =====================================================

-- Reception and security can view all badges
CREATE POLICY "Reception and security can view badges"
    ON badges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- Reception and security can manage badges
CREATE POLICY "Reception and security can manage badges"
    ON badges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- =====================================================
-- VISITORS POLICIES
-- =====================================================

-- Hosts can view visitors they created or are hosting
CREATE POLICY "Hosts can view their visitors"
    ON visitors FOR SELECT
    USING (
        host_id IN (
            SELECT id FROM hosts
            WHERE email = auth.jwt() ->> 'email'
        )
        OR
        created_by IN (
            SELECT id FROM hosts
            WHERE email = auth.jwt() ->> 'email'
        )
        OR
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- Hosts can create visitors
CREATE POLICY "Hosts can create visitors"
    ON visitors FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND active = TRUE
        )
    );

-- Hosts can update their own visitors (before check-in)
CREATE POLICY "Hosts can update their visitors"
    ON visitors FOR UPDATE
    USING (
        (
            created_by IN (
                SELECT id FROM hosts
                WHERE email = auth.jwt() ->> 'email'
            )
            AND status IN ('pending', 'pre-registered')
        )
        OR
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- Reception and security can manage all visitors
CREATE POLICY "Reception can manage visitors"
    ON visitors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- =====================================================
-- VISITOR APPROVALS POLICIES
-- =====================================================

-- Hosts can view approvals for their visitors
CREATE POLICY "Hosts can view their visitor approvals"
    ON visitor_approvals FOR SELECT
    USING (
        host_id IN (
            SELECT id FROM hosts
            WHERE email = auth.jwt() ->> 'email'
        )
        OR
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('admin', 'security')
        )
    );

-- Hosts can approve/reject their visitors
CREATE POLICY "Hosts can approve visitors"
    ON visitor_approvals FOR ALL
    USING (
        host_id IN (
            SELECT id FROM hosts
            WHERE email = auth.jwt() ->> 'email'
        )
        OR
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('admin', 'security')
        )
    );

-- =====================================================
-- BLACKLIST POLICIES
-- =====================================================

-- Security and admins can view blacklist
CREATE POLICY "Security can view blacklist"
    ON blacklist FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('security', 'admin')
        )
    );

-- Only admins and security can manage blacklist
CREATE POLICY "Security can manage blacklist"
    ON blacklist FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('security', 'admin')
        )
    );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT
    USING (
        host_id IN (
            SELECT id FROM hosts
            WHERE email = auth.jwt() ->> 'email'
        )
        OR
        recipient_email = auth.jwt() ->> 'email'
        OR
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('admin', 'reception')
        )
    );

-- System can insert notifications (service role only)
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (TRUE); -- Service role will handle this

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('admin', 'security')
        )
    );

-- System can insert audit logs
CREATE POLICY "System can create audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (TRUE);

-- =====================================================
-- BADGE HISTORY POLICIES
-- =====================================================

-- Reception and security can view badge history
CREATE POLICY "Reception can view badge history"
    ON badge_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- Reception and security can manage badge history
CREATE POLICY "Reception can manage badge history"
    ON badge_history FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hosts
            WHERE email = auth.jwt() ->> 'email'
            AND role IN ('reception', 'security', 'admin')
        )
    );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant access to service role (for backend operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
