-- Fix: Remove problematic RLS policies and replace with simpler ones
-- Run this in Supabase SQL Editor

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Disable RLS temporarily (we'll re-enable with better policies)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- For now, allow authenticated users to read their own profile
-- We'll implement proper role-based access later
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Simple policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow service role (backend) full access
CREATE POLICY "Service role has full access"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
