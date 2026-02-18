import { supabase } from "@/integrations/supabase/client";

export const sendCAPIEvent = async (
  eventName: string,
  email: string,
  value?: number,
  currency = "BRL"
) => {
  try {
    const { error } = await supabase.functions.invoke("meta-capi", {
      body: {
        event_name: eventName,
        email,
        value,
        currency,
        event_source_url: window.location.href,
      },
    });
    if (error) console.warn("CAPI event error:", error);
  } catch (err) {
    // Fire-and-forget — don't block the user flow
    console.warn("CAPI event failed:", err);
  }
};
