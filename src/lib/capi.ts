import { supabase } from "@/integrations/supabase/client";
import { getUtmParams } from "@/lib/utm";

export const sendCAPIEvent = async (
  eventName: string,
  email: string,
  options?: {
    value?: number;
    currency?: string;
    event_id?: string;
    custom_data?: Record<string, any>;
  }
) => {
  try {
    const utms = getUtmParams();
    const mergedCustomData = {
      ...utms,
      ...(options?.custom_data || {}),
    };

    const { error } = await supabase.functions.invoke("meta-capi", {
      body: {
        event_name: eventName,
        email,
        value: options?.value,
        currency: options?.currency || "BRL",
        event_source_url: window.location.href,
        event_id: options?.event_id,
        custom_data: Object.keys(mergedCustomData).length > 0 ? mergedCustomData : undefined,
      },
    });
    if (error) console.warn("CAPI event error:", error);
  } catch (err) {
    // Fire-and-forget — don't block the user flow
    console.warn("CAPI event failed:", err);
  }
};
