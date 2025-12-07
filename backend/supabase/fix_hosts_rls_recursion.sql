-- Fix infinite recursion in hosts table RLS policies
-- The issue: Policies on 'hosts' table were querying 'hosts' table itself
-- Solution: Use the 'users' table instead for role checking

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow admins to manage tenants" ON tenants;
DROP POLICY IF EXISTS "Hosts can view hosts in their tenant" ON hosts;
DROP POLICY IF EXISTS "Admins can manage hosts" ON hosts;
DROP POLICY IF EXISTS "Reception and security can view badges" ON badges;
DROP POLICY IF EXISTS "Reception and security can manage badges" ON badges;
DROP POLICY IF EXISTS "Hosts can view their visitors" ON visitors;
DROP POLICY IF EXISTS "Hosts can create visitors" ON visitors;
DROP POLICY IF EXISTS "Hosts can update their visitors" ON visitors;
DROP POLICY IF EXISTS "Reception can manage visitors" ON visitors;
DROP POLICY IF EXISTS "Hosts can view their visitor approvals" ON visitor_approvals;
DROP POLICY IF EXISTS "Hosts can approve visitors" ON visitor_approvals;
DROP POLICY IF EXISTS "Security can view blacklist" ON blacklist;
DROP POLICY IF EXISTS "Security can manage blacklist" ON blacklist;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Reception can view badge history" ON badge_history;
DROP POLICY IF EXISTS "Reception can manage badge history" ON badge_history;

-- =====================================================
-- FIXED POLICIES USING 'users' TABLE
-- =====================================================

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TENANTS POLICIES
-- =====================================================

CREATE POLICY "Allow admins to manage tenants"
    ON tenants FOR ALL
    USING (get_user_role() = 'admin');

-- =====================================================
-- HOSTS POLICIES
-- =====================================================

CREATE POLICY "Hosts can view hosts in their tenant"
    ON hosts FOR SELECT
    USING (
        tenant_id = get_user_tenant_id()
        OR get_user_role() IN ('admin', 'security', 'reception')
    );

CREATE POLICY "Admins can manage hosts"
    ON hosts FOR ALL
    USING (get_user_role() = 'admin');

-- =====================================================
-- BADGES POLICIES
-- =====================================================

CREATE POLICY "Reception and security can view badges"
    ON badges FOR SELECT
    USING (get_user_role() IN ('reception', 'security', 'admin'));

CREATE POLICY "Reception and security can manage badges"
    ON badges FOR ALL
    USING (get_user_role() IN ('reception', 'security', 'admin'));

-- =====================================================
-- VISITORS POLICIES
-- =====================================================

CREATE POLICY "Hosts can view their visitors"
    ON visitors FOR SELECT
    USING (
        host_id = auth.uid()
        OR created_by = auth.uid()
        OR get_user_role() IN ('reception', 'security', 'admin')
    );

CREATE POLICY "Hosts can create visitors"
    ON visitors FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_active = TRUE
        )
    );

CREATE POLICY "Hosts can update their visitors"
    ON visitors FOR UPDATE
    USING (
        (created_by = auth.uid() AND status IN ('pending', 'pre-registered'))
        OR get_user_role() IN ('reception', 'security', 'admin')
    );

CREATE POLICY "Reception can manage visitors"
    ON visitors FOR ALL
    USING (get_user_role() IN ('reception', 'security', 'admin'));

-- =====================================================
-- VISITOR APPROVALS POLICIES
-- =====================================================

CREATE POLICY "Hosts can view their visitor approvals"
    ON visitor_approvals FOR SELECT
    USING (
        host_id = auth.uid()
        OR get_user_role() IN ('admin', 'security')
    );

CREATE POLICY "Hosts can approve visitors"
    ON visitor_approvals FOR ALL
    USING (
        host_id = auth.uid()
        OR get_user_role() IN ('admin', 'security')
    );

-- =====================================================
-- BLACKLIST POLICIES
-- =====================================================

CREATE POLICY "Security can view blacklist"
    ON blacklist FOR SELECT
    USING (get_user_role() IN ('security', 'admin'));

CREATE POLICY "Security can manage blacklist"
    ON blacklist FOR ALL
    USING (get_user_role() IN ('security', 'admin'));

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT
    USING (
        host_id = auth.uid()
        OR recipient_email = (SELECT email FROM users WHERE id = auth.uid())
        OR get_user_role() IN ('admin', 'reception')
    );

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (get_user_role() IN ('admin', 'security'));

-- =====================================================
-- BADGE HISTORY POLICIES
-- =====================================================

CREATE POLICY "Reception can view badge history"
    ON badge_history FOR SELECT
    USING (get_user_role() IN ('reception', 'security', 'admin'));

CREATE POLICY "Reception can manage badge history"
    ON badge_history FOR ALL
    USING (get_user_role() IN ('reception', 'security', 'admin'));
