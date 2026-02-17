import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    console.log("Guru webhook received:", JSON.stringify(body));

    const status = body?.status || body?.transaction?.status;
    const email = body?.buyer?.email || body?.customer?.email || body?.email;
    const guruSubId = body?.subscription?.id || body?.guru_subscription_id || null;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u: any) => u.email === email);

    if (!user) {
      console.log(`User ${email} not found — will be marked premium on signup`);
      return new Response(JSON.stringify({ success: true, note: "user not found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();

    // Determine action based on status
    if (
      status === "approved" || status === "payment_approved" || status === "completed" ||
      status === "subscription_created" || status === "subscription_renewed"
    ) {
      // Activate subscription
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          subscription_status: "active",
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
          guru_id: body?.transaction?.id || body?.id || null,
          guru_subscription_id: guruSubId,
        } as any)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error activating subscription:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log(`User ${email} subscription activated`);

    } else if (
      status === "subscription_overdue" || status === "payment_refunded" || status === "overdue"
    ) {
      // Mark overdue — lock access
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_status: "overdue",
        } as any)
        .eq("user_id", user.id);

      if (error) console.error("Error marking overdue:", error);
      console.log(`User ${email} marked overdue`);

    } else if (
      status === "subscription_cancelled" || status === "cancelled" || status === "refunded"
    ) {
      // Cancel subscription
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_status: "cancelled",
        } as any)
        .eq("user_id", user.id);

      if (error) console.error("Error cancelling:", error);
      console.log(`User ${email} subscription cancelled`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
