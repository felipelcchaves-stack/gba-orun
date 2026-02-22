import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";
import { demoStats } from "@/lib/demoData";

export const useUserStats = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ["user_stats", isDemo ? "demo" : user?.id],
    queryFn: async () => {
      if (isDemo) return demoStats;
      if (!user) return null;
      const { data } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: isDemo || !!user,
  });
};

export const useAddXP = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { isDemo } = useDemo();
  return useMutation({
    mutationFn: async ({ xp, field }: { xp: number; field?: "oracle_throws" | "rituals_read" }) => {
      if (isDemo) return; // no-op in demo
      if (!user) throw new Error("Not logged in");
      // Upsert stats
      const { data: existing } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const today = new Date().toISOString().split("T")[0];

      if (existing) {
        const lastActive = existing.last_active;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newStreak = existing.streak_days;
        if (lastActive === yesterday) newStreak += 1;
        else if (lastActive !== today) newStreak = 1;

        const updates: any = {
          xp_total: existing.xp_total + xp,
          last_active: today,
          streak_days: newStreak,
        };
        if (field === "oracle_throws") updates.oracle_throws = existing.oracle_throws + 1;
        if (field === "rituals_read") updates.rituals_read = existing.rituals_read + 1;

        await supabase.from("user_stats").update(updates).eq("user_id", user.id);
      } else {
        const insert: any = {
          user_id: user.id,
          xp_total: xp,
          last_active: today,
          streak_days: 1,
          oracle_throws: field === "oracle_throws" ? 1 : 0,
          rituals_read: field === "rituals_read" ? 1 : 0,
        };
        await supabase.from("user_stats").insert(insert);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_stats"] }),
  });
};
