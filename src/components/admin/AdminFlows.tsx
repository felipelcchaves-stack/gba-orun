import { useState } from "react";
import { useOracleFlows, useCreateFlow, useDeleteFlow, useUpdateFlow, useSetDefaultFlow, useSaveFlowCanvas } from "@/hooks/useOracleFlows";
import { Plus, Trash2, Pencil, Star, ArrowLeft, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FlowBuilder from "./flow-builder/FlowBuilder";

const AdminFlows = () => {
  const { data: flows, isLoading } = useOracleFlows();
  const createFlow = useCreateFlow();
  const deleteFlow = useDeleteFlow();
  const updateFlow = useUpdateFlow();
  const setDefault = useSetDefaultFlow();
  const saveCanvas = useSaveFlowCanvas();

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [creatingDefault, setCreatingDefault] = useState(false);
  const [creatingOrientation, setCreatingOrientation] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const flow = await createFlow.mutateAsync({ name: newName.trim(), description: newDesc.trim() });
      setNewName("");
      setNewDesc("");
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

  const handleCreateDefaultFlow = async () => {
    setCreatingDefault(true);
    try {
      // Create flow
      const flow = await createFlow.mutateAsync({
        name: "Cuidado Espiritual Semanal",
        description: "Rotina de manutenção e proteção espiritual com lançamento de Obi",
      });

      // Define nodes
      const tempNodes = [
        { id: "n_start", type: "start", label: "Início", config: { description: "Bem-vindo à sua consulta espiritual" }, x: 250, y: 0 },
        { id: "n_welcome", type: "message", label: "Acolhimento", config: { message: "Que a paz do Orixá esteja com você. Vamos iniciar sua consulta espiritual.", description: "Mensagem de boas-vindas" }, x: 250, y: 120 },
        { id: "n_obi", type: "obi", label: "Lançamento do Obi", config: { description: "Qual foi o resultado do seu Obi hoje?", guidance_message: "Lance os 4 búzios e observe quantos caem abertos (com a parte côncava para cima)." }, x: 250, y: 260 },
        { id: "n_ireibi", type: "ire_ibi", label: "Natureza do Resultado", config: { description: "Selecione o subtipo específico", guidance_message: "Cada resultado possui nuances. Selecione o que mais se aproxima da sua situação." }, x: 250, y: 400 },
        { id: "n_ebo", type: "yes_no", label: "Ebó", config: { question: "Já apurou o Ebó?", yes_label: "Sim, já apurei", no_label: "Não, ainda não", guidance_message: "O Ebó é a oferenda de equilíbrio. Se já sabe qual é, confirme." }, x: 250, y: 540 },
        { id: "n_ebo_tipo", type: "multiple_choice", label: "Tipo de Ebó", config: { question: "Qual tipo de Ebó foi apurado?", options: [{ label: "Limpeza", description: "Para remover energias negativas" }, { label: "Agradecimento", description: "Para agradecer bênçãos recebidas" }, { label: "Proteção", description: "Para fortalecer sua defesa espiritual" }] }, x: 500, y: 540 },
        { id: "n_ori", type: "yes_no", label: "Orí", config: { question: "O Orí precisa de algo?", yes_label: "Sim", no_label: "Não", guidance_message: "O Orí é sua essência espiritual. Às vezes precisa de fortalecimento." }, x: 250, y: 680 },
        { id: "n_ori_acao", type: "multiple_choice", label: "Ação para o Orí", config: { question: "O que o Orí precisa?", options: [{ label: "Ibori", description: "Alimentação do Orí" }, { label: "Oração", description: "Oração específica ao Orí" }, { label: "Ambos", description: "Ibori e Oração" }] }, x: 500, y: 680 },
        { id: "n_iyami", type: "yes_no", label: "Iyami", config: { question: "As Iyami querem algo?", yes_label: "Sim", no_label: "Não", guidance_message: "As Iyami são as Mães Ancestrais. Quando pedem atenção, é importante atender." }, x: 250, y: 820 },
        { id: "n_egbe", type: "yes_no", label: "Egbe Orun", config: { question: "O Egbe Orun quer algo?", yes_label: "Sim", no_label: "Não", guidance_message: "O Egbe Orun é sua comunidade espiritual no Orun." }, x: 250, y: 960 },
        { id: "n_diagnosis", type: "diagnosis", label: "Diagnóstico Completo", config: {
          description: "Resumo da sua consulta ao Obi",
          guidance_message: "Confira as tarefas sugeridas e vincule os rituais adequados. Você pode trocar por outros se preferir.",
          tasks: [
            { task_title: "Fazer Ebó", task_type: "ebo", category: "ebo", condition: "answer_not_equals:n_ebo:sim", guidance_message: "O Ebó é fundamental para o equilíbrio espiritual." },
            { task_title: "Fazer Ebó Apurado", task_type: "ebo", category: "ebo", condition: "answer_equals:n_ebo:sim", guidance_message: "Realize o Ebó conforme apurado na consulta." },
            { task_title: "Ibori de Proteção", task_type: "ibori", category: "ibori", condition: "answer_equals:n_ori:sim", guidance_message: "Alimente seu Orí com o Ibori." },
            { task_title: "Oração ao Orí", task_type: "oracao_ori", category: "oracao_ori", condition: "answer_equals:n_ori:sim", guidance_message: "Faça a oração ao seu Orí." },
            { task_title: "Oração para Iyami", task_type: "oracao_iyami", category: "oracao_iyami", condition: "answer_equals:n_iyami:sim", guidance_message: "Atenda ao chamado das Mães Ancestrais." },
            { task_title: "Oferenda ao Egbe Orun", task_type: "egbe_orun", category: "egbe_orun", condition: "answer_equals:n_egbe:sim", guidance_message: "Faça a oferenda para seu Egbe Orun." },
            { task_title: "Oração da Manhã", task_type: "oracao_manha", category: "oracao_manha", condition: "always", guidance_message: "Inicie seu dia com a oração sagrada." },
          ],
        }, x: 250, y: 1100 },
      ];

      const nodesPayload = tempNodes.map(n => ({
        flow_id: flow.id,
        node_type: n.type,
        label: n.label,
        config: { ...n.config, _tempId: n.id },
        position_x: n.x,
        position_y: n.y,
      }));

      const edgesPayload = [
        { source: "n_start", target: "n_welcome", handle: "default" },
        { source: "n_welcome", target: "n_obi", handle: "default" },
        { source: "n_obi", target: "n_ireibi", handle: "alafia" },
        { source: "n_obi", target: "n_ireibi", handle: "ejife" },
        { source: "n_obi", target: "n_ireibi", handle: "etagun" },
        { source: "n_obi", target: "n_ireibi", handle: "okaran" },
        { source: "n_obi", target: "n_ireibi", handle: "oyekun" },
        { source: "n_ireibi", target: "n_ebo", handle: "ire" },
        { source: "n_ireibi", target: "n_ebo", handle: "ibi" },
        { source: "n_ebo", target: "n_ebo_tipo", handle: "sim" },
        { source: "n_ebo", target: "n_ori", handle: "nao" },
        { source: "n_ebo_tipo", target: "n_ori", handle: "default" },
        { source: "n_ori", target: "n_ori_acao", handle: "sim" },
        { source: "n_ori", target: "n_iyami", handle: "nao" },
        { source: "n_ori_acao", target: "n_iyami", handle: "default" },
        { source: "n_iyami", target: "n_egbe", handle: "sim" },
        { source: "n_iyami", target: "n_egbe", handle: "nao" },
        { source: "n_egbe", target: "n_diagnosis", handle: "sim" },
        { source: "n_egbe", target: "n_diagnosis", handle: "nao" },
      ].map(e => ({
        flow_id: flow.id,
        source_node_id: e.source,
        target_node_id: e.target,
        source_handle: e.handle,
        label: "",
      }));

      await saveCanvas.mutateAsync({ flowId: flow.id, nodes: nodesPayload, edges: edgesPayload });

      // Set as default and active
      await setDefault.mutateAsync(flow.id);

      toast.success("Fluxo padrão criado com sucesso! Clique em Editar para personalizar.");
      setEditingFlowId(flow.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingDefault(false);
    }
  };

  const handleCreateOrientationFlow = async () => {
    setCreatingOrientation(true);
    try {
      const flow = await createFlow.mutateAsync({
        name: "Quero uma Orientação",
        description: "Consulta rápida para buscar orientação espiritual sem lançamento de Obi",
      });

      const tempNodes = [
        { id: "n_start", type: "start", label: "Início", config: { description: "Ponto de partida" }, x: 250, y: 0 },
        { id: "n_welcome", type: "message", label: "Acolhimento", config: { message: "O que está tirando sua paz? Vamos buscar uma orientação juntos.", description: "Mensagem de acolhimento" }, x: 250, y: 120 },
        { id: "n_area", type: "multiple_choice", label: "Área de Atenção", config: { question: "Qual área da sua vida precisa de atenção?", options: [{ label: "Saúde", description: "Questões de saúde física ou mental" }, { label: "Financeiro", description: "Questões financeiras e de prosperidade" }, { label: "Relacionamento", description: "Questões afetivas e familiares" }, { label: "Espiritual", description: "Questões de fé e conexão espiritual" }, { label: "Trabalho", description: "Questões profissionais e de carreira" }] }, x: 250, y: 260 },
        { id: "n_cuidado", type: "yes_no", label: "Cuidado Recente", config: { question: "Já fez algum cuidado espiritual recentemente?", yes_label: "Sim", no_label: "Não", guidance_message: "Saber se você já fez algum cuidado ajuda a direcionar a orientação." }, x: 250, y: 400 },
        { id: "n_limpeza", type: "yes_no", label: "Limpeza", config: { question: "Sente necessidade de uma limpeza espiritual?", yes_label: "Sim", no_label: "Não", guidance_message: "A limpeza espiritual remove energias densas e abre caminhos." }, x: 250, y: 540 },
        { id: "n_ori", type: "yes_no", label: "Orí", config: { question: "O Orí precisa de fortalecimento?", yes_label: "Sim", no_label: "Não", guidance_message: "O Orí é sua essência. Quando enfraquecido, tudo fica mais difícil." }, x: 250, y: 680 },
        { id: "n_diagnosis", type: "diagnosis", label: "Orientação", config: {
          description: "Sua orientação espiritual",
          guidance_message: "Confira as tarefas sugeridas com base nas suas respostas.",
          tasks: [
            { task_title: "Ebó de Limpeza", task_type: "ebo", category: "ebo", condition: "answer_equals:n_limpeza:sim", guidance_message: "Realize um Ebó de limpeza para remover energias negativas." },
            { task_title: "Ibori de Fortalecimento", task_type: "ibori", category: "ibori", condition: "answer_equals:n_ori:sim", guidance_message: "Alimente seu Orí com o Ibori para fortalecê-lo." },
            { task_title: "Oração ao Orí", task_type: "oracao_ori", category: "oracao_ori", condition: "answer_equals:n_ori:sim", guidance_message: "Faça a oração ao seu Orí." },
            { task_title: "Oração da Manhã", task_type: "oracao_manha", category: "oracao_manha", condition: "always", guidance_message: "Inicie seu dia com a oração sagrada." },
          ],
        }, x: 250, y: 820 },
      ];

      const nodesPayload = tempNodes.map(n => ({
        flow_id: flow.id,
        node_type: n.type,
        label: n.label,
        config: { ...n.config, _tempId: n.id },
        position_x: n.x,
        position_y: n.y,
      }));

      const edgesPayload = [
        { source: "n_start", target: "n_welcome", handle: "default" },
        { source: "n_welcome", target: "n_area", handle: "default" },
        { source: "n_area", target: "n_cuidado", handle: "default" },
        { source: "n_cuidado", target: "n_limpeza", handle: "sim" },
        { source: "n_cuidado", target: "n_limpeza", handle: "nao" },
        { source: "n_limpeza", target: "n_ori", handle: "sim" },
        { source: "n_limpeza", target: "n_ori", handle: "nao" },
        { source: "n_ori", target: "n_diagnosis", handle: "sim" },
        { source: "n_ori", target: "n_diagnosis", handle: "nao" },
      ].map(e => ({
        flow_id: flow.id,
        source_node_id: e.source,
        target_node_id: e.target,
        source_handle: e.handle,
        label: "",
      }));

      await saveCanvas.mutateAsync({ flowId: flow.id, nodes: nodesPayload, edges: edgesPayload });
      await updateFlow.mutateAsync({ id: flow.id, is_active: true });

      toast.success("Fluxo 'Quero uma Orientação' criado com sucesso!");
      setEditingFlowId(flow.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingOrientation(false);
    }
  };

  if (editingFlowId) {
    const flow = flows?.find((f) => f.id === editingFlowId);
    return (
      <div className="space-y-4">
        <button onClick={() => setEditingFlowId(null)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar à lista
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">{flow?.name || "Editor de Fluxo"}</h1>
        <FlowBuilder flowId={editingFlowId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Fluxos do Oráculo</h1>
        <p className="text-sm text-muted-foreground mt-1">Crie e gerencie fluxos visuais de consulta. Cada fluxo aparece como opção na tela do Oráculo.</p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input placeholder="Nome do novo fluxo..." value={newName} onChange={(e) => setNewName(e.target.value)} className="max-w-sm" />
          <button onClick={handleCreate} disabled={createFlow.isPending} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Criar Fluxo
          </button>
        </div>
        {newName && (
          <Textarea placeholder="Descrição do fluxo (aparece na tela de seleção)..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="max-w-sm min-h-[50px]" />
        )}
      </div>

      {(!flows || flows.length === 0) && !isLoading && (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">Nenhum fluxo criado ainda.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleCreateDefaultFlow}
              disabled={creatingDefault}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm shadow-lg"
            >
              <Wand2 className="h-4 w-4" />
              {creatingDefault ? "Criando..." : "Cuidado Espiritual Semanal"}
            </button>
            <button
              onClick={handleCreateOrientationFlow}
              disabled={creatingOrientation}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold text-sm shadow-lg"
            >
              <Wand2 className="h-4 w-4" />
              {creatingOrientation ? "Criando..." : "Quero uma Orientação"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Escolha um template para começar. Você pode personalizar depois no editor visual.
          </p>
        </div>
      )}

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

          <div className="flex gap-3 mt-2">
            <button
              onClick={handleCreateDefaultFlow}
              disabled={creatingDefault}
              className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Wand2 className="h-3 w-3" />
              {creatingDefault ? "Criando..." : "+ Cuidado Semanal"}
            </button>
            <button
              onClick={handleCreateOrientationFlow}
              disabled={creatingOrientation}
              className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Wand2 className="h-3 w-3" />
              {creatingOrientation ? "Criando..." : "+ Quero uma Orientação"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminFlows;
