import { useAuth } from "./useAuth";
import { useUserStats } from "./useUserStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const DISMISS_KEY = "review_dismissed";

export const useReviewPrompt = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");

  const { data: existingReview, isLoading } = useQuery({
    queryKey: ["user_review_exists", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_reviews" as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!stats && (stats.xp_total ?? 0) >= 200 && !dismissed,
  });

  const shouldShow = !!user && !isLoading && !existingReview && !dismissed && (stats?.xp_total ?? 0) >= 200;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return { shouldShow, dismiss };
};
