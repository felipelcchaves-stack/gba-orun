import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";

export const usePremium = () => {
  const { user } = useAuth();

  const { data: isPremium, isLoading } = useQuery({
    queryKey: ["premium", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.is_premium ?? false;
    },
    enabled: !!user,
  });

  return { isPremium: isPremium ?? false, loading: isLoading, isLoggedIn: !!user };
};
