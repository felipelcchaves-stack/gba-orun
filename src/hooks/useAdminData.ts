import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  religion: string | null;
  is_premium: boolean;
  care_day: number | null;
  guru_id: string | null;
  created_at: string;
  gender: string | null;
  birth_date: string | null;
  subscription_status: string | null;
  subscription_plan_id: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  guru_subscription_id: string | null;
}

export interface AdminStats {
  total_users: number;
  premium_users: number;
  free_users: number;
  total_consultations: number;
  consultations_today: number;
  total_rituals: number;
  total_posts: number;
  total_replies: number;
  active_subscribers: number;
  overdue_users: number;
  total_promo_clicks: number;
  promo_clicks_today: number;
}

export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_profiles");
      if (error) throw error;
      return (data ?? []) as AdminProfile[];
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_stats");
      if (error) throw error;
      const row = (data as unknown as AdminStats[])?.[0];
      return row ?? { total_users: 0, premium_users: 0, free_users: 0, total_consultations: 0, consultations_today: 0, total_rituals: 0, total_posts: 0, total_replies: 0, active_subscribers: 0, overdue_users: 0, total_promo_clicks: 0, promo_clicks_today: 0 };
    },
  });
};
