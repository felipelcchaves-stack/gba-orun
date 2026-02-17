import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicReview {
  id: string;
  display_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export const usePublicReviews = () => {
  return useQuery({
    queryKey: ["public_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_reviews" as any)
        .select("id, display_name, rating, review_text, created_at")
        .eq("rating", 5)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data || []) as unknown as PublicReview[];
    },
  });
};
