-- NUCLEAR OPTION: Temporarily disable RLS on visitors table
-- WARNING: This removes all row-level security!
-- Only use this for testing, then re-enable it immediately after

-- Disable RLS on visitors table
ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;

-- NOTE: After testing guest registration, RE-ENABLE RLS with this command:
-- ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Then we'll fix the policies properly once we know the issue
