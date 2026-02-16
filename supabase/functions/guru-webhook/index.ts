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

    // Digital Manager Guru sends different event types
    const status = body?.status || body?.transaction?.status;
    const email = body?.buyer?.email || body?.customer?.email || body?.email;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (status === "approved" || status === "payment_approved" || status === "completed") {
      // Find user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email === email);

      if (user) {
        // Set premium
        const { error } = await supabase
          .from("profiles")
          .update({ is_premium: true, guru_id: body?.transaction?.id || body?.id || null })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating profile:", error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`User ${email} set to premium`);
      } else {
        console.log(`User ${email} not found — will be marked premium on signup`);
        // You could store pending premium grants in a separate table here
      }
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
