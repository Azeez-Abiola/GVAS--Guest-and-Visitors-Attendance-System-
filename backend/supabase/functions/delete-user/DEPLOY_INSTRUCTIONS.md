# Deploy Edge Function: delete-user

## ⚠️ IMPORTANT: This edge function MUST be deployed to Supabase

The `delete-user` edge function allows proper deletion of users from both the database AND Supabase Auth system.

Without deploying this function, you'll get "user already exists" errors when trying to re-add deleted users.

---

## How to Deploy

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your project**:
   ```bash
   cd C:\Users\User\Gvas\backend
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   Find your project ref in: Supabase Dashboard → Settings → General → Reference ID

4. **Deploy the function**:
   ```bash
   supabase functions deploy delete-user
   ```

### Option 2: Manual Deployment via Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click **"Create a new function"**
4. Name it: `delete-user`
5. Copy the entire content from `backend/supabase/functions/delete-user/index.ts`
6. Paste it into the function editor
7. Click **"Deploy"**

---

## Verify Deployment

After deploying, test it:

1. Go to User Management in your app
2. Create a test user with email: `test@example.com`
3. Delete that user
4. Try to create another user with the same email: `test@example.com`
5. ✅ It should work without errors!

---

## What This Function Does

- ✅ Verifies only admins can delete users
- ✅ Prevents admins from deleting themselves
- ✅ Deletes from `hosts` table (if user is a host)
- ✅ Deletes from `users` table
- ✅ Deletes from Supabase Auth (removes email registration)
- ✅ Returns success message with deleted user info

---

## Troubleshooting

### Error: "Function not found"
**Solution:** The function hasn't been deployed yet. Follow deployment steps above.

### Error: "Unauthorized"
**Solution:** Make sure you're logged in as an admin user.

### Error: "Only admins can delete users"
**Solution:** Your user role must be 'admin' in the database.

### Still getting "user already exists" error?
**Solution:** 
1. Verify the function is deployed (check Supabase Dashboard → Edge Functions)
2. Check browser console for actual error message
3. Check Supabase Edge Function logs for errors

---

## Edge Function URL

After deployment, your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-user/{userId}
```

The frontend code in `api.js` is already configured to use this endpoint.
