-- Migration: Authentication and User Management
-- Description: Creates users table, roles, and integrates with Supabase Auth

-- Create users table for role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'rec
  eption', 'host', 'security')),
  tenant_id UUID REFERENCES tenants(id), -- Only populated for hosts
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  phone TEXT,
  profile_photo TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Admins can see all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can insert users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update users
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

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

-- Trigger on auth.users to create user profile
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

-- Trigger to update last_login on auth
CREATE TRIGGER on_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- Seed initial users (Admin, Reception, Security, and Host per floor)

-- Insert admin user (will be created manually via Supabase Auth)
-- Email: admin@uachouse.com
-- Password: Admin123!

-- Insert reception users
-- Email: reception1@uachouse.com, reception2@uachouse.com
-- Password: Reception123!

-- Insert security user
-- Email: security@uachouse.com
-- Password: Security123!

-- Insert host users (one per floor, linked to tenants)
-- Email: host.floor1@uachouse.com through host.floor12@uachouse.com
-- Password: Host123!

-- Note: Actual user creation in auth.users must be done via Supabase Auth API
-- The trigger above will automatically create the profile in users table

-- Function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user has permission
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

-- Function to get user's tenant (for hosts)
CREATE OR REPLACE FUNCTION get_user_tenant(user_id UUID)
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON TABLE users IS 'User profiles with role-based access control';
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates user profile when auth user is created';
COMMENT ON FUNCTION update_last_login() IS 'Updates last_login timestamp on user sign in';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Returns the role of a user';
COMMENT ON FUNCTION user_has_permission(UUID, TEXT) IS 'Checks if user has required permission';
COMMENT ON FUNCTION get_user_tenant(UUID) IS 'Returns the tenant_id for host users';
