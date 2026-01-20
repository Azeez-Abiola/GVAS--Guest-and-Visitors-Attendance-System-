// Supabase Edge Function: Update User
// Updates user accounts (including password) with admin privileges
// Bypasses RLS to ensure admin can update any user

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
            throw new Error("Only admins can update users");
        }

        // Get request body
        const { id, email, password, full_name, role, phone, is_active, assigned_floors, office_number, floor_number } = await req.json();

        if (!id) {
            throw new Error("Missing required field: id");
        }

        const updates: any = {};
        if (email) updates.email = email;
        if (password) updates.password = password;
        if (role) updates.user_metadata = { ...updates.user_metadata, role };
        if (full_name) updates.user_metadata = { ...updates.user_metadata, full_name };

        // Update auth user if there are auth-related updates
        if (Object.keys(updates).length > 0) {
            if (password || email) {
                updates.email_confirm = true; // Auto-confirm if email changed
            }

            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                id,
                updates
            );

            if (updateError) throw updateError;
        }

        // Update user profile in users table
        const profileUpdates: any = {};
        if (full_name) profileUpdates.full_name = full_name;
        if (role) profileUpdates.role = role;
        if (phone !== undefined) profileUpdates.phone = phone;
        if (is_active !== undefined) profileUpdates.is_active = is_active;
        if (assigned_floors !== undefined) profileUpdates.assigned_floors = assigned_floors;

        let userData = null;
        if (Object.keys(profileUpdates).length > 0) {
            const { data, error: profileError } = await supabaseAdmin
                .from("users")
                .update(profileUpdates)
                .eq("id", id)
                .select()
                .single();

            if (profileError) throw profileError;
            userData = data;
        }

        // If role is host, create/update host record
        if (role === "host") {
            const hostUpdates: any = {};
            if (full_name) hostUpdates.name = full_name;
            if (email) hostUpdates.email = email; // Note: changing email might break link if not careful, but okay for now
            if (phone !== undefined) hostUpdates.phone = phone;
            if (office_number !== undefined) hostUpdates.office_number = office_number;
            if (floor_number !== undefined) hostUpdates.floor_number = parseInt(floor_number);
            if (is_active !== undefined) hostUpdates.active = is_active;

            // Check if host exists
            const { data: existingHost } = await supabaseAdmin
                .from("hosts")
                .select("id")
                .eq("email", email || userData?.email) // Use current email or updated email
                .maybeSingle();

            if (existingHost) {
                await supabaseAdmin.from("hosts").update(hostUpdates).eq("id", existingHost.id);
            } else if (email || userData?.email) {
                // Create if not exists but we have an email
                await supabaseAdmin.from("hosts").insert({
                    ...hostUpdates,
                    email: email || userData?.email,
                    role: "host"
                });
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                user: userData,
                message: `User ${full_name || id} updated successfully.`,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error updating user:", error);
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
