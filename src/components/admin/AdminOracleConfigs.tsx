import { useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import {
  useOracleConfigs,
  useUpdateOracleConfig,
  useCreateOracleConfig,
  useDeleteOracleConfig,
  OracleConfig,
} from "@/hooks/useOracleConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const EMPTY: Omit<OracleConfig, "id"> = {
  result_key: "",
  name: "",
  meaning: "",
  description_ire: "",
  description_ibi: "",
  color_type: "accent",
  default_ire_ibi: "ibi",
  guidance_message: "",
  guidance_audio_url: null,
  display_order: 0,
};

const COLOR_OPTIONS = [
  { value: "success", label: "Verde (Sucesso)" },
  { value: "warning", label: "Amarelo (Aviso)" },
  { value: "danger", label: "Vermelho (Perigo)" },
  { value: "accent", label: "Destaque (Accent)" },
];

const AdminOracleConfigs = () => {
  const { data: configs, isLoading } = useOracleConfigs();
  const updateConfig = useUpdateOracleConfig();
  const createConfig = useCreateOracleConfig();
  const deleteConfig = useDeleteOracleConfig();

  const [editing, setEditing] = useState<OracleConfig | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<OracleConfig, "id">>(EMPTY);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setCreating(true);
  };

  const openEdit = (c: OracleConfig) => {
    setCreating(false);
    setEditing(c);
    const { id, ...rest } = c;
    setForm(rest);
  };

  const close = () => { setEditing(null); setCreating(false); };

  const handleSave = async () => {
    if (!form.name || !form.result_key) {
      toast.error("Nome e Result Key são obrigatórios");
      return;
    }
    try {
      if (editing) {
        await updateConfig.mutateAsync({ id: editing.id, ...form });
        toast.success("Caída atualizada!");
      } else {
        await createConfig.mutateAsync(form);
        toast.success("Caída criada!");
      }
      close();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta caída?")) return;
    try {
      await deleteConfig.mutateAsync(id);
      toast.success("Caída excluída!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const colorBadge = (type: string) => {
    const map: Record<string, string> = {
      success: "bg-green-600/20 text-green-300",
      warning: "bg-yellow-600/20 text-yellow-300",
      danger: "bg-red-600/20 text-red-300",
      accent: "bg-accent/20 text-accent-foreground",
    };
    return map[type] || map.accent;
  };

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Caídas do Obi</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as configurações de cada caída do oráculo</p>
        </div>
        <button onClick={openCreate} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Nova Caída
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">{editing ? "Editar Caída" : "Nova Caída"}</h2>
            <button onClick={close} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Alafia" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Result Key *</label>
              <Input value={form.result_key} onChange={e => setForm(f => ({ ...f, result_key: e.target.value }))} placeholder="Ex: alafia" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ordem</label>
              <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Significado</label>
              <Input value={form.meaning} onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))} placeholder="Ex: Todos abertos — PAZ" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cor</label>
              <Select value={form.color_type} onValueChange={v => setForm(f => ({ ...f, color_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Padrão Iré/Ibi</label>
              <Select value={form.default_ire_ibi} onValueChange={v => setForm(f => ({ ...f, default_ire_ibi: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ire">Iré (Positivo)</SelectItem>
                  <SelectItem value="ibi">Ibi (Negativo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Áudio URL (opcional)</label>
              <Input value={form.guidance_audio_url || ""} onChange={e => setForm(f => ({ ...f, guidance_audio_url: e.target.value || null }))} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição Iré</label>
              <Textarea value={form.description_ire} onChange={e => setForm(f => ({ ...f, description_ire: e.target.value }))} rows={2} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição Ibi</label>
              <Textarea value={form.description_ibi} onChange={e => setForm(f => ({ ...f, description_ibi: e.target.value }))} rows={2} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mensagem de Orientação</label>
              <Textarea value={form.guidance_message} onChange={e => setForm(f => ({ ...f, guidance_message: e.target.value }))} rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={close} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center gap-2">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : configs && configs.length > 0 ? (
        <div className="space-y-3">
          {configs.map(c => (
            <div key={c.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground font-mono w-6 text-center">{c.display_order}</span>
                <div>
                  <h3 className="font-display font-bold flex items-center gap-2">
                    {c.name}
                    <Badge variant="outline" className={`text-[10px] ${colorBadge(c.color_type)}`}>{c.color_type}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">({c.result_key})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.meaning}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Nenhuma caída cadastrada.</p>
      )}
    </div>
  );
};

export default AdminOracleConfigs;
