import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IreIbiType {
  id: string;
  category: "ire" | "ibi";
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const useIreIbiTypes = () =>
  useQuery({
    queryKey: ["ire-ibi-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ire_ibi_types" as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as unknown as IreIbiType[];
    },
  });

export const useAllIreIbiTypes = () =>
  useQuery({
    queryKey: ["ire-ibi-types-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ire_ibi_types" as any)
        .select("*")
        .order("category")
        .order("display_order");
      if (error) throw error;
      return data as unknown as IreIbiType[];
    },
  });

export const useCreateIreIbiType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<IreIbiType, "id" | "created_at">) => {
      const { error } = await supabase.from("ire_ibi_types" as any).insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ire-ibi-types"] }),
  });
};

export const useUpdateIreIbiType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<IreIbiType> & { id: string }) => {
      const { error } = await supabase.from("ire_ibi_types" as any).update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ire-ibi-types"] }),
  });
};

export const useDeleteIreIbiType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ire_ibi_types" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ire-ibi-types"] }),
  });
};
