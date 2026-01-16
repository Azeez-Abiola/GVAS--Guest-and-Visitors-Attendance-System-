-- GVAS SUPER ADMIN ACCOUNT CREATION
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create the user in Supabase Auth (This is the secure way to generate a user)
-- Note: Replace 'superadmin@gvas.com' and 'GvasPlatformOwner2024!' with your preferred credentials.

-- Since we can't easily set passwords via raw SQL in auth.users without the pgcrypto extension 
-- and knowing the salt/hash methods Supabase uses, the BEST way is to:
-- A. Register normally via your app.
-- B. Then run the SQL below to promote your account.

-- STEP 0: FIX ROLE CONSTRAINT (Run this if you get a check constraint error)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'reception', 'host', 'security'));

-- STEP 1: PROMOTE AN EXISTING USER TO SUPER ADMIN
-- Replace 'your-email@example.com' with the email you signed up with.

UPDATE users 
SET role = 'super_admin',
    is_active = true
WHERE email = 'dev@hovidastechnologies.com';

-- STEP 2: ENSURE THE PROFILE EXISTS IN THE USERS TABLE
INSERT INTO users (id, email, full_name, role, is_active)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Hovidas Admin'), 'super_admin', true
FROM auth.users
WHERE email = 'dev@hovidastechnologies.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin';

-- FOR QUICK SETUP
INSERT INTO system_organizations (name, contact_person, contact_email, plan_tier, status)
VALUES ('Hovidas Technologies', 'Dev Team', 'dev@hovidastechnologies.com', 'enterprise', 'active')
ON CONFLICT (contact_email) DO NOTHING;
