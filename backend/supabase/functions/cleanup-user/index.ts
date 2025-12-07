// One-time cleanup script to remove stuck user from auth
// This will delete the user ogakay22@gmail.com from Supabase Auth

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Looking for user with email: ${email}`);

    // Find the user by email in auth.users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const userToDelete = users.find(u => u.email === email);

    if (!userToDelete) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `No user found with email ${email} in auth system`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found user: ${userToDelete.id} - ${userToDelete.email}`);

    // Delete from database first
    await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userToDelete.id);

    await supabaseAdmin
      .from("hosts")
      .delete()
      .eq("email", email);

    // Delete from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);

    if (deleteError) {
      throw new Error(`Failed to delete from auth: ${deleteError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deleted user ${email} (ID: ${userToDelete.id}) from both database and auth`,
        user: {
          id: userToDelete.id,
          email: userToDelete.email,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
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
