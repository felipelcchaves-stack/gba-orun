import { useEffect } from "react";
import { useProfile } from "./useProfile";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const STORAGE_KEY = "care_reminder_last_shown";

export const useCareReminder = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!user || !profile || profile.care_day === null || profile.care_day === undefined) return;

    const today = new Date().getDay();
    if (today !== profile.care_day) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown === todayStr) return;

    localStorage.setItem(STORAGE_KEY, todayStr);

    // Toast reminder
    toast("🕯️ Hoje é seu Dia de Cuidado Espiritual!", {
      description: "Reserve um momento para cuidar do seu Ori. Acesse seus rituais e orações.",
      duration: 10000,
    });

    // Browser notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Gbá Orun — Dia de Cuidado", {
          body: "Hoje é seu dia de cuidado espiritual. Cuide do seu Ori! 🕯️",
          icon: "/icons/icon-192.png",
        });
      } catch {
        // SW notification fallback not needed for MVP
      }
    }
  }, [user, profile]);
};
