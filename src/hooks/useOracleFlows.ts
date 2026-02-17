import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OracleFlow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OracleFlowNode {
  id: string;
  flow_id: string;
  node_type: string;
  label: string;
  config: Record<string, any>;
  position_x: number;
  position_y: number;
}

export interface OracleFlowEdge {
  id: string;
  flow_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle: string;
  label: string;
}

// --- Flows ---
export const useOracleFlows = () =>
  useQuery({
    queryKey: ["oracle_flows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_flows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OracleFlow[];
    },
  });

export const useDefaultOracleFlow = () =>
  useQuery({
    queryKey: ["oracle_flows", "default"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_flows")
        .select("*")
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as OracleFlow | null;
    },
  });

export const useCreateFlow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("oracle_flows")
        .insert({ name: payload.name, description: payload.description || "" })
        .select()
        .single();
      if (error) throw error;
      return data as OracleFlow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_flows"] }),
  });
};

export const useUpdateFlow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string } & Partial<OracleFlow>) => {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("oracle_flows").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_flows"] }),
  });
};

export const useDeleteFlow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("oracle_flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_flows"] }),
  });
};

export const useSetDefaultFlow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Remove default from all flows first
      await supabase.from("oracle_flows").update({ is_default: false }).neq("id", id);
      const { error } = await supabase.from("oracle_flows").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["oracle_flows"] }),
  });
};

// --- Flow Nodes ---
export const useFlowNodes = (flowId: string | undefined) =>
  useQuery({
    queryKey: ["oracle_flow_nodes", flowId],
    enabled: !!flowId,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_flow_nodes")
        .select("*")
        .eq("flow_id", flowId!);
      if (error) throw error;
      return data as OracleFlowNode[];
    },
  });

export const useFlowEdges = (flowId: string | undefined) =>
  useQuery({
    queryKey: ["oracle_flow_edges", flowId],
    enabled: !!flowId,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_flow_edges")
        .select("*")
        .eq("flow_id", flowId!);
      if (error) throw error;
      return data as OracleFlowEdge[];
    },
  });

export const useSaveFlowCanvas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      flowId,
      nodes,
      edges,
    }: {
      flowId: string;
      nodes: Omit<OracleFlowNode, "id">[];
      edges: Omit<OracleFlowEdge, "id">[];
    }): Promise<{ nodeIdMap: Record<string, string> }> => {
      // 1. Verificar sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada. Faça login novamente para salvar.");

      // 2. Delete com verificação de erro
      const { error: delEdgesErr } = await supabase.from("oracle_flow_edges").delete().eq("flow_id", flowId);
      if (delEdgesErr) throw new Error("Erro ao limpar edges: " + delEdgesErr.message);

      const { error: delNodesErr } = await supabase.from("oracle_flow_nodes").delete().eq("flow_id", flowId);
      if (delNodesErr) throw new Error("Erro ao limpar nodes: " + delNodesErr.message);

      const nodeIdMap: Record<string, string> = {};

      if (nodes.length > 0) {
        // Strip _tempId from config before saving, but keep the mapping
        const cleanNodes = nodes.map((n) => {
          const { _tempId, ...cleanConfig } = (n.config as any) || {};
          return { ...n, config: cleanConfig, _originalTempId: _tempId };
        });

        const toInsert = cleanNodes.map(({ _originalTempId, ...rest }) => rest);

        const { data: insertedNodes, error: nErr } = await supabase
          .from("oracle_flow_nodes")
          .insert(toInsert)
          .select();
        if (nErr) throw nErr;

        // Build temp -> db id map
        cleanNodes.forEach((n, i) => {
          if (n._originalTempId && insertedNodes?.[i]) {
            nodeIdMap[n._originalTempId] = insertedNodes[i].id;
          }
        });

        // Insert edges with mapped ids
        if (edges.length > 0 && insertedNodes) {
          const mappedEdges = edges.map((e) => ({
            flow_id: flowId,
            source_node_id: nodeIdMap[e.source_node_id] || e.source_node_id,
            target_node_id: nodeIdMap[e.target_node_id] || e.target_node_id,
            source_handle: e.source_handle,
            label: e.label,
          }));
          const { error: eErr } = await supabase.from("oracle_flow_edges").insert(mappedEdges);
          if (eErr) throw eErr;
        }
      }

      return { nodeIdMap };
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["oracle_flow_nodes", vars.flowId] });
      qc.invalidateQueries({ queryKey: ["oracle_flow_edges", vars.flowId] });
      qc.invalidateQueries({ queryKey: ["oracle_flows"] });
    },
  });
};
