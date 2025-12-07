-- Check the user data in database
-- Run this in Supabase SQL Editor to see what's actually stored

-- 1. Check if RLS is disabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Check the actual user record
SELECT 
  id,
  email,
  role,
  assigned_floors,
  full_name,
  created_at
FROM users 
WHERE email = 'ogakay22@gmail.com';

-- 3. If assigned_floors is NULL, update it (JSONB format):
UPDATE users 
SET assigned_floors = '[9]'::jsonb
WHERE email = 'ogakay22@gmail.com';

-- 4. Verify the update:
SELECT email, role, assigned_floors FROM users WHERE email = 'ogakay22@gmail.com';
