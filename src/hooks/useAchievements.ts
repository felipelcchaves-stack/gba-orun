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
  // Primeiros passos
  { key: "ase", name: "Àṣẹ!", description: "Primeira consulta ao Obi", icon: "✨", condition: (s) => s.oracle_throws >= 1 },
  { key: "leitor", name: "Leitor", description: "Primeiro ritual lido", icon: "📖", condition: (s) => s.rituals_read >= 1 },
  // Marcos de Obi
  { key: "ire", name: "Iré", description: "5 consultas ao Obi", icon: "🌟", condition: (s) => s.oracle_throws >= 5 },
  { key: "obi_mestre", name: "Obi Mestre", description: "15 consultas ao Obi", icon: "👁️", condition: (s) => s.oracle_throws >= 15 },
  { key: "awo", name: "Awó", description: "50 consultas ao Obi", icon: "🔮", condition: (s) => s.oracle_throws >= 50 },
  // Marcos de Leitura
  { key: "estudioso", name: "Estudioso", description: "3 rituais lidos", icon: "📚", condition: (s) => s.rituals_read >= 3 },
  { key: "ogbon", name: "Ọgbọ́n", description: "10 rituais lidos", icon: "📜", condition: (s) => s.rituals_read >= 10 },
  { key: "sabio", name: "Sábio", description: "25 rituais lidos", icon: "🧠", condition: (s) => s.rituals_read >= 25 },
  { key: "mestre", name: "Mestre", description: "50 rituais lidos", icon: "🏆", condition: (s) => s.rituals_read >= 50 },
  // Marcos de Streak
  { key: "constante", name: "Constante", description: "3 dias seguidos", icon: "🔥", condition: (s) => s.streak_days >= 3 },
  { key: "devoto", name: "Devoto", description: "7 dias seguidos", icon: "📅", condition: (s) => s.streak_days >= 7 },
  { key: "alafia", name: "Àlàáfíà", description: "14 dias seguidos", icon: "☀️", condition: (s) => s.streak_days >= 14 },
  { key: "iwa_pele", name: "Ìwà Pẹ̀lẹ́", description: "30 dias de prática", icon: "👑", condition: (s) => s.streak_days >= 30 },
  // Marcos de XP
  { key: "babalawo", name: "Babaláwo", description: "100 XP acumulado", icon: "🥇", condition: (s) => s.xp_total >= 100 },
  { key: "iluminado", name: "Iluminado", description: "250 XP acumulado", icon: "💫", condition: (s) => s.xp_total >= 250 },
  { key: "ancestral", name: "Ancestral", description: "500 XP acumulado", icon: "💎", condition: (s) => s.xp_total >= 500 },
];

// Map key -> Achievement for quick lookup
export const ACHIEVEMENT_MAP: Record<string, Achievement> = {};
for (const a of ACHIEVEMENTS) {
  ACHIEVEMENT_MAP[a.key] = a;
}

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
