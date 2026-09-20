import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Internal endpoint meant only for the pg_cron job below — fail closed
    // if the shared secret isn't configured, don't just skip the check.
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret) {
      console.error("CRON_SECRET not configured — refusing request");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (req.headers.get("x-cron-secret") !== cronSecret) {
      console.error("Invalid or missing x-cron-secret header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find all premium users whose subscription has expired
    const { data: expired, error: fetchError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("is_premium", true)
      .lt("subscription_expires_at", new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expired || expired.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired subscriptions found", affected: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ids = expired.map((p) => p.id);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium: false, subscription_status: "overdue" })
      .in("id", ids);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: "Expired subscriptions updated", affected: ids.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
