-- Fix admin user role and create remaining user accounts
-- Run this in Supabase SQL Editor

-- 1. Fix the admin user's role
UPDATE users 
SET role = 'admin', 
    full_name = 'System Administrator'
WHERE email = 'admin@uachouse.com';

-- 2. Get the user IDs for the other accounts (if they exist in auth.users)
-- If they don't exist, we'll need to create them via Supabase Auth UI first

-- Check which users exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN (
  'reception1@uachouse.com',
  'host.floor1@uachouse.com', 
  'security@uachouse.com'
);

-- 3. Create profiles for existing auth users (if any)
-- Reception user
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  id,
  email,
  'Reception Staff',
  'reception',
  true
FROM auth.users 
WHERE email = 'reception1@uachouse.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'reception', full_name = 'Reception Staff';

-- Host user
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  id,
  email,
  'Floor 1 Host',
  'host',
  true
FROM auth.users 
WHERE email = 'host.floor1@uachouse.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'host', full_name = 'Floor 1 Host';

-- Security user
INSERT INTO users (id, email, full_name, role, is_active)
SELECT 
  id,
  email,
  'Security Officer',
  'security',
  true
FROM auth.users 
WHERE email = 'security@uachouse.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'security', full_name = 'Security Officer';

-- Verify all users
SELECT email, full_name, role, is_active, created_at 
FROM users 
ORDER BY role, email;
