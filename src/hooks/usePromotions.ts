import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  checkout_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const usePromotions = (activeOnly = false) => {
  return useQuery({
    queryKey: ["promotions", activeOnly],
    queryFn: async () => {
      let q = supabase
        .from("promotions")
        .select("*")
        .order("display_order", { ascending: true });
      if (activeOnly) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as Promotion[];
    },
  });
};

export const useCreatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Promotion, "id" | "created_at">) => {
      const { error } = await supabase.from("promotions").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
};

export const useUpdatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Promotion> & { id: string }) => {
      const { error } = await supabase.from("promotions").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
};

export const useDeletePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
};

export const useTrackClick = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (promotionId: string) => {
      if (!user) return;
      await supabase.from("promotion_clicks").insert({
        promotion_id: promotionId,
        user_id: user.id,
      });
    },
  });
};

export const usePromotionClickStats = () => {
  return useQuery({
    queryKey: ["promotion-click-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_clicks")
        .select("promotion_id, promotions(title)");
      if (error) throw error;
      const counts: Record<string, { title: string; clicks: number }> = {};
      for (const row of data || []) {
        const pid = row.promotion_id;
        if (!counts[pid]) {
          counts[pid] = { title: (row as any).promotions?.title || "—", clicks: 0 };
        }
        counts[pid].clicks++;
      }
      return Object.values(counts).sort((a, b) => b.clicks - a.clicks);
    },
  });
};
