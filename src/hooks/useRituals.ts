import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Ritual {
  id: string;
  title: string;
  category: string;
  content_full: string;
  trigger_oracle: string | null;
  image_url: string | null;
  audio_url: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export const useRituals = (category?: string) => {
  return useQuery({
    queryKey: ["rituals", category],
    queryFn: async () => {
      let query = supabase.from("rituals").select("*").order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data as Ritual[];
    },
  });
};

export const useRitual = (id: string) => {
  return useQuery({
    queryKey: ["ritual", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("rituals").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Ritual;
    },
    enabled: !!id,
  });
};

export const useCreateRitual = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ritual: Omit<Ritual, "id" | "created_at" | "updated_at">) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada. Faça login novamente.");
      const { data, error } = await supabase.from("rituals").insert(ritual).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rituals"] }),
  });
};

export const useUpdateRitual = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...ritual }: Partial<Ritual> & { id: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada. Faça login novamente.");
      const { data, error } = await supabase.from("rituals").update(ritual).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rituals"] }),
  });
};

export const useDeleteRitual = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada. Faça login novamente.");
      const { error } = await supabase.from("rituals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rituals"] }),
  });
};
