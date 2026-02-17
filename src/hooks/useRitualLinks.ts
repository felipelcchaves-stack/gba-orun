import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RitualLink {
  id: string;
  app_point: string;
  ritual_id: string | null;
  created_at: string;
}

export const useRitualLinks = () => {
  return useQuery({
    queryKey: ["ritual-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_ritual_links" as any)
        .select("*");
      if (error) throw error;
      return (data as any[]) as RitualLink[];
    },
  });
};

export const useRitualLinkForPoint = (point: string) => {
  const { data: links } = useRitualLinks();
  return links?.find(l => l.app_point === point)?.ritual_id ?? null;
};

export const useSaveRitualLink = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ app_point, ritual_id }: { app_point: string; ritual_id: string | null }) => {
      // Upsert: try update first, then insert
      const { data: existing } = await supabase
        .from("app_ritual_links" as any)
        .select("id")
        .eq("app_point", app_point)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("app_ritual_links" as any)
          .update({ ritual_id } as any)
          .eq("app_point", app_point);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("app_ritual_links" as any)
          .insert({ app_point, ritual_id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ritual-links"] }),
  });
};
