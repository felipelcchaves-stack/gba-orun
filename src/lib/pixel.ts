declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let pixelInitialized = false;
let gtagInitialized = false;

export const initPixel = async () => {
  // no-op kept for backwards compat — real init happens via initPixelWithId
};

export const initPixelWithId = (pixelId: string) => {
  if (!pixelId || pixelInitialized) return;
  pixelInitialized = true;

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

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
};

export const initGoogleAds = (googleAdsId: string) => {
  if (!googleAdsId || gtagInitialized) return;
  gtagInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date() as any);
  window.gtag("config", googleAdsId);
};

/** Generate a unique event_id for deduplication with CAPI */
export const generateEventId = (): string => {
  return crypto.randomUUID();
};

/** Core tracking — returns the event_id used */
export const trackEvent = (event: string, data?: Record<string, any>, eventId?: string): string => {
  const id = eventId || generateEventId();
  if (typeof window.fbq === "function") {
    window.fbq("track", event, data, { eventID: id });
  }
  return id;
};

/** Track custom (non-standard) events */
export const trackCustomEvent = (event: string, data?: Record<string, any>): string => {
  const id = generateEventId();
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", event, data, { eventID: id });
  }
  return id;
};

// Standard events
export const trackLead = (): string => trackEvent("Lead");
export const trackInitiateCheckout = (): string => trackEvent("InitiateCheckout");
export const trackPurchase = (value?: number, currency = "BRL"): string =>
  trackEvent("Purchase", { value, currency });
export const trackViewContent = (data?: Record<string, any>): string =>
  trackEvent("ViewContent", data);
export const trackAddToCart = (data?: Record<string, any>): string =>
  trackEvent("AddToCart", data);
export const trackCompleteRegistration = (data?: Record<string, any>): string =>
  trackEvent("CompleteRegistration", data);
