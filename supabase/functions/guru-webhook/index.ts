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

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.substring(0, 3)}***@${domain}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();

    // --- NORMALIZE PAYLOAD: accept both wrapped {payload:{...}} and unwrapped {...} ---
    const isWrapped = body?.payload && typeof body.payload === "object" && body.payload.api_token;
    const p = isWrapped ? body.payload : body;
    console.log(`Webhook received — format: ${isWrapped ? "wrapped" : "unwrapped"}`);

    // --- Validate webhook authenticity ---
    const webhookSecret = Deno.env.get("GURU_WEBHOOK_SECRET");
    if (webhookSecret) {
      const bodyToken = p?.api_token;
      const headerToken = req.headers.get("x-guru-token") || req.headers.get("authorization")?.replace("Bearer ", "");
      const token = bodyToken || headerToken;

      if (token !== webhookSecret) {
        console.error("Invalid webhook token");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // --- Extract data from normalized payload ---
    const rawStatus = p?.last_status || p?.last_transaction?.status || p?.status || "";
    const status = rawStatus.toLowerCase();
    const email = p?.subscriber?.email || p?.last_transaction?.contact?.email || p?.buyer?.email || p?.email;
    const buyerName = p?.subscriber?.name || p?.last_transaction?.contact?.name || p?.buyer?.name || p?.name || null;
    const guruSubId = p?.subscription_code || p?.id || null;
    const transactionId = p?.last_transaction?.id || p?.transaction?.id || p?.id || null;
    const purchaseValue = p?.last_transaction?.payment?.total || p?.current_invoice?.value || p?.transaction?.value || p?.amount || null;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Extracted — status: ${status}, email: ${maskEmail(email)}, subId: ${guruSubId}`);

    // --- Determine subscription plan from payload ---
    async function resolveSubscriptionPlan() {
      const intervalType = p?.product?.offer?.plan?.interval_type
        || p?.next_product?.offer?.plan?.interval_type
        || "";
      const chargedDays = p?.charged_every_days || 0;
      const planName = p?.product?.offer?.name || p?.product?.name || p?.name || "";
      const planNameLower = (planName || "").toLowerCase();

      const isAnnual =
        intervalType === "year" ||
        chargedDays >= 365 ||
        planNameLower.includes("anual") ||
        planNameLower.includes("annual") ||
        planNameLower.includes("yearly");

      const billingPeriod = isAnnual ? "yearly" : "monthly";
      const durationDays = isAnnual ? 365 : 30;

      let planId: string | null = null;

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

      console.log(`Plan resolved — billing: ${billingPeriod}, duration: ${durationDays}d, planId: ${planId}`);
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

    // --- Status mapping (case-insensitive) ---
    const isApproved = [
      "active", "approved", "paid",
      "payment_approved", "completed",
      "subscription_created", "subscription_renewed",
    ].includes(status);

    // --- AUTO-CREATE USER if not found AND payment approved ---
    if (!userId && isApproved) {
      console.log(`User ${maskEmail(email)} not found — auto-creating account...`);

      const randomPassword = generateRandomPassword();

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

      await new Promise((r) => setTimeout(r, 1500));

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
          console.log(`Recovery email triggered for ${maskEmail(email)}`);
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

      console.log(`Result: user_created, premium activated for ${maskEmail(email)}`);
      return new Response(JSON.stringify({ success: true, action: "user_created", user_id: newUserId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- User not found and NOT an approval event → ignore ---
    if (!userId) {
      console.log(`User ${maskEmail(email)} not found, status=${status} — ignoring`);
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

      const updatePayload: any = {
        is_premium: true,
        subscription_status: "active",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        subscription_plan_id: planId,
        guru_id: transactionId,
        guru_subscription_id: guruSubId,
      };

      if (buyerName) {
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
      console.log(`User ${maskEmail(email)} subscription activated (${durationDays} days)`);

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
      ["overdue", "subscription_overdue", "payment_refunded", "unpaid"].includes(status)
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_status: "overdue",
        } as any)
        .eq("user_id", userId);

      if (error) console.error("Error marking overdue:", error);
      console.log(`User ${maskEmail(email)} marked overdue`);

    } else if (
      ["canceled", "cancelled", "subscription_cancelled", "refunded"].includes(status)
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          subscription_status: "cancelled",
        } as any)
        .eq("user_id", userId);

      if (error) console.error("Error cancelling:", error);
      console.log(`User ${maskEmail(email)} subscription cancelled`);
    }

    console.log(`Result: processed status=${status} for ${maskEmail(email)}`);
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
