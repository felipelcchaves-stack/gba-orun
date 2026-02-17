import { useState } from "react";
import { useOracleConfigs, useUpdateOracleConfig, type OracleConfig } from "@/hooks/useOracleConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const COLOR_OPTIONS = [
  { value: "danger", label: "Vermelho (Perigo)" },
  { value: "warning", label: "Amarelo (Aviso)" },
  { value: "success", label: "Verde (Sucesso)" },
  { value: "accent", label: "Destaque (Accent)" },
];

const AdminOracleConfigs = () => {
  const { data: configs, isLoading } = useOracleConfigs();
  const updateConfig = useUpdateOracleConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OracleConfig>>({});

  const startEdit = (c: OracleConfig) => {
    setEditingId(c.id);
    setForm({ name: c.name, meaning: c.meaning, description_ire: c.description_ire, description_ibi: c.description_ibi, color_type: c.color_type, default_ire_ibi: c.default_ire_ibi || "ibi", guidance_message: c.guidance_message || "", guidance_audio_url: c.guidance_audio_url || "" });
  };

  const handleSave = async (id: string) => {
    try {
      await updateConfig.mutateAsync({ id, ...form });
      toast.success("Resultado atualizado!");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Edite os 5 resultados do Obi. Mude nomes, significados e descrições livremente.</p>
      {configs?.map(c => (
        <div key={c.id} className="bg-card rounded-2xl border border-border p-5">
          {editingId === c.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome</label>
                  <Input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Significado</label>
                  <Input value={form.meaning || ""} onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descrição em Irê</label>
                <Textarea value={form.description_ire || ""} onChange={e => setForm(f => ({ ...f, description_ire: e.target.value }))} rows={2} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descrição em Ibi</label>
                <Textarea value={form.description_ibi || ""} onChange={e => setForm(f => ({ ...f, description_ibi: e.target.value }))} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Natureza (Irê/Ibi)</label>
                  <select
                    value={form.default_ire_ibi || "ibi"}
                    onChange={e => setForm(f => ({ ...f, default_ire_ibi: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="ire">Irê (Caminho positivo)</option>
                    <option value="ibi">Ibi (Precisa de cuidado)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Estilo Visual</label>
                  <select
                    value={form.color_type || "accent"}
                    onChange={e => setForm(f => ({ ...f, color_type: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Orientação do Mestre (texto)</label>
                <Textarea value={form.guidance_message || ""} onChange={e => setForm(f => ({ ...f, guidance_message: e.target.value }))} rows={3} placeholder="Texto que o mestre fala quando esse resultado aparece..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Áudio do Mestre (URL)</label>
                <Input value={form.guidance_audio_url || ""} onChange={e => setForm(f => ({ ...f, guidance_audio_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted">Cancelar</button>
                <button onClick={() => handleSave(c.id)} disabled={updateConfig.isPending} className="px-4 py-2 text-sm rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center gap-2">
                  {updateConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg">{c.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.result_key}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.default_ire_ibi === 'ire' ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'}`}>
                    {c.default_ire_ibi === 'ire' ? 'Irê' : 'Ibi'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.meaning}</p>
              </div>
              <button onClick={() => startEdit(c)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted font-semibold">Editar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminOracleConfigs;
