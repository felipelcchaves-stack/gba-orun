import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const capiToken = Deno.env.get("META_CAPI_TOKEN");
    if (!capiToken) {
      console.error("META_CAPI_TOKEN not configured");
      return new Response(JSON.stringify({ error: "CAPI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pixel_id from app_settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: settingRow } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "meta_pixel_id")
      .maybeSingle();

    const pixelId = settingRow?.value;
    if (!pixelId) {
      console.error("meta_pixel_id not found in app_settings");
      return new Response(JSON.stringify({ error: "Pixel ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { event_name, email, value, currency = "BRL", event_source_url } = body;

    if (!event_name || !email) {
      return new Response(JSON.stringify({ error: "event_name and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hashedEmail = await sha256(email);
    const eventTime = Math.floor(Date.now() / 1000);

    const eventData: Record<string, any> = {
      event_name,
      event_time: eventTime,
      action_source: "website",
      user_data: {
        em: [hashedEmail],
      },
    };

    if (event_source_url) {
      eventData.event_source_url = event_source_url;
    }

    if (value !== undefined && value !== null) {
      eventData.custom_data = {
        value: Number(value),
        currency,
      };
    }

    const payload = {
      data: [eventData],
    };

    console.log(`Sending CAPI event: ${event_name} for ${email}`);

    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${capiToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const metaBody = await metaRes.text();
    console.log(`Meta CAPI response (${metaRes.status}):`, metaBody);

    return new Response(
      JSON.stringify({ success: metaRes.ok, meta_status: metaRes.status, meta_response: metaBody }),
      {
        status: metaRes.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("CAPI error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
