import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Offering {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  category: string;
  is_premium: boolean;
  audio_url: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export const useOfferings = (category?: string) => {
  return useQuery({
    queryKey: ["offerings", category],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      let query = (supabase.from("offerings" as any) as any).select("*").order("display_order");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Offering[];
    },
  });
};

export const useCreateOffering = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offering: Omit<Offering, "id" | "created_at">) => {
      const { data, error } = await (supabase.from("offerings" as any) as any).insert(offering).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offerings"] }),
  });
};

export const useUpdateOffering = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...offering }: Partial<Offering> & { id: string }) => {
      const { data, error } = await (supabase.from("offerings" as any) as any).update(offering).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offerings"] }),
  });
};

export const useDeleteOffering = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("offerings" as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offerings"] }),
  });
};

export const useOfferingCategories = () => {
  return useQuery({
    queryKey: ["offering-categories"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await (supabase.from("offerings" as any) as any).select("category");
      if (error) throw error;
      const unique = [...new Set((data || []).map((r: any) => r.category))];
      return unique as string[];
    },
  });
};