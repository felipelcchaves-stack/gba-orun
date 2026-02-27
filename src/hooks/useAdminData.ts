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
  onboarding_completed: boolean | null;
  knows_obi: boolean | null;
  knows_ebo: boolean | null;
  knows_ori: boolean | null;
  knows_iyami: boolean | null;
  knows_egbe_orun: boolean | null;
  device_id: string | null;
  device_changed_at: string | null;
  ifa_status: string | null;
  is_courtesy: boolean;
  last_sign_in_at: string | null;
}

export interface KnowledgeStats {
  total_onboarded: number;
  not_knows_obi: number;
  not_knows_ebo: number;
  not_knows_ori: number;
  not_knows_iyami: number;
  not_knows_egbe_orun: number;
  total_babalawo: number;
  total_iyanifa: number;
  total_omo_ifa: number;
  total_sem_ifa: number;
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

export const useAdminKnowledgeStats = () => {
  return useQuery({
    queryKey: ["admin-knowledge-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_knowledge_stats" as any);
      if (error) throw error;
      const row = (data as unknown as KnowledgeStats[])?.[0];
      return row ?? { total_onboarded: 0, not_knows_obi: 0, not_knows_ebo: 0, not_knows_ori: 0, not_knows_iyami: 0, not_knows_egbe_orun: 0, total_babalawo: 0, total_iyanifa: 0, total_omo_ifa: 0, total_sem_ifa: 0 };
    },
  });
};

export interface SubscriptionHistoryRow {
  month: string;
  new_users: number;
  active_subscribers: number;
  courtesy_users: number;
  overdue_users: number;
  cancelled_users: number;
  revenue_estimate: number;
}

export const useSubscriptionHistory = (granularity: 'daily' | 'monthly' | 'yearly' = 'monthly') => {
  return useQuery({
    queryKey: ["admin-subscription-history", granularity],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_subscription_history_v2" as any, { p_granularity: granularity });
      if (error) throw error;
      return (data ?? []) as SubscriptionHistoryRow[];
    },
  });
};

export interface MonthlyRevenue {
  current_month_revenue: number;
  previous_month_revenue: number;
}

export const useMonthlyRevenue = () => {
  return useQuery({
    queryKey: ["admin-monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_get_monthly_revenue" as any);
      if (error) throw error;
      const row = (data as unknown as MonthlyRevenue[])?.[0];
      return row ?? { current_month_revenue: 0, previous_month_revenue: 0 };
    },
  });
};