-- Temporary fix: Ensure users table has proper RLS policies
-- Run this in Supabase SQL Editor

-- First, check if policies exist and drop them
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable with simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow authenticated users to update their own profile  
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    role = 'admin'
    OR id = auth.uid()
  );

-- Allow admins to insert users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow admins to update all users
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
