import { useEffect } from "react";
import { useProfile } from "./useProfile";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

const STORAGE_KEY = "care_reminder_last_shown";

export const useCareReminder = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  // Fetch last activity for inactivity-based reminders
  const { data: lastActivity } = useQuery({
    queryKey: ["last_activity", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_journey")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user || !profile) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown === todayStr) return;

    const hasCareDay = profile.care_day !== null && profile.care_day !== undefined;

    if (hasCareDay) {
      // Cenário 1: notificar apenas no dia configurado
      const today = new Date().getDay();
      if (today !== profile.care_day) return;

      localStorage.setItem(STORAGE_KEY, todayStr);
      toast("🕯️ Hoje é seu Dia de Cuidado Espiritual!", {
        description: "Reserve um momento para cuidar do seu Ori. Acesse seus rituais e orações.",
        duration: 10000,
      });
    } else {
      // Cenário 2: notificar por inatividade (3+ dias)
      if (!lastActivity) return;
      const daysSince = differenceInDays(new Date(), new Date(lastActivity.created_at));
      if (daysSince < 3) return;

      localStorage.setItem(STORAGE_KEY, todayStr);
      const msg = daysSince >= 7
        ? "🙏 Seu Ori sente sua falta…"
        : "🕯️ Hora de cuidar da sua espiritualidade!";
      const desc = daysSince >= 7
        ? `Você está há ${daysSince} dias sem consultar. Volte a cuidar do seu Ori.`
        : `Você está há ${daysSince} dias sem atividade. Que tal consultar o Oráculo?`;

      toast(msg, { description: desc, duration: 10000 });
    }

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Gbá Orun — Cuidado Espiritual", {
          body: "Cuide do seu Ori! 🕯️",
          icon: "/icons/icon-192.png",
        });
      } catch {
        // ignore
      }
    }
  }, [user, profile, lastActivity]);
};
