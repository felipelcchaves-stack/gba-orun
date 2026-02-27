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
  show_on_home: boolean;
  target_knowledge_gaps: string[];
  force_show_all: boolean;
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

export const useTargetedPromotions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["promotions", "targeted", user?.id],
    queryFn: async () => {
      const { data: promos, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;

      if (!user) {
        return (promos as Promotion[])?.filter(p =>
          p.force_show_all || !p.target_knowledge_gaps?.length
        );
      }

      const { data: knowledge } = await supabase
        .from("user_knowledge")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return (promos as Promotion[])?.filter(p => {
        if (p.force_show_all) return true;
        if (!p.target_knowledge_gaps?.length) return true;
        const knowledgeMap: Record<string, boolean | undefined> = {
          obi: knowledge?.knows_obi,
          ebo: knowledge?.knows_ebo,
          ori: knowledge?.knows_ori,
          iyami: knowledge?.knows_iyami,
          egbe_orun: knowledge?.knows_egbe_orun,
        };
        return p.target_knowledge_gaps.some(gap => !knowledgeMap[gap]);
      });
    },
  });
};

export const useHomeBannerPromotion = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["promotions", "home-banner", user?.id],
    queryFn: async () => {
      const { data: promos, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .eq("show_on_home", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      if (!promos?.length) return null;

      if (!user) {
        return (promos as Promotion[]).find(p =>
          p.force_show_all || !p.target_knowledge_gaps?.length
        ) || null;
      }

      const { data: knowledge } = await supabase
        .from("user_knowledge")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const knowledgeMap: Record<string, boolean | undefined> = {
        obi: knowledge?.knows_obi,
        ebo: knowledge?.knows_ebo,
        ori: knowledge?.knows_ori,
        iyami: knowledge?.knows_iyami,
        egbe_orun: knowledge?.knows_egbe_orun,
      };

      return (promos as Promotion[]).find(p => {
        if (p.force_show_all) return true;
        if (!p.target_knowledge_gaps?.length) return true;
        return p.target_knowledge_gaps.some(gap => !knowledgeMap[gap]);
      }) || null;
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
        .select("promotion_id, converted_at, promotions(title)");
      if (error) throw error;
      const counts: Record<string, { title: string; clicks: number; conversions: number }> = {};
      for (const row of data || []) {
        const pid = row.promotion_id;
        if (!counts[pid]) {
          counts[pid] = { title: (row as any).promotions?.title || "—", clicks: 0, conversions: 0 };
        }
        counts[pid].clicks++;
        if (row.converted_at) counts[pid].conversions++;
      }
      return Object.values(counts).sort((a, b) => b.clicks - a.clicks);
    },
  });
};

export const useUserConvertedPromotion = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-converted-promotion", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotion_clicks")
        .select("converted_at, promotions(title)")
        .eq("user_id", userId!)
        .not("converted_at", "is", null)
        .order("converted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        title: (data as any).promotions?.title || "—",
        converted_at: data.converted_at,
      };
    },
  });
};
