-- ⚠️ URGENT: Run this in Supabase SQL Editor to fix login timeout issue
-- 
-- Steps:
-- 1. Go to: https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx/sql/new
-- 2. Paste this SQL below
-- 3. Click "Run" or press Ctrl+Enter
-- 4. Refresh your app and login again
--
-- This disables Row Level Security on the users table which is causing
-- the recursive query timeout when fetching user profiles

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify it worked by running:
-- SELECT * FROM users WHERE email = 'ogakay22@gmail.com';
