import { useState, useEffect, useCallback } from "react";

let globalDeferredPrompt: any = null;
const listeners = new Set<() => void>();

// Capture the event globally (runs once)
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    listeners.forEach((fn) => fn());
  });
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(globalDeferredPrompt);
  const [isIOS] = useState(() =>
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)
  );
  const [isInstalled] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    const update = () => setDeferredPrompt(globalDeferredPrompt);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!globalDeferredPrompt) return false;
    globalDeferredPrompt.prompt();
    const { outcome } = await globalDeferredPrompt.userChoice;
    globalDeferredPrompt = null;
    setDeferredPrompt(null);
    return outcome === "accepted";
  }, []);

  return { deferredPrompt, isIOS, isInstalled, triggerInstall };
};
