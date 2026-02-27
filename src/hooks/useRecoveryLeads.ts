import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecoveryLead {
  user_id: string;
  display_name: string | null;
  email: string | null;
  promotion_title: string;
  promotion_id: string;
  last_clicked_at: string;
  total_clicks: number;
  converted: boolean;
}

export const useRecoveryLeads = (promotionFilter: string, periodDays: number | null) => {
  return useQuery({
    queryKey: ["recovery-leads", promotionFilter, periodDays],
    queryFn: async () => {
      // Fetch clicks with promotion title
      let clicksQuery = supabase
        .from("promotion_clicks")
        .select("user_id, promotion_id, clicked_at, converted_at, promotions(title)");

      if (promotionFilter) {
        clicksQuery = clicksQuery.eq("promotion_id", promotionFilter);
      }

      if (periodDays) {
        const since = new Date();
        since.setDate(since.getDate() - periodDays);
        clicksQuery = clicksQuery.gte("clicked_at", since.toISOString());
      }

      const { data: clicks, error: clicksError } = await clicksQuery;
      if (clicksError) throw clicksError;

      // Fetch profiles with emails via RPC
      const { data: profiles, error: profilesError } = await supabase.rpc("admin_list_profiles");
      if (profilesError) throw profilesError;

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, { display_name: p.display_name, email: p.email }])
      );

      // Group by user_id + promotion_id
      const grouped = new Map<string, RecoveryLead>();

      for (const click of clicks || []) {
        const key = `${click.user_id}_${click.promotion_id}`;
        const existing = grouped.get(key);
        const promoTitle = (click as any).promotions?.title || "Promoção removida";

        if (existing) {
          existing.total_clicks += 1;
          if (click.clicked_at > existing.last_clicked_at) {
            existing.last_clicked_at = click.clicked_at;
          }
          if (click.converted_at) existing.converted = true;
        } else {
          const profile = profileMap.get(click.user_id);
          grouped.set(key, {
            user_id: click.user_id,
            display_name: profile?.display_name || null,
            email: profile?.email || null,
            promotion_title: promoTitle,
            promotion_id: click.promotion_id,
            last_clicked_at: click.clicked_at,
            total_clicks: 1,
            converted: !!click.converted_at,
          });
        }
      }

      const leads = Array.from(grouped.values()).sort(
        (a, b) => new Date(b.last_clicked_at).getTime() - new Date(a.last_clicked_at).getTime()
      );

      return leads;
    },
  });
};
