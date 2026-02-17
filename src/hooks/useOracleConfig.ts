import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────
export interface OracleConfig {
  id: string;
  result_key: string;
  name: string;
  meaning: string;
  description_ire: string;
  description_ibi: string;
  color_type: string;
  display_order: number;
}

export interface OracleTaskTemplate {
  id: string;
  oracle_result_key: string | null;
  ire_or_ibi: string | null;
  condition: string;
  task_title: string;
  task_type: string;
  category: string;
  ritual_id: string | null;
  display_order: number;
  intention: string | null;
}

export interface OracleStepText {
  id: string;
  step_key: string;
  title: string;
  description: string;
}

// ─── Queries ─────────────────────────────────────────────
export const useOracleConfigs = () =>
  useQuery({
    queryKey: ["oracle_configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_configs" as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as unknown as OracleConfig[];
    },
  });

export const useOracleTaskTemplates = () =>
  useQuery({
    queryKey: ["oracle_task_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_task_templates" as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as unknown as OracleTaskTemplate[];
    },
  });

export const useOracleStepTexts = () =>
  useQuery({
    queryKey: ["oracle_step_texts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_step_texts" as any)
        .select("*");
      if (error) throw error;
      return (data ?? []) as unknown as OracleStepText[];
    },
  });

// Helper to get a specific step text with fallback
export const useStepText = (stepKey: string, fallbackTitle: string, fallbackDesc: string) => {
  const { data: texts } = useOracleStepTexts();
  const found = texts?.find((t) => t.step_key === stepKey);
  return {
    title: found?.title || fallbackTitle,
    description: found?.description || fallbackDesc,
  };
};

// ─── Mutations ───────────────────────────────────────────
export const useUpdateOracleConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<OracleConfig> & { id: string }) => {
      const { id, ...rest } = config;
      const { error } = await supabase
        .from("oracle_configs" as any)
        .update(rest as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_configs"] }),
  });
};

export const useUpsertOracleTaskTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Partial<OracleTaskTemplate> & { id?: string }) => {
      if (t.id) {
        const { id, ...rest } = t;
        const { error } = await supabase
          .from("oracle_task_templates" as any)
          .update(rest as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("oracle_task_templates" as any)
          .insert(t as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_task_templates"] }),
  });
};

export const useDeleteOracleTaskTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("oracle_task_templates" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_task_templates"] }),
  });
};

export const useUpdateOracleStepText = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Partial<OracleStepText> & { id: string }) => {
      const { id, ...rest } = t;
      const { error } = await supabase
        .from("oracle_step_texts" as any)
        .update(rest as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_step_texts"] }),
  });
};
