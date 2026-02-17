import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { key: "ase", name: "Àṣẹ!", description: "Primeira consulta ao Obi", icon: "✨", condition: (s) => s.oracle_throws >= 1 },
  { key: "ire", name: "Iré", description: "5 consultas ao Obi", icon: "🌟", condition: (s) => s.oracle_throws >= 5 },
  { key: "ogbon", name: "Ọgbọ́n", description: "Leu 10 rituais", icon: "📖", condition: (s) => s.rituals_read >= 10 },
  { key: "alafia", name: "Àlàáfíà", description: "10 dias seguidos de prática", icon: "☀️", condition: (s) => s.streak_days >= 10 },
  { key: "iwa_pele", name: "Ìwà Pẹ̀lẹ́", description: "30 dias de prática constante", icon: "👑", condition: (s) => s.streak_days >= 30 },
  { key: "awo", name: "Awó", description: "50 consultas ao Obi", icon: "🔮", condition: (s) => s.oracle_throws >= 50 },
  { key: "babalawo", name: "Babaláwo", description: "100 XP acumulado", icon: "🏆", condition: (s) => s.xp_total >= 100 },
];

export const useAchievements = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useCheckAchievements = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stats: any) => {
      if (!user || !stats) return [];
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("achievement_key")
        .eq("user_id", user.id);
      const existingKeys = new Set(existing?.map((a: any) => a.achievement_key) ?? []);
      const newAchievements: Achievement[] = [];

      for (const ach of ACHIEVEMENTS) {
        if (!existingKeys.has(ach.key) && ach.condition(stats)) {
          await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_key: ach.key,
          });
          newAchievements.push(ach);
        }
      }

      for (const ach of newAchievements) {
        toast(`${ach.icon} ${ach.name}!`, { description: ach.description, duration: 5000 });
      }

      return newAchievements;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["achievements"] }),
  });
};
