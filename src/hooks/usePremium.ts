import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { useDemo } from "@/contexts/DemoContext";

export const usePremium = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();

  const { data, isLoading } = useQuery({
    queryKey: ["premium", isDemo ? "demo" : user?.id],
    queryFn: async () => {
      if (isDemo) return { isPremium: false, status: "free" as string, expiresAt: null as string | null, daysRemaining: null as number | null };
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, subscription_status, subscription_expires_at, subscription_plan_id, guru_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      let isPremium = data?.is_premium ?? false;
      const expiresAt = (data as any)?.subscription_expires_at as string | null;
      const hadSubscription = !!(data as any)?.subscription_plan_id || !!(data as any)?.guru_subscription_id;
      let status = (data as any)?.subscription_status ?? "free";
      
      // Protect against false overdue: if user never had a subscription, treat as free
      if (status === "overdue" && !hadSubscription) {
        status = "free";
      }
      
      // Double-check: if expires_at is in the past, treat as not premium
      if (isPremium && expiresAt && new Date(expiresAt) < new Date()) {
        isPremium = false;
      }

      // Calculate days remaining
      let daysRemaining: number | null = null;
      if (expiresAt) {
        const diff = new Date(expiresAt).getTime() - Date.now();
        daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }
      
      return {
        isPremium,
        status,
        expiresAt,
        daysRemaining,
      };
    },
    enabled: isDemo || !!user,
  });

  const daysRemaining = data?.daysRemaining ?? null;

  return {
    isPremium: data?.isPremium ?? false,
    subscriptionStatus: data?.status ?? "free",
    expiresAt: data?.expiresAt ?? null,
    loading: isLoading,
    isLoggedIn: !!user,
    daysRemaining,
    isExpiringSoon: daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3,
    isOverdue: data?.status === "overdue",
  };
};
