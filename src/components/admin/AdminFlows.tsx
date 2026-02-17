import { useState } from "react";
import { useOracleFlows, useCreateFlow, useDeleteFlow, useUpdateFlow, useSetDefaultFlow } from "@/hooks/useOracleFlows";
import { Plus, Trash2, Pencil, Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import FlowBuilder from "./flow-builder/FlowBuilder";

const AdminFlows = () => {
  const { data: flows, isLoading } = useOracleFlows();
  const createFlow = useCreateFlow();
  const deleteFlow = useDeleteFlow();
  const updateFlow = useUpdateFlow();
  const setDefault = useSetDefaultFlow();

  const [newName, setNewName] = useState("");
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const flow = await createFlow.mutateAsync({ name: newName.trim() });
      setNewName("");
      setEditingFlowId(flow.id);
      toast.success("Fluxo criado!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este fluxo e todos os seus blocos?")) return;
    try {
      await deleteFlow.mutateAsync(id);
      if (editingFlowId === id) setEditingFlowId(null);
      toast.success("Fluxo excluído!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault.mutateAsync(id);
      toast.success("Fluxo definido como padrão!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateFlow.mutateAsync({ id, is_active: !current });
      toast.success(!current ? "Fluxo ativado!" : "Fluxo desativado!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (editingFlowId) {
    const flow = flows?.find((f) => f.id === editingFlowId);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setEditingFlowId(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à lista
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {flow?.name || "Editor de Fluxo"}
        </h1>
        <FlowBuilder flowId={editingFlowId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Fluxos do Oráculo</h1>
        <p className="text-sm text-muted-foreground mt-1">Crie e gerencie fluxos visuais de consulta</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nome do novo fluxo..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="max-w-sm"
        />
        <button
          onClick={handleCreate}
          disabled={createFlow.isPending}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> Criar Fluxo
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : flows && flows.length > 0 ? (
        <div className="space-y-3">
          {flows.map((flow) => (
            <div key={flow.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold flex items-center gap-2">
                  {flow.name}
                  {flow.is_default && (
                    <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" /> Padrão
                    </span>
                  )}
                  {!flow.is_active && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inativo</span>
                  )}
                </h3>
                <span className="text-xs text-muted-foreground">{flow.description || "Sem descrição"}</span>
              </div>
              <div className="flex gap-2">
                {!flow.is_default && (
                  <button onClick={() => handleSetDefault(flow.id)} className="p-2 rounded-lg hover:bg-muted" title="Definir como padrão">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => handleToggleActive(flow.id, flow.is_active)} className="p-2 rounded-lg hover:bg-muted text-xs font-medium">
                  {flow.is_active ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => setEditingFlowId(flow.id)} className="p-2 rounded-lg hover:bg-muted">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(flow.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Nenhum fluxo criado ainda.</p>
      )}
    </div>
  );
};

export default AdminFlows;
