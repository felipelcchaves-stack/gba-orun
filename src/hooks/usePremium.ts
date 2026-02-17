import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";

export const usePremium = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["premium", user?.id],
    queryFn: async () => {
      if (!user) return { isPremium: false, status: "free" as string, expiresAt: null as string | null };
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, subscription_status, subscription_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();
      
      let isPremium = data?.is_premium ?? false;
      const expiresAt = (data as any)?.subscription_expires_at as string | null;
      
      // Double-check: if expires_at is in the past, treat as not premium
      if (isPremium && expiresAt && new Date(expiresAt) < new Date()) {
        isPremium = false;
      }
      
      return {
        isPremium,
        status: (data as any)?.subscription_status ?? "free",
        expiresAt,
      };
    },
    enabled: !!user,
  });

  return {
    isPremium: data?.isPremium ?? false,
    subscriptionStatus: data?.status ?? "free",
    expiresAt: data?.expiresAt ?? null,
    loading: isLoading,
    isLoggedIn: !!user,
  };
};
