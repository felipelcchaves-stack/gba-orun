import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronRight, Variable } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import MultiRitualCombobox from "@/components/MultiRitualCombobox";
import OfferingCombobox from "@/components/OfferingCombobox";

interface DiagnosisTask {
  task_title: string;
  task_type: string;
  category: string;
  ritual_id?: string | null;
  ritual_ids?: string[];
  offering_id?: string | null;
  guidance_message?: string;
  guidance_audio_url?: string | null;
  condition: string;
}

interface AvailableVariable {
  name: string;
  nodeType: string;
}

const NODE_TYPE_LABELS: Record<string, string> = {
  obi: "Obi",
  ire_ibi: "Irê/Ibi",
  yes_no: "Sim/Não",
  multiple_choice: "Escolha",
  open_question: "Pergunta",
  message: "Mensagem",
  diagnosis: "Diagnóstico",
  media: "Mídia",
  timer: "Timer",
  conditional: "Condicional",
};

const VariableInsertButton = ({ variables, onInsert }: { variables: AvailableVariable[]; onInsert: (varName: string) => void }) => {
  if (variables.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5">
          <Variable className="h-3 w-3" /> Inserir variável
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <div className="text-[10px] text-muted-foreground px-2 py-1 font-semibold">Clique para inserir</div>
        {variables.map((v) => (
          <button
            key={v.name}
            type="button"
            onClick={() => onInsert(v.name)}
            className="w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded flex items-center justify-between"
          >
            <span className="font-mono text-primary">{`{{${v.name}}}`}</span>
            <span className="text-[10px] text-muted-foreground">{NODE_TYPE_LABELS[v.nodeType] || v.nodeType}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

interface NodeConfigPanelProps {
  nodeId: string;
  nodeType: string;
  config: Record<string, any>;
  label: string;
  onUpdate: (nodeId: string, updates: { label?: string; config?: Record<string, any> }) => void;
  onClose: () => void;
  onDelete?: (nodeId: string) => void;
  availableVariables?: AvailableVariable[];
}

const SectionHeader = ({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className="w-full flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider py-1">
    {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
    {title}
  </button>
);

const NodeConfigPanel = ({ nodeId, nodeType, config, label, onUpdate, onClose, onDelete, availableVariables = [] }: NodeConfigPanelProps) => {
  const [localLabel, setLocalLabel] = useState(label);
  const [localConfig, setLocalConfig] = useState<Record<string, any>>(config || {});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ basic: true, guidance: false, links: false, specific: true, tasks: false });

  useEffect(() => {
    setLocalLabel(label);
    setLocalConfig(config || {});
  }, [nodeId, label, config]);

  const save = () => {
    onUpdate(nodeId, { label: localLabel, config: localConfig });
  };

  const updateField = (key: string, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Diagnosis tasks helpers
  const tasks: DiagnosisTask[] = localConfig.tasks || [];
  const addTask = () => {
    updateField("tasks", [...tasks, { task_title: "", task_type: "ebo", category: "ebo", condition: "always" }]);
  };
  const updateTask = (i: number, field: string, value: any) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], [field]: value };
    updateField("tasks", updated);
  };
  const removeTask = (i: number) => {
    updateField("tasks", tasks.filter((_, idx) => idx !== i));
  };
  const updateTaskFields = (i: number, fields: Record<string, any>) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], ...fields };
    updateField("tasks", updated);
  };

  // Multiple choice option helpers (now with description + links)
  const options: Array<{ label: string; description?: string; ritual_id?: string | null; offering_id?: string | null }> = 
    (localConfig.options || []).map((o: any) => typeof o === "string" ? { label: o } : o);

  const updateOption = (i: number, field: string, value: any) => {
    const updated = [...options];
    updated[i] = { ...updated[i], [field]: value };
    updateField("options", updated);
  };
  const addOption = () => {
    updateField("options", [...options, { label: `Opção ${options.length + 1}` }]);
  };
  const removeOption = (i: number) => {
    updateField("options", options.filter((_, idx) => idx !== i));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 w-full sm:w-80 sm:max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Configurar Bloco</h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
      </div>

      {/* Basic Info */}
      <div>
        <SectionHeader title="Informações Básicas" open={openSections.basic} onToggle={() => toggleSection("basic")} />
        {openSections.basic && (
          <div className="space-y-2 mt-1">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título</label>
              <Input value={localLabel} onChange={(e) => setLocalLabel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <Textarea value={localConfig.description || ""} onChange={(e) => updateField("description", e.target.value)} className="mt-1 min-h-[50px]" placeholder="Texto explicativo..." />
              <VariableInsertButton variables={availableVariables} onInsert={(v) => updateField("description", (localConfig.description || "") + `{{${v}}}`)} />
            </div>
            {nodeType !== "start" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">🏷️ Apelido desta resposta</label>
                <Input value={localConfig.variable_name || ""} onChange={(e) => updateField("variable_name", e.target.value)} className="mt-1" placeholder="Ex: resultado_obi" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Esse apelido permite usar a resposta em outros blocos. Ex: {"{{resultado_obi}}"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guidance */}
      <div>
        <SectionHeader title="Orientação do Mestre" open={openSections.guidance} onToggle={() => toggleSection("guidance")} />
        {openSections.guidance && (
          <div className="space-y-2 mt-1">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mensagem</label>
              <Textarea value={localConfig.guidance_message || ""} onChange={(e) => updateField("guidance_message", e.target.value)} className="mt-1 min-h-[60px]" placeholder="Orientação para o aluno..." />
              <VariableInsertButton variables={availableVariables} onInsert={(v) => updateField("guidance_message", (localConfig.guidance_message || "") + `{{${v}}}`)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL do Áudio</label>
              <Input value={localConfig.guidance_audio_url || ""} onChange={(e) => updateField("guidance_audio_url", e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
          </div>
        )}
      </div>

      {/* Links (Ritual + Offering) */}
      {nodeType !== "diagnosis" && (
        <div>
          <SectionHeader title="Vínculos" open={openSections.links} onToggle={() => toggleSection("links")} />
          {openSections.links && (
            <div className="space-y-2 mt-1">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Rituais / Orações</label>
                <div className="mt-1">
                  <MultiRitualCombobox
                    value={localConfig.ritual_ids || (localConfig.ritual_id ? [localConfig.ritual_id] : [])}
                    onChange={(ids) => { updateField("ritual_ids", ids); updateField("ritual_id", null); }}
                    placeholder="Adicionar ritual..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Oferenda</label>
                <div className="mt-1">
                  <OfferingCombobox value={localConfig.offering_id || null} onChange={(id) => updateField("offering_id", id)} placeholder="Vincular oferenda..." />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Type-specific fields */}
      <div>
        <SectionHeader title="Configuração Específica" open={openSections.specific} onToggle={() => toggleSection("specific")} />
        {openSections.specific && (
          <div className="space-y-2 mt-1">
            {nodeType === "message" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Mensagem</label>
                   <Textarea value={localConfig.message || ""} onChange={(e) => updateField("message", e.target.value)} className="mt-1 min-h-[80px]" />
                   <VariableInsertButton variables={availableVariables} onInsert={(v) => updateField("message", (localConfig.message || "") + `{{${v}}}`)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">URL do Áudio da Mensagem</label>
                  <Input value={localConfig.audio_url || ""} onChange={(e) => updateField("audio_url", e.target.value)} className="mt-1" />
                </div>
              </>
            )}

            {nodeType === "yes_no" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
                  <Textarea value={localConfig.question || ""} onChange={(e) => updateField("question", e.target.value)} className="mt-1 min-h-[50px]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Texto "Sim"</label>
                    <Input value={localConfig.yes_label || "Sim"} onChange={(e) => updateField("yes_label", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Texto "Não"</label>
                    <Input value={localConfig.no_label || "Não"} onChange={(e) => updateField("no_label", e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Desc. "Sim"</label>
                    <Input value={localConfig.yes_description || ""} onChange={(e) => updateField("yes_description", e.target.value)} className="mt-1" placeholder="(opcional)" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Desc. "Não"</label>
                    <Input value={localConfig.no_description || ""} onChange={(e) => updateField("no_description", e.target.value)} className="mt-1" placeholder="(opcional)" />
                  </div>
                </div>

                {/* Alert on "No" */}
                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!localConfig.no_alert_enabled}
                      onChange={(e) => updateField("no_alert_enabled", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-xs font-semibold text-foreground">⚠️ Ativar alerta ao negar</span>
                  </label>
                  {localConfig.no_alert_enabled && (
                    <div className="space-y-2 pl-1">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Título do alerta</label>
                        <Input value={localConfig.no_alert_title || ""} onChange={(e) => updateField("no_alert_title", e.target.value)} className="mt-1" placeholder="Tem certeza?" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Mensagem do alerta</label>
                        <Textarea value={localConfig.no_alert_message || ""} onChange={(e) => updateField("no_alert_message", e.target.value)} className="mt-1 min-h-[60px]" placeholder="Sem apurar o Ebo, o problema pode persistir..." />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Áudio do alerta (URL)</label>
                        <Input value={localConfig.no_alert_audio_url || ""} onChange={(e) => updateField("no_alert_audio_url", e.target.value)} className="mt-1" placeholder="https://..." />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Botão confirmar</label>
                          <Input value={localConfig.no_alert_confirm_label || ""} onChange={(e) => updateField("no_alert_confirm_label", e.target.value)} className="mt-1" placeholder="Tenho certeza" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Botão voltar</label>
                          <Input value={localConfig.no_alert_cancel_label || ""} onChange={(e) => updateField("no_alert_cancel_label", e.target.value)} className="mt-1" placeholder="Vou reconsiderar" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {nodeType === "open_question" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
                <Textarea value={localConfig.question || ""} onChange={(e) => updateField("question", e.target.value)} className="mt-1 min-h-[50px]" />
              </div>
            )}

            {nodeType === "multiple_choice" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
                  <Textarea value={localConfig.question || ""} onChange={(e) => updateField("question", e.target.value)} className="mt-1 min-h-[50px]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Opções</label>
                  <div className="space-y-2 mt-1">
                    {options.map((opt, i) => (
                      <div key={i} className="border border-border rounded-lg p-2 space-y-1">
                        <div className="flex gap-1">
                          <Input value={opt.label} onChange={(e) => updateOption(i, "label", e.target.value)} placeholder="Texto da opção" className="flex-1" />
                          <button onClick={() => removeOption(i)} className="p-2 hover:bg-destructive/10 rounded text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <Input value={opt.description || ""} onChange={(e) => updateOption(i, "description", e.target.value)} placeholder="Descrição (opcional)" className="text-xs" />
                      </div>
                    ))}
                    <button onClick={addOption} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="h-3 w-3" /> Adicionar opção
                    </button>
                  </div>
                </div>
              </>
            )}

            {nodeType === "obi" && (
              <p className="text-xs text-muted-foreground">Os resultados do Obi são carregados automaticamente do banco de dados (oracle_configs).</p>
            )}

            {nodeType === "ire_ibi" && (
              <p className="text-xs text-muted-foreground">Os tipos de Irê/Ibi são carregados automaticamente do banco de dados (ire_ibi_types).</p>
            )}

            {nodeType === "start" && (
              <p className="text-xs text-muted-foreground">Bloco inicial do fluxo. O título aparece como botão "Começar".</p>
            )}

            {nodeType === "media" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">URL da Mídia</label>
                  <Input value={localConfig.media_url || ""} onChange={(e) => updateField("media_url", e.target.value)} className="mt-1" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <select value={localConfig.media_type || "image"} onChange={(e) => updateField("media_type", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="image">Imagem</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Legenda</label>
                  <Input value={localConfig.caption || ""} onChange={(e) => updateField("caption", e.target.value)} className="mt-1" placeholder="Legenda opcional..." />
                </div>
              </>
            )}

            {nodeType === "timer" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Duração (segundos)</label>
                  <Input type="number" min={1} value={localConfig.duration_seconds || 10} onChange={(e) => updateField("duration_seconds", parseInt(e.target.value) || 10)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Mensagem durante espera</label>
                  <Textarea value={localConfig.message || ""} onChange={(e) => updateField("message", e.target.value)} className="mt-1 min-h-[50px]" placeholder="Respire fundo..." />
                  <VariableInsertButton variables={availableVariables} onInsert={(v) => updateField("message", (localConfig.message || "") + `{{${v}}}`)} />
                </div>
              </>
            )}

            {nodeType === "conditional" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Variável a avaliar</label>
                  {availableVariables.length > 0 ? (
                    <select value={localConfig.variable_name_to_evaluate || ""} onChange={(e) => updateField("variable_name_to_evaluate", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Selecione...</option>
                      {availableVariables.map((v) => (
                        <option key={v.name} value={v.name}>{v.name} ({NODE_TYPE_LABELS[v.nodeType] || v.nodeType})</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Nenhuma variável disponível. Adicione blocos com apelido antes.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Condições</label>
                  <div className="space-y-2 mt-1">
                    {(localConfig.conditions || []).map((c: any, i: number) => (
                      <div key={i} className="flex gap-1 items-center">
                        <Input value={c.value} onChange={(e) => {
                          const updated = [...(localConfig.conditions || [])];
                          updated[i] = { ...updated[i], value: e.target.value };
                          updateField("conditions", updated);
                        }} placeholder="Valor (ex: alafia)" className="flex-1 text-xs" />
                        <Input value={c.handle_id} onChange={(e) => {
                          const updated = [...(localConfig.conditions || [])];
                          updated[i] = { ...updated[i], handle_id: e.target.value };
                          updateField("conditions", updated);
                        }} placeholder="Handle ID" className="flex-1 text-xs" />
                        <button onClick={() => {
                          const updated = (localConfig.conditions || []).filter((_: any, idx: number) => idx !== i);
                          updateField("conditions", updated);
                        }} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const conditions = [...(localConfig.conditions || []), { value: "", handle_id: `cond_${(localConfig.conditions || []).length}` }];
                      updateField("conditions", conditions);
                    }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="h-3 w-3" /> Adicionar condição
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Diagnosis tasks */}
      {nodeType === "diagnosis" && (
        <div>
          <SectionHeader title="Tarefas do Diagnóstico" open={openSections.tasks} onToggle={() => toggleSection("tasks")} />
          {openSections.tasks && (
            <div className="space-y-3 mt-1">
              {tasks.map((task, i) => (
                <div key={i} className="border border-border rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Input value={task.task_title} onChange={(e) => updateTask(i, "task_title", e.target.value)} placeholder="Título da tarefa" className="flex-1 text-xs" />
                    <button onClick={() => removeTask(i)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Input value={task.task_type} onChange={(e) => updateTask(i, "task_type", e.target.value)} placeholder="Tipo" className="text-xs" />
                    <Input value={task.category} onChange={(e) => updateTask(i, "category", e.target.value)} placeholder="Categoria" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Condição</label>
                    <Input value={task.condition} onChange={(e) => updateTask(i, "condition", e.target.value)} placeholder="always | answer_equals:NODE_ID:valor" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Orientação</label>
                    <Textarea value={task.guidance_message || ""} onChange={(e) => updateTask(i, "guidance_message", e.target.value)} className="min-h-[30px] text-xs" placeholder="Orientação..." />
                  </div>
                  <Input value={task.guidance_audio_url || ""} onChange={(e) => updateTask(i, "guidance_audio_url", e.target.value)} placeholder="URL áudio da tarefa" className="text-xs" />
                  <div className="space-y-1">
                    <MultiRitualCombobox
                      value={task.ritual_ids || (task.ritual_id ? [task.ritual_id] : [])}
                      onChange={(ids) => updateTaskFields(i, { ritual_ids: ids, ritual_id: null })}
                      placeholder="Adicionar ritual..."
                    />
                    <OfferingCombobox value={task.offering_id || null} onChange={(id) => updateTask(i, "offering_id", id)} placeholder="Oferenda..." />
                  </div>
                </div>
              ))}
              <button onClick={addTask} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Adicionar tarefa
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={save} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
          Salvar
        </button>
        {onDelete && nodeType !== "start" && (
          <button onClick={() => onDelete(nodeId)} className="py-2 px-3 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/20">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NodeConfigPanel;
