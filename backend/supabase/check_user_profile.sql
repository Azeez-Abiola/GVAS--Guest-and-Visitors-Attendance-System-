-- Check if the user profile exists
-- Run this in Supabase SQL Editor

-- Check auth.users table
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@uachouse.com';

-- Check public.users table (should have a matching row)
SELECT * 
FROM users 
WHERE email = 'admin@uachouse.com';

-- If the user doesn't exist in public.users, we need to create it manually
-- INSERT INTO users (id, email, full_name, role, is_active)
-- VALUES (
--   '[USER_ID_FROM_AUTH_USERS]',
--   'admin@uachouse.com',
--   'System Administrator',
--   'admin',
--   true
-- );
