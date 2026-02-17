import { useState } from "react";
import { useOracleStepTexts, useUpdateOracleStepText, type OracleStepText } from "@/hooks/useOracleConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const STEP_LABELS: Record<string, string> = {
  ire_ibi: "Etapa 2: Irê ou Ibi",
  ebo: "Etapa 3: Ebó (pergunta principal)",
  ebo_ire: "Etapa 3: Tipo de Ebó em Irê",
  ebo_ibi: "Etapa 3: Tipo de Ebó em Ibi",
  ori: "Etapa 4: Ori (pergunta principal)",
  ori_ire: "Etapa 4: Ori em Irê",
  ori_ibi: "Etapa 4: Ori em Ibi",
  iyami: "Etapa 5: Iyami",
  egbe: "Etapa 5: Egbe Orun",
};

const AdminOracleStepTexts = () => {
  const { data: texts, isLoading } = useOracleStepTexts();
  const update = useUpdateOracleStepText();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OracleStepText>>({});

  const startEdit = (t: OracleStepText) => {
    setEditingId(t.id);
    setForm({ title: t.title, description: t.description });
  };

  const handleSave = async (id: string) => {
    try {
      await update.mutateAsync({ id, ...form });
      toast.success("Texto atualizado!");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">Edite os títulos e descrições de cada etapa do wizard do Oráculo.</p>
      {texts?.map(t => (
        <div key={t.id} className="bg-card rounded-2xl border border-border p-5">
          <p className="text-xs font-semibold text-muted-foreground mb-2">{STEP_LABELS[t.step_key] || t.step_key}</p>
          {editingId === t.id ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Título</label>
                <Input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descrição</label>
                <Textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted">Cancelar</button>
                <button onClick={() => handleSave(t.id)} disabled={update.isPending} className="px-4 py-2 text-sm rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center gap-2">
                  {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm">{t.title}</h4>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <button onClick={() => startEdit(t)} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted font-semibold shrink-0">Editar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminOracleStepTexts;
