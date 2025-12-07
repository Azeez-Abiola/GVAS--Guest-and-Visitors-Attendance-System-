## 🚀 Quick Deployment Instructions

### Step 1: Deploy Edge Function (2 minutes)

1. Open: https://supabase.com/dashboard
2. Go to your project → **Edge Functions**
3. Click **"Create a new function"**
4. Name: `create-user`
5. **IMPORTANT:** Open file: `backend/supabase/functions/PASTE_THIS_TO_DASHBOARD.ts`
6. Copy ALL the code (Ctrl+A, Ctrl+C)
7. Paste into the Supabase editor
8. Click **Deploy function**

**⚠️ DO NOT use file upload** - Copy/paste the code directly to avoid bundling errors

---

### Step 2: Set Up Email Template (1 minute)

1. Go to **Authentication** → **Email Templates**
2. Select **"Confirm signup"**
3. **Subject:** `Welcome to GVAS - Your Account Has Been Created 🎉`
4. Copy HTML from: `backend/supabase/email-templates/welcome-email.html`
5. Paste and **Save**

---

### Step 3: Test It! (30 seconds)

1. Login to GVAS as admin
2. Go to **User Management**
3. Click **Add User**
4. Fill details and submit
5. ✅ No rate limit!
6. ✅ User receives welcome email!

---

**That's it!** 🎉

Your system now:
- ✅ Creates users without rate limits
- ✅ Sends beautiful welcome emails
- ✅ Includes login credentials automatically
- ✅ Works for all roles (admin, reception, security, host)

---

**Need help?** See full guide: `DEPLOYMENT_GUIDE.md`
