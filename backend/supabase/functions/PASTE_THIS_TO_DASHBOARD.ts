// COPY THIS ENTIRE CODE TO SUPABASE DASHBOARD
// Do NOT use file upload - paste directly

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
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("Only admins can create users");
    }

    const { email, password, full_name, role, phone, is_active, assigned_floors, office_number, floor_number } = await req.json();

    if (!email || !password || !full_name || !role) {
      throw new Error("Missing required fields: email, password, full_name, role");
    }

    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (createError) throw createError;

    const { data: userData, error: profileError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: authData.user.id,
        email,
        full_name,
        role,
        phone: phone || null,
        is_active: is_active !== undefined ? is_active : true,
        assigned_floors: assigned_floors || [],
      })
      .select()
      .single();

    if (profileError) throw profileError;

    if (role === "host" && floor_number) {
      await supabaseAdmin.from("hosts").insert({
        name: full_name,
        email,
        phone: phone || "",
        office_number: office_number || "",
        floor_number: parseInt(floor_number),
        role: "host",
        active: is_active !== undefined ? is_active : true,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userData,
        message: `User ${full_name} created successfully. Welcome email sent to ${email}.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
