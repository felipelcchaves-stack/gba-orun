import { useState } from "react";
import { ArrowLeft, ArrowRight, Wand2, Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import MultiRitualCombobox from "@/components/MultiRitualCombobox";
import OfferingCombobox from "@/components/OfferingCombobox";
import { ALL_CATEGORY_KEYS, CATEGORIES_MAP, type CategoryKey } from "@/lib/categories";
import { useCreateFlow, useSaveFlowCanvas } from "@/hooks/useOracleFlows";
import { useUpdateFlow, useSetDefaultFlow } from "@/hooks/useOracleFlows";

// ─── Types ───────────────────────────────────────────────

interface WizardQuestion {
  id: string;
  type: "yes_no" | "multiple_choice";
  question: string;
  variable_name: string;
  guidance_message: string;
  guidance_audio_url: string;
  ritual_ids: string[];
  offering_id: string | null;
  // yes_no fields
  yes_label: string;
  no_label: string;
  yes_description: string;
  no_description: string;
  no_alert_enabled: boolean;
  no_alert_title: string;
  no_alert_message: string;
  no_alert_audio_url: string;
  no_alert_confirm_label: string;
  no_alert_cancel_label: string;
  // multiple_choice fields
  options: { label: string; description: string }[];
}

interface WizardTask {
  id: string;
  task_title: string;
  task_type: string;
  category: string;
  condition: string; // "always" | "answer_equals:QID:value" | "answer_not_equals:QID:value"
  guidance_message: string;
  guidance_audio_url: string;
  ritual_ids: string[];
  offering_id: string | null;
}

interface WizardState {
  // Step 1
  name: string;
  description: string;
  welcome_message: string;
  welcome_audio_url: string;
  welcome_guidance: string;
  welcome_guidance_audio: string;
  // Step 2
  include_obi: boolean;
  obi_guidance: string;
  obi_guidance_audio: string;
  obi_variable: string;
  include_ire_ibi: boolean;
  ire_ibi_guidance: string;
  ire_ibi_guidance_audio: string;
  ire_ibi_variable: string;
  // Step 3
  questions: WizardQuestion[];
  // Step 4
  tasks: WizardTask[];
  // Step 5
  diagnosis_description: string;
  diagnosis_guidance: string;
  diagnosis_guidance_audio: string;
}

const INITIAL_STATE: WizardState = {
  name: "",
  description: "",
  welcome_message: "Que a paz do Orixá esteja com você. Vamos iniciar sua consulta espiritual.",
  welcome_audio_url: "",
  welcome_guidance: "",
  welcome_guidance_audio: "",
  include_obi: true,
  obi_guidance: "Lance os 4 búzios e observe quantos caem abertos.",
  obi_guidance_audio: "",
  obi_variable: "resultado_obi",
  include_ire_ibi: true,
  ire_ibi_guidance: "Selecione o subtipo específico do resultado.",
  ire_ibi_guidance_audio: "",
  ire_ibi_variable: "resultado_ire_ibi",
  questions: [],
  tasks: [],
  diagnosis_description: "Resumo da sua consulta espiritual",
  diagnosis_guidance: "Confira as tarefas sugeridas e vincule os rituais adequados.",
  diagnosis_guidance_audio: "",
};

let _qCounter = 0;
const nextQId = () => `q_${++_qCounter}_${Date.now()}`;
let _tCounter = 0;
const nextTId = () => `t_${++_tCounter}_${Date.now()}`;

const createQuestion = (index: number): WizardQuestion => ({
  id: nextQId(),
  type: "yes_no",
  question: "",
  variable_name: `pergunta_${index + 1}`,
  guidance_message: "",
  guidance_audio_url: "",
  ritual_ids: [],
  offering_id: null,
  yes_label: "Sim",
  no_label: "Não",
  yes_description: "",
  no_description: "",
  no_alert_enabled: false,
  no_alert_title: "",
  no_alert_message: "",
  no_alert_audio_url: "",
  no_alert_confirm_label: "Confirmar",
  no_alert_cancel_label: "Cancelar",
  options: [{ label: "Opção 1", description: "" }, { label: "Opção 2", description: "" }],
});

const DEFAULT_TASKS: Omit<WizardTask, "id">[] = [
  { task_title: "Fazer Ebó", task_type: "ebo", category: "ebo", condition: "always", guidance_message: "O Ebó é fundamental para o equilíbrio espiritual.", guidance_audio_url: "", ritual_ids: [], offering_id: null },
  { task_title: "Ibori de Proteção", task_type: "ibori", category: "ibori", condition: "always", guidance_message: "Alimente seu Orí com o Ibori.", guidance_audio_url: "", ritual_ids: [], offering_id: null },
  { task_title: "Oração da Manhã", task_type: "oracao_manha", category: "oracao_manha", condition: "always", guidance_message: "Inicie seu dia com a oração sagrada.", guidance_audio_url: "", ritual_ids: [], offering_id: null },
  { task_title: "Oração ao Orí", task_type: "oracao_ori", category: "oracao_ori", condition: "always", guidance_message: "Faça a oração ao seu Orí.", guidance_audio_url: "", ritual_ids: [], offering_id: null },
  { task_title: "Oração para Iyami", task_type: "oracao_iyami", category: "oracao_iyami", condition: "always", guidance_message: "Atenda ao chamado das Mães Ancestrais.", guidance_audio_url: "", ritual_ids: [], offering_id: null },
  { task_title: "Oferenda ao Egbe Orun", task_type: "egbe_orun", category: "egbe_orun", condition: "always", guidance_message: "Faça a oferenda para seu Egbe Orun.", guidance_audio_url: "", ritual_ids: [], offering_id: null },
];

// ─── Component ───────────────────────────────────────────

interface FlowWizardProps {
  onClose: () => void;
  onComplete: (flowId: string) => void;
}

const STEPS = [
  "Informações Básicas",
  "Estrutura do Oráculo",
  "Perguntas",
  "Tarefas do Diagnóstico",
  "Config. Diagnóstico",
  "Revisão",
];

const FlowWizard = ({ onClose, onComplete }: FlowWizardProps) => {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [creating, setCreating] = useState(false);

  const createFlow = useCreateFlow();
  const saveCanvas = useSaveFlowCanvas();
  const updateFlow = useUpdateFlow();

  const upd = (partial: Partial<WizardState>) => setState((s) => ({ ...s, ...partial }));

  // ─── Validation ──────────────────────────────────────
  const canNext = () => {
    if (step === 0) return state.name.trim().length > 0;
    if (step === 3) return state.tasks.length > 0;
    return true;
  };

  // ─── Question helpers ────────────────────────────────
  const addQuestion = () => upd({ questions: [...state.questions, createQuestion(state.questions.length)] });
  const removeQuestion = (id: string) => upd({ questions: state.questions.filter((q) => q.id !== id) });
  const updateQuestion = (id: string, patch: Partial<WizardQuestion>) =>
    upd({ questions: state.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const arr = [...state.questions];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    upd({ questions: arr });
  };

  // ─── Task helpers ────────────────────────────────────
  const addTask = () =>
    upd({
      tasks: [...state.tasks, { id: nextTId(), task_title: "", task_type: "", category: "geral", condition: "always", guidance_message: "", guidance_audio_url: "", ritual_ids: [], offering_id: null }],
    });
  const removeTask = (id: string) => upd({ tasks: state.tasks.filter((t) => t.id !== id) });
  const updateTask = (id: string, patch: Partial<WizardTask>) =>
    upd({ tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const addDefaultTasks = () =>
    upd({ tasks: [...state.tasks, ...DEFAULT_TASKS.map((t) => ({ ...t, id: nextTId() }))] });

  // ─── Condition builder ───────────────────────────────
  const buildConditionOptions = () => {
    const opts: { value: string; label: string }[] = [{ value: "always", label: "Sempre" }];
    state.questions.forEach((q) => {
      if (q.type === "yes_no") {
        opts.push({ value: `answer_equals:${q.variable_name}:sim`, label: `Quando "${q.question || q.variable_name}" = SIM` });
        opts.push({ value: `answer_not_equals:${q.variable_name}:sim`, label: `Quando "${q.question || q.variable_name}" = NÃO` });
      } else {
        q.options.forEach((o) => {
          opts.push({ value: `answer_equals:${q.variable_name}:${o.label.toLowerCase()}`, label: `Quando "${q.question || q.variable_name}" = "${o.label}"` });
        });
      }
    });
    return opts;
  };

  // ─── Generate flow ──────────────────────────────────
  const handleCreate = async () => {
    setCreating(true);
    try {
      const flow = await createFlow.mutateAsync({ name: state.name.trim(), description: state.description.trim() });

      // Build nodes
      type TempNode = { id: string; type: string; label: string; config: Record<string, any>; x: number; y: number };
      const nodes: TempNode[] = [];
      let y = 0;
      const Y_INC = 140;

      // Start
      nodes.push({ id: "n_start", type: "start", label: "Início", config: { description: "Ponto de partida" }, x: 250, y });
      y += Y_INC;

      // Welcome message
      nodes.push({
        id: "n_welcome",
        type: "message",
        label: "Acolhimento",
        config: {
          message: state.welcome_message,
          audio_url: state.welcome_audio_url || undefined,
          description: "Mensagem de boas-vindas",
          guidance_message: state.welcome_guidance || undefined,
          guidance_audio_url: state.welcome_guidance_audio || undefined,
        },
        x: 250, y,
      });
      y += Y_INC;

      // Obi
      if (state.include_obi) {
        nodes.push({
          id: "n_obi",
          type: "obi",
          label: "Lançamento do Obi",
          config: {
            description: "Qual foi o resultado do seu Obi hoje?",
            guidance_message: state.obi_guidance,
            guidance_audio_url: state.obi_guidance_audio || undefined,
            variable_name: state.obi_variable,
          },
          x: 250, y,
        });
        y += Y_INC;
      }

      // Ire/Ibi
      if (state.include_ire_ibi) {
        nodes.push({
          id: "n_ireibi",
          type: "ire_ibi",
          label: "Natureza do Resultado",
          config: {
            description: "Selecione o subtipo específico",
            guidance_message: state.ire_ibi_guidance,
            guidance_audio_url: state.ire_ibi_guidance_audio || undefined,
            variable_name: state.ire_ibi_variable,
          },
          x: 250, y,
        });
        y += Y_INC;
      }

      // Questions
      state.questions.forEach((q, i) => {
        const nodeId = `n_q_${i}`;
        if (q.type === "yes_no") {
          nodes.push({
            id: nodeId,
            type: "yes_no",
            label: q.question || `Pergunta ${i + 1}`,
            config: {
              question: q.question,
              yes_label: q.yes_label,
              no_label: q.no_label,
              yes_description: q.yes_description || undefined,
              no_description: q.no_description || undefined,
              guidance_message: q.guidance_message || undefined,
              guidance_audio_url: q.guidance_audio_url || undefined,
              variable_name: q.variable_name,
              no_alert_enabled: q.no_alert_enabled,
              ...(q.no_alert_enabled && {
                no_alert_title: q.no_alert_title,
                no_alert_message: q.no_alert_message,
                no_alert_audio_url: q.no_alert_audio_url || undefined,
                no_alert_confirm_label: q.no_alert_confirm_label,
                no_alert_cancel_label: q.no_alert_cancel_label,
              }),
            },
            x: 250, y,
          });
        } else {
          nodes.push({
            id: nodeId,
            type: "multiple_choice",
            label: q.question || `Pergunta ${i + 1}`,
            config: {
              question: q.question,
              options: q.options,
              guidance_message: q.guidance_message || undefined,
              guidance_audio_url: q.guidance_audio_url || undefined,
              variable_name: q.variable_name,
            },
            x: 250, y,
          });
        }
        y += Y_INC;
      });

      // Diagnosis
      nodes.push({
        id: "n_diagnosis",
        type: "diagnosis",
        label: "Diagnóstico Completo",
        config: {
          description: state.diagnosis_description,
          guidance_message: state.diagnosis_guidance,
          guidance_audio_url: state.diagnosis_guidance_audio || undefined,
          tasks: state.tasks.map((t) => ({
            task_title: t.task_title,
            task_type: t.task_type,
            category: t.category,
            condition: t.condition,
            guidance_message: t.guidance_message,
            guidance_audio_url: t.guidance_audio_url || undefined,
            ritual_ids: t.ritual_ids.length > 0 ? t.ritual_ids : undefined,
            offering_id: t.offering_id || undefined,
          })),
        },
        x: 250, y,
      });

      // Build node payloads
      const nodesPayload = nodes.map((n) => ({
        flow_id: flow.id,
        node_type: n.type,
        label: n.label,
        config: { ...n.config, _tempId: n.id },
        position_x: n.x,
        position_y: n.y,
      }));

      // Build edges
      type TempEdge = { source: string; target: string; handle: string };
      const edges: TempEdge[] = [];

      for (let i = 0; i < nodes.length - 1; i++) {
        const curr = nodes[i];
        const next = nodes[i + 1];

        if (curr.type === "start" || curr.type === "message" || curr.type === "media" || curr.type === "timer") {
          edges.push({ source: curr.id, target: next.id, handle: "default" });
        } else if (curr.type === "obi") {
          ["alafia", "ejife", "etagun", "okaran", "oyekun"].forEach((h) =>
            edges.push({ source: curr.id, target: next.id, handle: h })
          );
        } else if (curr.type === "ire_ibi") {
          ["ire", "ibi"].forEach((h) =>
            edges.push({ source: curr.id, target: next.id, handle: h })
          );
        } else if (curr.type === "yes_no") {
          edges.push({ source: curr.id, target: next.id, handle: "sim" });
          edges.push({ source: curr.id, target: next.id, handle: "nao" });
        } else if (curr.type === "multiple_choice") {
          edges.push({ source: curr.id, target: next.id, handle: "default" });
        }
      }

      const edgesPayload = edges.map((e) => ({
        flow_id: flow.id,
        source_node_id: e.source,
        target_node_id: e.target,
        source_handle: e.handle,
        label: "",
      }));

      await saveCanvas.mutateAsync({ flowId: flow.id, nodes: nodesPayload, edges: edgesPayload });
      await updateFlow.mutateAsync({ id: flow.id, is_active: true });

      toast.success("Fluxo criado com sucesso!");
      onComplete(flow.id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ─── Render helpers ──────────────────────────────────
  const renderFieldGroup = (label: string, children: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );

  // ─── Step renderers ──────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-4">
      {renderFieldGroup("Nome do fluxo *", <Input value={state.name} onChange={(e) => upd({ name: e.target.value })} placeholder="Ex: Cuidado Espiritual Semanal" />)}
      {renderFieldGroup("Descrição (aparece na seleção)", <Textarea value={state.description} onChange={(e) => upd({ description: e.target.value })} placeholder="Breve descrição do fluxo..." className="min-h-[60px]" />)}
      {renderFieldGroup("Mensagem de acolhimento", <Textarea value={state.welcome_message} onChange={(e) => upd({ welcome_message: e.target.value })} placeholder="Texto que o aluno verá ao iniciar..." className="min-h-[60px]" />)}
      {renderFieldGroup("Áudio da mensagem (URL)", <Input value={state.welcome_audio_url} onChange={(e) => upd({ welcome_audio_url: e.target.value })} placeholder="https://..." />)}
      <div className="border-t border-border pt-3 mt-3">
        <p className="text-xs font-semibold text-foreground mb-2">🧙 Orientação do Mestre</p>
        {renderFieldGroup("Texto de orientação", <Textarea value={state.welcome_guidance} onChange={(e) => upd({ welcome_guidance: e.target.value })} placeholder="Orientação do mestre para esta etapa..." className="min-h-[50px]" />)}
        {renderFieldGroup("Áudio de orientação (URL)", <Input value={state.welcome_guidance_audio} onChange={(e) => upd({ welcome_guidance_audio: e.target.value })} placeholder="https://..." />)}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Obi */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">🥥 Incluir Lançamento do Obi</span>
          <Switch checked={state.include_obi} onCheckedChange={(v) => upd({ include_obi: v })} />
        </div>
        {state.include_obi && (
          <div className="space-y-3 pl-1">
            {renderFieldGroup("Variável", <Input value={state.obi_variable} onChange={(e) => upd({ obi_variable: e.target.value })} />)}
            {renderFieldGroup("Orientação do mestre", <Textarea value={state.obi_guidance} onChange={(e) => upd({ obi_guidance: e.target.value })} className="min-h-[50px]" />)}
            {renderFieldGroup("Áudio de orientação (URL)", <Input value={state.obi_guidance_audio} onChange={(e) => upd({ obi_guidance_audio: e.target.value })} placeholder="https://..." />)}
          </div>
        )}
      </div>

      {/* Ire/Ibi */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">⚖️ Incluir Irê/Ibí</span>
          <Switch checked={state.include_ire_ibi} onCheckedChange={(v) => upd({ include_ire_ibi: v })} />
        </div>
        {state.include_ire_ibi && (
          <div className="space-y-3 pl-1">
            {renderFieldGroup("Variável", <Input value={state.ire_ibi_variable} onChange={(e) => upd({ ire_ibi_variable: e.target.value })} />)}
            {renderFieldGroup("Orientação do mestre", <Textarea value={state.ire_ibi_guidance} onChange={(e) => upd({ ire_ibi_guidance: e.target.value })} className="min-h-[50px]" />)}
            {renderFieldGroup("Áudio de orientação (URL)", <Input value={state.ire_ibi_guidance_audio} onChange={(e) => upd({ ire_ibi_guidance_audio: e.target.value })} placeholder="https://..." />)}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{state.questions.length} pergunta(s)</p>
        <button onClick={addQuestion} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold">
          <Plus className="h-3.5 w-3.5" /> Adicionar Pergunta
        </button>
      </div>

      {state.questions.map((q, idx) => (
        <div key={q.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} className="p-1 hover:bg-muted rounded disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => moveQuestion(idx, 1)} disabled={idx === state.questions.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
              <span className="text-xs font-bold text-muted-foreground ml-1">#{idx + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={q.type} onValueChange={(v) => updateQuestion(q.id, { type: v as any })}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Sim / Não</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
              <button onClick={() => removeQuestion(q.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {renderFieldGroup("Pergunta", <Input value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })} placeholder="Ex: Já apurou o Ebó?" />)}
          {renderFieldGroup("Variável", <Input value={q.variable_name} onChange={(e) => updateQuestion(q.id, { variable_name: e.target.value })} />)}

          {q.type === "yes_no" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {renderFieldGroup("Label Sim", <Input value={q.yes_label} onChange={(e) => updateQuestion(q.id, { yes_label: e.target.value })} />)}
                {renderFieldGroup("Label Não", <Input value={q.no_label} onChange={(e) => updateQuestion(q.id, { no_label: e.target.value })} />)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderFieldGroup("Descrição Sim", <Input value={q.yes_description} onChange={(e) => updateQuestion(q.id, { yes_description: e.target.value })} placeholder="Opcional" />)}
                {renderFieldGroup("Descrição Não", <Input value={q.no_description} onChange={(e) => updateQuestion(q.id, { no_description: e.target.value })} placeholder="Opcional" />)}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={q.no_alert_enabled} onCheckedChange={(v) => updateQuestion(q.id, { no_alert_enabled: v })} />
                <span className="text-xs text-muted-foreground">Alerta ao negar</span>
              </div>
              {q.no_alert_enabled && (
                <div className="space-y-2 pl-2 border-l-2 border-destructive/20">
                  {renderFieldGroup("Título do alerta", <Input value={q.no_alert_title} onChange={(e) => updateQuestion(q.id, { no_alert_title: e.target.value })} />)}
                  {renderFieldGroup("Mensagem do alerta", <Textarea value={q.no_alert_message} onChange={(e) => updateQuestion(q.id, { no_alert_message: e.target.value })} className="min-h-[40px]" />)}
                  {renderFieldGroup("Áudio do alerta (URL)", <Input value={q.no_alert_audio_url} onChange={(e) => updateQuestion(q.id, { no_alert_audio_url: e.target.value })} />)}
                  <div className="grid grid-cols-2 gap-2">
                    {renderFieldGroup("Botão confirmar", <Input value={q.no_alert_confirm_label} onChange={(e) => updateQuestion(q.id, { no_alert_confirm_label: e.target.value })} />)}
                    {renderFieldGroup("Botão cancelar", <Input value={q.no_alert_cancel_label} onChange={(e) => updateQuestion(q.id, { no_alert_cancel_label: e.target.value })} />)}
                  </div>
                </div>
              )}
            </>
          )}

          {q.type === "multiple_choice" && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Opções</Label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input value={opt.label} onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oi] = { ...newOpts[oi], label: e.target.value };
                      updateQuestion(q.id, { options: newOpts });
                    }} placeholder="Label" />
                    <Input value={opt.description} onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oi] = { ...newOpts[oi], description: e.target.value };
                      updateQuestion(q.id, { options: newOpts });
                    }} placeholder="Descrição (opcional)" className="text-xs" />
                  </div>
                  {q.options.length > 2 && (
                    <button onClick={() => updateQuestion(q.id, { options: q.options.filter((_, j) => j !== oi) })} className="p-1.5 text-destructive hover:bg-destructive/10 rounded mt-1"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
              ))}
              <button onClick={() => updateQuestion(q.id, { options: [...q.options, { label: "", description: "" }] })} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Adicionar opção</button>
            </div>
          )}

          <div className="border-t border-border pt-2 space-y-2">
            <p className="text-xs font-semibold text-foreground">🧙 Orientação do Mestre</p>
            {renderFieldGroup("Texto", <Textarea value={q.guidance_message} onChange={(e) => updateQuestion(q.id, { guidance_message: e.target.value })} className="min-h-[40px]" placeholder="Orientação para esta pergunta..." />)}
            {renderFieldGroup("Áudio (URL)", <Input value={q.guidance_audio_url} onChange={(e) => updateQuestion(q.id, { guidance_audio_url: e.target.value })} placeholder="https://..." />)}
          </div>

          <div className="border-t border-border pt-2 space-y-2">
            <p className="text-xs font-semibold text-foreground">📎 Vínculos</p>
            {renderFieldGroup("Rituais", <MultiRitualCombobox value={q.ritual_ids} onChange={(v) => updateQuestion(q.id, { ritual_ids: v })} />)}
            {renderFieldGroup("Oferenda", <OfferingCombobox value={q.offering_id} onChange={(v) => updateQuestion(q.id, { offering_id: v })} />)}
          </div>
        </div>
      ))}

      {state.questions.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6">Nenhuma pergunta adicionada. Clique em "Adicionar Pergunta" para começar.</p>
      )}
    </div>
  );

  const renderStep3 = () => {
    const conditionOpts = buildConditionOptions();
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">{state.tasks.length} tarefa(s)</p>
          <div className="flex gap-2">
            <button onClick={addDefaultTasks} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted/50">
              <Wand2 className="h-3.5 w-3.5" /> Tarefas padrão
            </button>
            <button onClick={addTask} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" /> Adicionar Tarefa
            </button>
          </div>
        </div>

        {state.tasks.map((t, idx) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Tarefa #{idx + 1}</span>
              <button onClick={() => removeTask(t.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>

            {renderFieldGroup("Título *", <Input value={t.task_title} onChange={(e) => updateTask(t.id, { task_title: e.target.value })} placeholder="Ex: Fazer Ebó" />)}

            <div className="grid grid-cols-2 gap-2">
              {renderFieldGroup("Tipo", <Input value={t.task_type} onChange={(e) => updateTask(t.id, { task_type: e.target.value })} placeholder="Ex: ebo" />)}
              {renderFieldGroup("Categoria", (
                <Select value={t.category} onValueChange={(v) => updateTask(t.id, { category: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_CATEGORY_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>{CATEGORIES_MAP[k].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>

            {renderFieldGroup("Condição", (
              <Select value={t.condition} onValueChange={(v) => updateTask(t.id, { condition: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {conditionOpts.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="truncate block max-w-[280px]">{o.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            <div className="border-t border-border pt-2 space-y-2">
              <p className="text-xs font-semibold text-foreground">🧙 Orientação do Mestre</p>
              {renderFieldGroup("Texto", <Textarea value={t.guidance_message} onChange={(e) => updateTask(t.id, { guidance_message: e.target.value })} className="min-h-[40px]" />)}
              {renderFieldGroup("Áudio (URL)", <Input value={t.guidance_audio_url} onChange={(e) => updateTask(t.id, { guidance_audio_url: e.target.value })} placeholder="https://..." />)}
            </div>

            <div className="border-t border-border pt-2 space-y-2">
              <p className="text-xs font-semibold text-foreground">📎 Vínculos</p>
              {renderFieldGroup("Rituais", <MultiRitualCombobox value={t.ritual_ids} onChange={(v) => updateTask(t.id, { ritual_ids: v })} />)}
              {renderFieldGroup("Oferenda", <OfferingCombobox value={t.offering_id} onChange={(v) => updateTask(t.id, { offering_id: v })} />)}
            </div>
          </div>
        ))}

        {state.tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Adicione pelo menos 1 tarefa. Use "Tarefas padrão" para começar rapidamente.</p>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Configurações gerais do nó de diagnóstico que aparece ao final do fluxo.</p>
      {renderFieldGroup("Descrição do diagnóstico", <Textarea value={state.diagnosis_description} onChange={(e) => upd({ diagnosis_description: e.target.value })} placeholder="Texto que aparece no topo do resumo..." className="min-h-[60px]" />)}
      <div className="border-t border-border pt-3">
        <p className="text-xs font-semibold text-foreground mb-2">🧙 Orientação do Mestre</p>
        {renderFieldGroup("Texto de orientação", <Textarea value={state.diagnosis_guidance} onChange={(e) => upd({ diagnosis_guidance: e.target.value })} className="min-h-[50px]" />)}
        {renderFieldGroup("Áudio de orientação (URL)", <Input value={state.diagnosis_guidance_audio} onChange={(e) => upd({ diagnosis_guidance_audio: e.target.value })} placeholder="https://..." />)}
      </div>
    </div>
  );

  const renderStep5 = () => {
    const nodeCount = 2 + (state.include_obi ? 1 : 0) + (state.include_ire_ibi ? 1 : 0) + state.questions.length + 1;
    const sequence = ["Início", "Acolhimento"];
    if (state.include_obi) sequence.push("Obi");
    if (state.include_ire_ibi) sequence.push("Irê/Ibí");
    state.questions.forEach((q, i) => sequence.push(q.question || `Pergunta ${i + 1}`));
    sequence.push("Diagnóstico");

    return (
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-sm mb-1">{state.name || "Sem nome"}</h3>
          <p className="text-xs text-muted-foreground">{state.description || "Sem descrição"}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-semibold mb-2">Sequência ({nodeCount} blocos)</p>
          <div className="flex flex-wrap gap-1.5">
            {sequence.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {i > 0 && <span className="text-muted-foreground">→</span>}
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-semibold mb-2">Tarefas ({state.tasks.length})</p>
          {state.tasks.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2 py-1 text-xs">
              <span className="font-medium">{t.task_title || "Sem título"}</span>
              <span className="text-muted-foreground">— {t.condition === "always" ? "Sempre" : t.condition}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-display font-bold">Wizard de Fluxo</h1>
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <span key={i} className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {i + 1}. {s}
            </span>
          ))}
          <span className="sm:hidden text-xs text-muted-foreground">{step + 1}/{STEPS.length}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-display font-bold mb-1">{STEPS[step]}</h2>
          <p className="text-sm text-muted-foreground mb-5">Passo {step + 1} de {STEPS.length}</p>
          {stepRenderers[step]()}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => (step === 0 ? onClose() : setStep(step - 1))} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Cancelar" : "Anterior"}
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            Próximo <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleCreate} disabled={creating || !canNext()} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
            <Wand2 className="h-4 w-4" /> {creating ? "Criando..." : "Criar Fluxo"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FlowWizard;
