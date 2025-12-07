-- Migration: Temporarily disable RLS on users table
-- Description: Remove RLS to fix timeout issues during profile fetch
-- Date: 2024-12-06
-- WARNING: This is temporary and should be re-enabled with proper policies later

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Note: To re-enable RLS later, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- And recreate proper policies that don't cause recursive queries
