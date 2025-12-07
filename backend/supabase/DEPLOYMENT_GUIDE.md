# GVAS Edge Function Deployment Guide

## 📦 What We're Deploying
- **Edge Function:** `create-user` - Handles user creation with admin privileges
- **Email Template:** Custom welcome email with credentials

---

## 🚀 Step 1: Deploy the Edge Function

### Method A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Project Dashboard**
   - URL: https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Click "Create a new function" button

3. **Create the Function**
   - **Function Name:** `create-user`
   - **Copy and paste** the code from: `backend/supabase/functions/create-user/index.ts`
   - Click **"Deploy function"**

4. **Verify Deployment**
   - You should see: ✅ `create-user` function deployed
   - Note the function URL (you'll need this)

### Method B: Using Supabase CLI (If installed)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref [YOUR-PROJECT-REF]

# Deploy the function
cd backend/supabase
supabase functions deploy create-user
```

---

## 📧 Step 2: Configure Email Template

1. **Go to Authentication Settings**
   - Dashboard → Authentication → Email Templates

2. **Select "Confirm signup" Template**
   - Click on "Confirm signup" in the email templates list

3. **Replace the HTML with Custom Template**
   - Open: `backend/supabase/email-templates/welcome-email.html`
   - Copy all the content
   - Paste it into the email template editor

4. **Update Template Variables**
   - The template uses these variables:
     - `{{ .FullName }}` - User's full name
     - `{{ .Email }}` - User's email
     - `{{ .Password }}` - Temporary password
     - `{{ .Role }}` - User's role
     - `{{ .SiteURL }}` - Your app URL
     - `{{ .Year }}` - Current year

5. **Configure Email Subject**
   - Subject: `Welcome to GVAS - Your Account Has Been Created 🎉`

6. **Save the Template**

---

## ⚙️ Step 3: Environment Configuration

### Configure Edge Function Secrets (Auto-configured)
The function uses these environment variables (automatically available):
- ✅ `SUPABASE_URL` - Your project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Admin API key
- ✅ `SUPABASE_ANON_KEY` - Public API key

**No manual setup needed** - Supabase provides these automatically!

---

## 🔧 Step 4: Update Frontend Configuration

The frontend code has already been updated in:
- ✅ `frontend/src/services/api.js` - Uses edge function instead of direct auth.signUp()

**Verify the URL matches your project:**
```javascript
// In api.js, line ~684
const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-user`, {
  // This should automatically use your project URL
})
```

---

## ✅ Step 5: Test the Setup

1. **Login as Admin**
   - Go to User Management
   - Click "Add User"

2. **Create a Test User**
   - Fill in user details
   - Select a role
   - Click "Add User"

3. **Verify Success**
   - ✅ User created without rate limit errors
   - ✅ User appears in User Management table
   - ✅ Welcome email sent to user's inbox
   - ✅ User can log in with provided credentials

4. **Check Email**
   - User should receive beautifully formatted welcome email
   - Email contains login credentials and instructions

---

## 🎨 Email Template Features

The custom email template includes:
- 🏢 GVAS branding with gradient header
- 🔐 Clear display of login credentials
- 📋 Role-specific access information
- ⚠️ Security reminders
- 💡 Getting started guide
- 🎯 Direct "Access System" button
- 📱 Mobile-responsive design

---

## 🐛 Troubleshooting

### Issue: "Function not found"
- **Solution:** Make sure you deployed the function (Step 1)
- Check function name is exactly: `create-user`

### Issue: "Unauthorized"
- **Solution:** The requesting user must be logged in as an admin
- Check `users` table - user's role should be 'admin'

### Issue: Email not received
- **Solution:** Check Supabase email settings
- Go to Authentication → Settings → Email
- Verify SMTP settings or use Supabase's default email service

### Issue: "Only admins can create users" error
- **Solution:** Make sure you're logged in as an admin user
- Check your profile in the `users` table

---

## 📝 What Changed

### Before:
- ❌ Used `supabase.auth.signUp()` - Rate limited (60 second cooldown)
- ❌ Trigger-based user creation - Unreliable timing
- ❌ Generic Supabase confirmation emails

### After:
- ✅ Uses Edge Function with admin API - No rate limits
- ✅ Direct user creation with full control
- ✅ Custom branded welcome emails with credentials
- ✅ Automatic host record creation for host role
- ✅ Email pre-confirmed - Users can log in immediately

---

## 🎯 Next Steps

After deployment:
1. Test creating users with different roles (admin, reception, security, host)
2. Verify emails are received and formatted correctly
3. Confirm users can log in with provided credentials
4. Update email template with your company logo/branding if desired

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Edge Functions → Logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure you're logged in as an admin

---

**Deployment Date:** December 5, 2025
**Version:** 1.0.0
