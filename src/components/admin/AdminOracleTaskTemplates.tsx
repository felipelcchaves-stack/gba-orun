import { useState } from "react";
import {
  useOracleTaskTemplates,
  useOracleConfigs,
  useUpsertOracleTaskTemplate,
  useDeleteOracleTaskTemplate,
  type OracleTaskTemplate,
} from "@/hooks/useOracleConfig";
import { useRituals } from "@/hooks/useRituals";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import TaskGuidanceBubble from "@/components/TaskGuidanceBubble";
import { toast } from "sonner";

const CONDITIONS = [
  { value: "always", label: "Sempre" },
  { value: "ebo_not_done", label: "Ebó não apurado" },
  { value: "ebo_done", label: "Ebó apurado" },
  { value: "ori_needs_ibori", label: "Ori precisa de Ibori" },
  { value: "ori_needs_oracao", label: "Ori precisa de Oração" },
  { value: "ori_needs_ambos", label: "Ori precisa de Ambos" },
  { value: "iyami_wants", label: "Iyami querem algo" },
  { value: "egbe_wants", label: "Egbe Orun quer algo" },
];

const INTENTIONS = [
  { value: "", label: "Todas" },
  { value: "cuidado_semanal", label: "Cuidado Semanal" },
  { value: "orientacao", label: "Orientação" },
];

const EMPTY: Partial<OracleTaskTemplate> = {
  oracle_result_key: null,
  ire_or_ibi: null,
  condition: "always",
  task_title: "",
  task_type: "",
  category: "",
  ritual_id: null,
  display_order: 0,
  intention: null,
  guidance_message: "",
  guidance_audio_url: null,
};

const AdminOracleTaskTemplates = () => {
  const { data: templates, isLoading } = useOracleTaskTemplates();
  const { data: configs } = useOracleConfigs();
  const { data: rituals } = useRituals();
  const upsert = useUpsertOracleTaskTemplate();
  const remove = useDeleteOracleTaskTemplate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OracleTaskTemplate>>(EMPTY);
  const [isNew, setIsNew] = useState(false);

  const startNew = () => {
    setForm({ ...EMPTY });
    setIsNew(true);
    setEditingId("new");
  };

  const startEdit = (t: OracleTaskTemplate) => {
    setForm({ ...t });
    setIsNew(false);
    setEditingId(t.id);
  };

  const cancel = () => {
    setEditingId(null);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!form.task_title || !form.task_type || !form.category) {
      toast.error("Preencha título, tipo e categoria.");
      return;
    }
    try {
      const payload = {
        ...form,
        oracle_result_key: form.oracle_result_key || null,
        ire_or_ibi: form.ire_or_ibi || null,
        ritual_id: form.ritual_id || null,
      };
      if (!isNew && editingId) payload.id = editingId;
      await upsert.mutateAsync(payload as any);
      toast.success(isNew ? "Regra criada!" : "Regra atualizada!");
      cancel();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta regra?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Regra excluída!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const renderForm = () => (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-3 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Resultado (vazio = todos)</label>
          <select value={form.oracle_result_key || ""} onChange={e => setForm(f => ({ ...f, oracle_result_key: e.target.value || null }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Todos</option>
            {configs?.map(c => <option key={c.result_key} value={c.result_key}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Irê/Ibi (vazio = ambos)</label>
          <select value={form.ire_or_ibi || ""} onChange={e => setForm(f => ({ ...f, ire_or_ibi: e.target.value || null }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Ambos</option>
            <option value="ire">Irê</option>
            <option value="ibi">Ibi</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Condição</label>
          <select value={form.condition || "always"} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Intenção</label>
          <select value={form.intention || ""} onChange={e => setForm(f => ({ ...f, intention: e.target.value || null }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {INTENTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Título da Tarefa</label>
          <Input value={form.task_title || ""} onChange={e => setForm(f => ({ ...f, task_title: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tipo</label>
          <Input value={form.task_type || ""} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))} placeholder="ebo, ibori, cantiga..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Categoria</label>
          <Input value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="ebo, ibori..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ritual Linkado (opcional)</label>
          <select value={form.ritual_id || ""} onChange={e => setForm(f => ({ ...f, ritual_id: e.target.value || null }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Nenhum</option>
            {rituals?.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ordem</label>
        <Input type="number" value={form.display_order || 0} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="w-24" />
      </div>
      {/* Guidance fields */}
      <div className="border-t border-border pt-3 mt-1">
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">🧙 Orientação do Mestre (opcional)</label>
        <Textarea
          value={form.guidance_message || ""}
          onChange={e => setForm(f => ({ ...f, guidance_message: e.target.value }))}
          placeholder="Ex: Separe 1 ovo, mel e azeite de dendê..."
          rows={3}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">🎧 URL do Áudio (opcional)</label>
        <Input value={form.guidance_audio_url || ""} onChange={e => setForm(f => ({ ...f, guidance_audio_url: e.target.value || null }))} placeholder="https://..." />
      </div>
      {form.guidance_message && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Preview</label>
          <TaskGuidanceBubble message={form.guidance_message} audioUrl={form.guidance_audio_url} />
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button onClick={cancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted flex items-center gap-1"><X className="h-4 w-4" /> Cancelar</button>
        <button onClick={handleSave} disabled={upsert.isPending} className="px-4 py-2 text-sm rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center gap-2">
          {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Configure quais tarefas aparecem para cada combinação de resultado.</p>
        <button onClick={startNew} className="px-4 py-2 text-sm rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Nova Regra
        </button>
      </div>

      {editingId === "new" && renderForm()}

      <div className="space-y-2">
        {templates?.map(t => (
          editingId === t.id ? (
            <div key={t.id}>{renderForm()}</div>
          ) : (
            <div key={t.id} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="font-display font-bold text-sm">{t.task_title}</h4>
                <p className="text-xs text-muted-foreground">
                  {t.oracle_result_key ? configs?.find(c => c.result_key === t.oracle_result_key)?.name || t.oracle_result_key : "Todos"}
                  {" · "}{t.ire_or_ibi === "ire" ? "Irê" : t.ire_or_ibi === "ibi" ? "Ibi" : "Ambos"}
                  {" · "}{CONDITIONS.find(c => c.value === t.condition)?.label || t.condition}
                  {(t as any).intention && ` · 🎯 ${INTENTIONS.find(i => i.value === (t as any).intention)?.label || (t as any).intention}`}
                  {t.ritual_id && " · 🔗 Ritual linkado"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(t)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default AdminOracleTaskTemplates;
