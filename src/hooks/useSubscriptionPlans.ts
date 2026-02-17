import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_period: string;
  guru_checkout_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
};

export const useActivePlans = () => {
  return useQuery({
    queryKey: ["subscription-plans-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
};

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Omit<SubscriptionPlan, "id" | "created_at">) => {
      const { error } = await supabase.from("subscription_plans").insert(plan as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription-plans"] }),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<SubscriptionPlan> & { id: string }) => {
      const { error } = await supabase.from("subscription_plans").update(rest as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription-plans"] }),
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription-plans"] }),
  });
};
