-- Quick Setup Script for GVAS Authentication
-- Run this in Supabase SQL Editor after creating auth users

-- First, verify the users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- If it returns 'users', the migration was successful!
-- If it returns nothing, you need to run the migration first

-- Next, check if any users exist in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- If you see users here, update their profiles:
-- (Replace the email with your actual admin email)

UPDATE users 
SET 
  full_name = 'System Administrator',
  role = 'admin',
  phone = '+234-800-000-0001'
WHERE email = 'admin@uachouse.com';

-- Verify the update worked:
SELECT id, email, full_name, role, is_active 
FROM users 
WHERE email = 'admin@uachouse.com';
