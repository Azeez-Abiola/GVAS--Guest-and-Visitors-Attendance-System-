-- Migration: Fix Users RLS Policies
-- Description: Remove recursive queries in RLS policies
-- Date: 2024-12-05

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the function
-- Admins can see all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can insert users (used by edge function)
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Service role can always insert (for edge function)
CREATE POLICY "Service role can create users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can update users
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Service role can always update (for edge function)
CREATE POLICY "Service role can update users"
  ON users FOR UPDATE
  TO service_role
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';
