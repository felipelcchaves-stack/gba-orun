// Meta Pixel helper — drop your Pixel ID in the PIXEL_ID constant
const PIXEL_ID = ""; // TODO: Add your Meta Pixel ID here

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

let initialized = false;

export const initPixel = () => {
  if (initialized || !PIXEL_ID) return;
  initialized = true;

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
};

export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (!PIXEL_ID || typeof window.fbq !== "function") return;
  window.fbq("track", event, data);
};

// Convenience helpers
export const trackLead = () => trackEvent("Lead");
export const trackInitiateCheckout = () => trackEvent("InitiateCheckout");
export const trackPurchase = (value?: number, currency = "BRL") =>
  trackEvent("Purchase", { value, currency });
