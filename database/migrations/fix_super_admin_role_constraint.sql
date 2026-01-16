-- Migration: Allow super_admin role in users table
-- Description: Updates the check constraint on the users table to include the super_admin role.

-- 1. Drop existing check constraint
-- Note: Check constraints usually have auto-generated names if not specified, 
-- but in the original schema it was defined inline. 
-- The error message identified it as "users_role_check".

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add updated check constraint
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'reception', 'host', 'security'));

-- 3. Update the handle_new_user function to allow super_admin role assignment
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
