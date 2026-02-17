import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useJourney = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["journey", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_journey")
        .select("*, rituals(title, category, image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useAddJourneyEntry = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ oracle_result, suggested_ritual_id }: { oracle_result: string; suggested_ritual_id?: string }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("user_journey").insert({
        user_id: user.id,
        oracle_result,
        suggested_ritual_id: suggested_ritual_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey"] }),
  });
};

export const useCompleteJourney = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_journey").update({
        completed: true,
        completed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey"] }),
  });
};
