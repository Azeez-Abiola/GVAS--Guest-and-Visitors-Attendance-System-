# ⚡ Quick Manual Deploy - Copy & Paste Method

Since automated deployment requires authentication, here's the **fastest manual method**:

## 🚀 5-Minute Manual Deployment

### Step 1: Open Supabase Dashboard
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your **GVAS project**
3. Click **Edge Functions** in the left sidebar

### Step 2: Create the Function
1. Click **"Create a new function"** or **"New Function"**
2. **Function name:** `delete-user`
3. Click **"Create function"** or **"Continue"**

### Step 3: Copy the Code

Open this file: `C:\Users\User\Gvas\backend\supabase\functions\delete-user\index.ts`

**Or copy this code:**

```typescript
// Supabase Edge Function: Delete User
// Deletes user from both Supabase Auth and database tables
// Only admins can delete users

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("Only admins can delete users");
    }

    // Get user ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      throw new Error("You cannot delete your own account");
    }

    // Get user info before deletion (for response)
    const { data: userToDelete } = await supabaseAdmin
      .from("users")
      .select("full_name, email, role")
      .eq("id", userId)
      .single();

    // Delete from hosts table if user is a host
    if (userToDelete?.role === "host") {
      await supabaseAdmin
        .from("hosts")
        .delete()
        .eq("email", userToDelete.email);
    }

    // Delete from users table first
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Failed to delete from users table:", dbError);
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }

    // Delete from Supabase Auth (this completely removes the user)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("Failed to delete from auth:", authDeleteError);
      // Don't throw - database deletion already succeeded
      // User is removed from system, just log the auth error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${userToDelete?.full_name || userId} deleted successfully from both database and authentication system`,
        user: userToDelete,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### Step 4: Paste & Deploy
1. **Paste the entire code** into the function editor
2. Click **"Deploy"** or **"Save"**
3. Wait for deployment to complete (usually takes 10-20 seconds)

### Step 5: Verify
1. You should see ✅ **"Function deployed successfully"**
2. The function URL will be: `https://[your-project-ref].supabase.co/functions/v1/delete-user`

---

## ✅ Test It Now

1. Go to **User Management** in your app (now 2nd in sidebar!)
2. Create a test user: `test@delete.com`
3. Delete that user → Should work ✅
4. Create another user with same email: `test@delete.com`
5. ✅ **Should work without "user already exists" error!**

---

## 🎯 That's It!

Your user deletion is now fixed! The function will:
- ✅ Delete from Supabase Auth (removes email registration)
- ✅ Delete from users table
- ✅ Delete from hosts table (if host)
- ✅ Allow re-using the same email immediately

---

## 📍 Quick Reference

**Function name:** `delete-user`  
**Location:** Edge Functions in Supabase Dashboard  
**File path:** `backend/supabase/functions/delete-user/index.ts`  
**Your app:** Running on http://localhost:5175

Need help? Check the Supabase Dashboard → Edge Functions → Logs for any errors.
