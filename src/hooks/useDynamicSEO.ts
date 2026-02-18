import { useEffect } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";

const updateMeta = (selector: string, attribute: string, value: string) => {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const isProperty = selector.includes("property=");
    if (isProperty) {
      el.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
    } else if (selector.includes("name=")) {
      el.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
};

export const useDynamicSEO = () => {
  const { data: settings } = useAppSettings();

  useEffect(() => {
    if (!settings) return;

    const title = settings.seo_title;
    const description = settings.seo_description;
    const ogImage = settings.seo_og_image;
    const canonical = settings.seo_canonical_url;
    const twitterCard = settings.seo_twitter_card;

    if (title) document.title = title;
    if (description) updateMeta('meta[name="description"]', "content", description);
    if (title) updateMeta('meta[property="og:title"]', "content", title);
    if (description) updateMeta('meta[property="og:description"]', "content", description);
    if (ogImage) updateMeta('meta[property="og:image"]', "content", ogImage);
    if (title) updateMeta('meta[name="twitter:title"]', "content", title);
    if (description) updateMeta('meta[name="twitter:description"]', "content", description);
    if (ogImage) updateMeta('meta[name="twitter:image"]', "content", ogImage);
    if (twitterCard) updateMeta('meta[name="twitter:card"]', "content", twitterCard);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [settings]);
};
