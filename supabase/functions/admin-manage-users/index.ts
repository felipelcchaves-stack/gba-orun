import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

    // Check admin role
    const { data: isAdmin } = await anonClient.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for admin operations
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action } = body;

    // ─── CREATE SINGLE ───
    if (action === "create_single") {
      const { email, password, display_name, is_premium, is_admin } = body;
      if (!email || !password || password.length < 6) {
        return new Response(
          JSON.stringify({ error: "Email e senha (min 6 chars) obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name || null },
      });

      if (createErr) {
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update profile
      if (is_premium || display_name) {
        await adminClient
          .from("profiles")
          .update({
            ...(display_name ? { display_name } : {}),
            ...(is_premium ? { is_premium: true, subscription_status: "active" } : {}),
          })
          .eq("user_id", user.user.id);
      }

      // Add admin role if requested
      if (is_admin) {
        await adminClient
          .from("user_roles")
          .insert({ user_id: user.user.id, role: "admin" });
      }

      return new Response(
        JSON.stringify({ success: true, user_id: user.user.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── CREATE BULK ───
    if (action === "create_bulk") {
      const { users } = body;
      if (!Array.isArray(users) || users.length === 0) {
        return new Response(
          JSON.stringify({ error: "Array de usuários vazio" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results = { success: [] as string[], failed: [] as { email: string; error: string }[] };

      for (const u of users) {
        try {
          if (!u.email || !u.password || u.password.length < 6) {
            results.failed.push({ email: u.email || "?", error: "Email/senha inválidos" });
            continue;
          }

          const { data: created, error: err } = await adminClient.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { display_name: u.display_name || null },
          });

          if (err) {
            results.failed.push({ email: u.email, error: err.message });
            continue;
          }

          if (u.is_premium || u.display_name) {
            await adminClient
              .from("profiles")
              .update({
                ...(u.display_name ? { display_name: u.display_name } : {}),
                ...(u.is_premium ? { is_premium: true, subscription_status: "active" } : {}),
              })
              .eq("user_id", created.user.id);
          }

          if (u.is_admin) {
            await adminClient
              .from("user_roles")
              .insert({ user_id: created.user.id, role: "admin" });
          }

          results.success.push(u.email);
        } catch (e: any) {
          results.failed.push({ email: u.email || "?", error: e.message });
        }
      }

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── DELETE USER ───
    if (action === "delete_user") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: delErr } = await adminClient.auth.admin.deleteUser(user_id);
      if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── TOGGLE ADMIN ───
    if (action === "toggle_admin") {
      const { user_id } = body;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: existing } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("user_id", user_id)
        .eq("role", "admin")
        .maybeSingle();

      if (existing) {
        await adminClient.from("user_roles").delete().eq("id", existing.id);
        return new Response(JSON.stringify({ success: true, is_admin: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        await adminClient.from("user_roles").insert({ user_id, role: "admin" });
        return new Response(JSON.stringify({ success: true, is_admin: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
