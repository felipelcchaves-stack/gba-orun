import { useState } from "react";
import { useOfferings, useCreateOffering, useUpdateOffering, useDeleteOffering, type Offering } from "@/hooks/useOfferings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "ebo", label: "Ebó" },
  { value: "ibori", label: "Ibori" },
  { value: "egbe_orun", label: "Egbe Orun" },
  { value: "iyami", label: "Iyami" },
  { value: "oracao_ori", label: "Oração ao Ori" },
  { value: "geral", label: "Geral" },
];

const EMPTY: Partial<Offering> = {
  title: "",
  description: "",
  ingredients: "",
  instructions: "",
  category: "geral",
  is_premium: false,
  audio_url: null,
  image_url: null,
  display_order: 0,
};

const AdminOfferings = () => {
  const { data: offerings, isLoading } = useOfferings();
  const create = useCreateOffering();
  const update = useUpdateOffering();
  const remove = useDeleteOffering();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Offering>>(EMPTY);
  const [isNew, setIsNew] = useState(false);
  const [filterCat, setFilterCat] = useState("");

  const startNew = () => { setForm({ ...EMPTY }); setIsNew(true); setEditingId("new"); };
  const startEdit = (o: Offering) => { setForm({ ...o }); setIsNew(false); setEditingId(o.id); };
  const cancel = () => { setEditingId(null); setIsNew(false); };

  const handleSave = async () => {
    if (!form.title) { toast.error("Preencha o título."); return; }
    try {
      if (isNew) {
        await create.mutateAsync(form as any);
        toast.success("Oferenda criada!");
      } else if (editingId) {
        await update.mutateAsync({ id: editingId, ...form } as any);
        toast.success("Oferenda atualizada!");
      }
      cancel();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta oferenda?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Oferenda excluída!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const isPending = create.isPending || update.isPending;
  const filtered = offerings?.filter(o => !filterCat || o.category === filterCat) ?? [];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const renderForm = () => (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-3 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Título</label>
          <Input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Ebó de Limpeza com Ovo" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Categoria</label>
          <select value={form.category || "geral"} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Descrição curta</label>
        <Input value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição breve da oferenda" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">🧂 Ingredientes (Markdown)</label>
        <Textarea value={form.ingredients || ""} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} placeholder="- 1 ovo&#10;- Mel&#10;- Azeite de dendê" rows={5} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">📋 Instruções (Markdown)</label>
        <Textarea value={form.instructions || ""} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="1. Prepare o local...&#10;2. Coloque os ingredientes..." rows={5} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">🎧 URL do Áudio (opcional)</label>
          <Input value={form.audio_url || ""} onChange={e => setForm(f => ({ ...f, audio_url: e.target.value || null }))} placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">🖼️ URL da Imagem (opcional)</label>
          <Input value={form.image_url || ""} onChange={e => setForm(f => ({ ...f, image_url: e.target.value || null }))} placeholder="https://..." />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ordem</label>
          <Input type="number" value={form.display_order || 0} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_premium || false} onCheckedChange={v => setForm(f => ({ ...f, is_premium: v }))} />
          <label className="text-xs font-semibold text-muted-foreground">Premium</label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={cancel} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted flex items-center gap-1"><X className="h-4 w-4" /> Cancelar</button>
        <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Oferendas</h1>
        <p className="text-sm text-muted-foreground mt-1">Cadastre receitas de ebós, oferendas e rituais</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          <button onClick={() => setFilterCat("")} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${!filterCat ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>Todas</button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilterCat(c.value)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${filterCat === c.value ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>{c.label}</button>
          ))}
        </div>
        <button onClick={startNew} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Nova Oferenda
        </button>
      </div>

      {editingId === "new" && renderForm()}

      <div className="space-y-2">
        {filtered.map(o => (
          editingId === o.id ? (
            <div key={o.id}>{renderForm()}</div>
          ) : (
            <div key={o.id} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="font-display font-bold text-sm flex items-center gap-2">
                  {o.title}
                  {o.is_premium && <span className="text-[10px] bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">Premium</span>}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {CATEGORIES.find(c => c.value === o.category)?.label || o.category}
                  {o.description && ` · ${o.description.slice(0, 60)}`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(o)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(o.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )
        ))}
        {filtered.length === 0 && !isNew && (
          <p className="text-center text-muted-foreground py-12">Nenhuma oferenda cadastrada.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOfferings;
