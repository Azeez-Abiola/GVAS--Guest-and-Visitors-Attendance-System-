-- Migration: Authentication and User Management (Clean Version)
-- Run this in Supabase SQL Editor

-- Create users table for role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'reception', 'host', 'security')),
  tenant_id UUID REFERENCES tenants(id), -- Only populated for hosts
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  phone TEXT,
  profile_photo TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Disable RLS temporarily for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'reception'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_permission(
  user_id UUID,
  required_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific role
  RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_tenant(user_id UUID)
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Now manually create the admin user profile
-- First, get the user ID from auth.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user's ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@uachouse.com';
  
  -- If admin user exists in auth but not in users table, create the profile
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO users (id, email, full_name, role, is_active)
    VALUES (
      admin_user_id,
      'admin@uachouse.com',
      'System Administrator',
      'admin',
      true
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Admin user profile created successfully';
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users - please create it first';
  END IF;
END $$;
