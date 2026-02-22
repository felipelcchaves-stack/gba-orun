const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;
const STORAGE_KEY = "gba_utm_params";

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Read UTMs from the current URL and persist in sessionStorage. Call once on app mount. */
export const captureUtms = () => {
  const params = new URLSearchParams(window.location.search);
  const stored = getUtmParams();
  let hasNew = false;

  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) {
      stored[key] = val;
      hasNew = true;
    }
  }

  if (hasNew) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // quota exceeded — ignore
    }
  }
};

/** Retrieve stored UTM params */
export const getUtmParams = (): UtmParams => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/** Append stored UTMs as query params to a URL string */
export const appendUtmsToUrl = (url: string): string => {
  if (!url || url === "#") return url;
  const utms = getUtmParams();
  const entries = Object.entries(utms).filter(([, v]) => v);
  if (entries.length === 0) return url;

  try {
    const u = new URL(url, window.location.origin);
    for (const [key, value] of entries) {
      if (!u.searchParams.has(key)) u.searchParams.set(key, value!);
    }
    // If external URL return full, otherwise return path + search
    return url.startsWith("http") ? u.toString() : u.pathname + u.search + u.hash;
  } catch {
    return url;
  }
};
