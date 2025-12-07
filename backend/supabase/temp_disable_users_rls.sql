-- Temporary: Disable RLS on users table to test
-- WARNING: This makes the users table accessible to all authenticated users
-- Only use for testing/debugging

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- To re-enable later, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
