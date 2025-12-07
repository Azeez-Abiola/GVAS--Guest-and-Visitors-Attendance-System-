# Create Test Users in Supabase

## Step 1: Run the Auth Migration

First, make sure you've run the auth migration in Supabase:

1. Go to: https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx/editor
2. Click **SQL Editor** → **New query**
3. Copy and paste the contents of `backend/supabase/migrations/20241201000004_auth_users.sql`
4. Click **Run**

This creates the `users` table and triggers.

---

## Step 2: Create Test Users via Supabase Dashboard

Since Supabase Auth requires email verification or admin creation, you have two options:

### Option A: Use Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx/auth/users
2. Click **Add user** → **Create new user**
3. Create each user with these details:

#### Admin User
- Email: `admin@uachouse.com`
- Password: `Admin123!`
- Auto Confirm User: ✅ YES
- After creation, the trigger will auto-create the profile

#### Reception Users
- Email: `reception1@uachouse.com`
- Password: `Reception123!`
- Auto Confirm User: ✅ YES

- Email: `reception2@uachouse.com`
- Password: `Reception123!`
- Auto Confirm User: ✅ YES

#### Security User
- Email: `security@uachouse.com`
- Password: `Security123!`
- Auto Confirm User: ✅ YES

#### Host Users (12 total - one per floor)
- Email: `host.floor1@uachouse.com` through `host.floor12@uachouse.com`
- Password: `Host123!` (same for all)
- Auto Confirm User: ✅ YES

---

### Option B: Use SQL Insert (After Disabling Email Verification)

If you want to use SQL, you need to disable email verification temporarily:

1. Go to: https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx/auth/providers
2. Under **Email**, disable "Confirm email" temporarily
3. Run the SQL script below

---

## Step 3: Update User Profiles

After users are created via Auth, update their profiles with roles:

```sql
-- Update admin user
UPDATE users 
SET 
  full_name = 'System Administrator',
  role = 'admin',
  phone = '+234-800-000-0001'
WHERE email = 'admin@uachouse.com';

-- Update reception users
UPDATE users 
SET 
  full_name = 'Reception Desk 1',
  role = 'reception',
  phone = '+234-800-000-0002'
WHERE email = 'reception1@uachouse.com';

UPDATE users 
SET 
  full_name = 'Reception Desk 2',
  role = 'reception',
  phone = '+234-800-000-0003'
WHERE email = 'reception2@uachouse.com';

-- Update security user
UPDATE users 
SET 
  full_name = 'Security Team',
  role = 'security',
  phone = '+234-800-000-0004'
WHERE email = 'security@uachouse.com';

-- Update host users (link to tenants)
UPDATE users u
SET 
  full_name = 'Host - ' || t.name,
  role = 'host',
  tenant_id = t.id,
  phone = '+234-800-000-' || LPAD(t.floor_number::TEXT, 4, '0')
FROM tenants t
WHERE u.email = 'host.floor' || t.floor_number || '@uachouse.com';
```

---

## Step 4: Verify Users

Check that all users were created correctly:

```sql
SELECT 
  email,
  full_name,
  role,
  tenant_id,
  is_active,
  created_at
FROM users
ORDER BY role, email;
```

You should see:
- 1 admin
- 2 reception
- 1 security
- 12 hosts (each linked to a tenant/floor)

---

## Step 5: Test Login

Now you can test login at: `http://localhost:5174/login`

### Test Credentials:

**Admin:**
- Email: `admin@uachouse.com`
- Password: `Admin123!`
- Should redirect to: `/admin` (full access)

**Reception:**
- Email: `reception1@uachouse.com`
- Password: `Reception123!`
- Should redirect to: `/admin` (reception access)

**Host:**
- Email: `host.floor1@uachouse.com`
- Password: `Host123!`
- Should redirect to: `/approvals` (when we build it)

**Security:**
- Email: `security@uachouse.com`
- Password: `Security123!`
- Should redirect to: `/evacuation`

---

## Quick Setup Option

If you want to skip manual creation, I can create a Node.js script that uses Supabase Admin API to create all users automatically. Let me know!

---

## Troubleshooting

### Can't see users table?
- Make sure you ran the migration script first
- Check Table Editor → users table exists

### Trigger not creating profile?
- Check if trigger exists: `on_auth_user_created`
- Manually insert into users table if needed

### Login not working?
- Check browser console for errors
- Verify Supabase keys in frontend/.env
- Make sure user is confirmed (email_confirmed_at is not null)

---

**Next:** After users are created, you can test the complete authentication flow! 🎉
