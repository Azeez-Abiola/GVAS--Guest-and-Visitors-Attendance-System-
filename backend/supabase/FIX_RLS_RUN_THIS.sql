-- RUN THIS IN SUPABASE SQL EDITOR
-- This will fix the RLS policies so you can see all users

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Step 2: Create helper function (avoids recursion)
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

-- Step 3: Create new policies
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Service role can create users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Service role can update users"
  ON users FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

-- Step 4: Verify - this should show all users
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;
