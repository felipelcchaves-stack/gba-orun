import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-guru-token",
};

function generateRandomPassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate webhook authenticity
    const webhookSecret = Deno.env.get("GURU_WEBHOOK_SECRET");
    if (webhookSecret) {
      const token = req.headers.get("x-guru-token") || req.headers.get("authorization")?.replace("Bearer ", "");
      if (token !== webhookSecret) {
        console.error("Invalid webhook token");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    console.log("Guru webhook received:", JSON.stringify(body));

    const status = body?.status || body?.transaction?.status;
    const email = body?.buyer?.email || body?.customer?.email || body?.email;
    const buyerName = body?.buyer?.name || body?.customer?.name || body?.name || null;
    const guruSubId = body?.subscription?.id || body?.guru_subscription_id || null;
    const transactionId = body?.transaction?.id || body?.id || null;
    const purchaseValue = body?.transaction?.value || body?.amount || body?.price || null;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Determine subscription plan from payload ---
    async function resolveSubscriptionPlan() {
      // Try to detect billing period from Guru payload
      const planName = body?.subscription?.plan?.name || body?.product?.name || body?.offer?.name || "";
      const planNameLower = (planName || "").toLowerCase();

      // Check if annual keywords are present
      const isAnnual = planNameLower.includes("anual") || planNameLower.includes("annual") || planNameLower.includes("yearly") || planNameLower.includes("12 meses");

      const billingPeriod = isAnnual ? "yearly" : "monthly";
      const durationDays = isAnnual ? 365 : 30;

      // Try to find matching plan in subscription_plans table
      let planId: string | null = null;

      // First try by billing_period
      const { data: plans } = await supabase
        .from("subscription_plans")
        .select("id, billing_period, price, name")
        .eq("is_active", true)
        .eq("billing_period", billingPeriod)
        .order("display_order", { ascending: true })
        .limit(1);

      if (plans && plans.length > 0) {
        planId = plans[0].id;
      } else {
        // Fallback: get any active plan
        const { data: fallback } = await supabase
          .from("subscription_plans")
          .select("id")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .limit(1);
        if (fallback && fallback.length > 0) {
          planId = fallback[0].id;
        }
      }

      return { planId, durationDays };
    }

    // --- Lookup user ---
    const { data: userId, error: rpcError } = await supabase.rpc("get_user_id_by_email", { p_email: email });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return new Response(JSON.stringify({ error: "Failed to lookup user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isApproved = status === "approved" || status === "payment_approved" || status === "completed" ||
      status === "subscription_created" || status === "subscription_renewed";

    // --- AUTO-CREATE USER if not found AND payment approved ---
    if (!userId && isApproved) {
      console.log(`User ${email} not found — auto-creating account...`);

      const randomPassword = generateRandomPassword();

      // Create user via admin API
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { display_name: buyerName || email.split("@")[0] },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(JSON.stringify({ error: "Failed to create user: " + createError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newUserId = newUserData.user.id;
      console.log(`User created: ${newUserId}`);

      // Wait a moment for the handle_new_user trigger to create the profile
      await new Promise((r) => setTimeout(r, 1500));

      // Resolve plan and populate profile
      const { planId, durationDays } = await resolveSubscriptionPlan();
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: buyerName || email.split("@")[0],
          is_premium: true,
          subscription_status: "active",
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
          subscription_plan_id: planId,
          guru_id: transactionId,
          guru_subscription_id: guruSubId,
        } as any)
        .eq("user_id", newUserId);

      if (profileError) {
        console.error("Error updating new user profile:", profileError);
      }

      // Send recovery email so buyer can set their own password
      try {
        const { error: linkError } = await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: {
            redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/reset-password`,
          },
        });
        if (linkError) {
          console.error("Error generating recovery link:", linkError);
        } else {
          console.log(`Recovery email triggered for ${email}`);
        }
      } catch (linkErr) {
        console.error("Recovery link error (non-blocking):", linkErr);
      }

      // Send Purchase event via Meta CAPI
      try {
        const capiRes = await fetch(`${supabaseUrl}/functions/v1/meta-capi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            event_name: "Purchase",
            email,
            value: purchaseValue ? Number(purchaseValue) : undefined,
            currency: "BRL",
          }),
        });
        const capiBody = await capiRes.text();
        console.log("CAPI Purchase response:", capiBody);
      } catch (capiErr) {
        console.error("CAPI Purchase error (non-blocking):", capiErr);
      }

      return new Response(JSON.stringify({ success: true, action: "user_created", user_id: newUserId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- User not found and NOT an approval event → ignore ---
    if (!userId) {
      console.log(`User ${email} not found and status=${status} — ignoring`);
      return new Response(JSON.stringify({ success: true, note: "user not found, non-approval event" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- EXISTING USER: handle status changes ---
    const now = new Date();

    if (isApproved) {
      const { planId, durationDays } = await resolveSubscriptionPlan();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Build update payload — also update display_name if empty
      const updatePayload: any = {
        is_premium: true,
        subscription_status: "active",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        subscription_plan_id: planId,
        guru_id: transactionId,
        guru_subscription_id: guruSubId,
      };

      // Update display_name only if buyer name is available
      if (buyerName) {
        // Check if current display_name is empty
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", userId)
          .maybeSingle();

        if (currentProfile && !currentProfile.display_name) {
          updatePayload.display_name = buyerName;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("user_id", userId);

      if (error) {
        console.error("Error activating subscription:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log(`User ${email} subscription activated (${durationDays} days)`);

      // Send Purchase event via Meta CAPI
      try {
        const capiRes = await fetch(`${supabaseUrl}/functions/v1/meta-capi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            event_name: "Purchase",
            email,
            value: purchaseValue ? Number(purchaseValue) : undefined,
            currency: "BRL",
          }),
        });
        const capiBody = await capiRes.text();
        console.log("CAPI Purchase response:", capiBody);
      } catch (capiErr) {
        console.error("CAPI Purchase error (non-blocking):", capiErr);
      }

    } else if (
      status === "subscription_overdue" || status === "payment_refunded" || status === "overdue"
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_status: "overdue",
        } as any)
        .eq("user_id", userId);

      if (error) console.error("Error marking overdue:", error);
      console.log(`User ${email} marked overdue`);

    } else if (
      status === "subscription_cancelled" || status === "cancelled" || status === "refunded"
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_status: "cancelled",
        } as any)
        .eq("user_id", userId);

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
