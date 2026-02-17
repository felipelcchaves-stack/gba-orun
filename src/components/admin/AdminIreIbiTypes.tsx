import { useState } from "react";
import { Plus, Pencil, Trash2, Sun, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAllIreIbiTypes, useCreateIreIbiType, useUpdateIreIbiType, useDeleteIreIbiType, type IreIbiType } from "@/hooks/useIreIbiTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EMPTY: Omit<IreIbiType, "id" | "created_at"> = {
  category: "ire",
  name: "",
  description: "",
  display_order: 0,
  is_active: true,
};

const AdminIreIbiTypes = () => {
  const { data: types, isLoading } = useAllIreIbiTypes();
  const create = useCreateIreIbiType();
  const update = useUpdateIreIbiType();
  const remove = useDeleteIreIbiType();

  const [editing, setEditing] = useState<IreIbiType | null>(null);
  const [form, setForm] = useState<Omit<IreIbiType, "id" | "created_at">>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (t: IreIbiType) => {
    setEditing(t);
    setForm({ category: t.category, name: t.name, description: t.description, display_order: t.display_order, is_active: t.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        toast.success("Tipo atualizado!");
      } else {
        await create.mutateAsync(form);
        toast.success("Tipo criado!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este tipo?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Excluído!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const ireTypes = types?.filter(t => t.category === "ire") ?? [];
  const ibiTypes = types?.filter(t => t.category === "ibi") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold">Tipos de Irê e Ibi</h2>
          <p className="text-sm text-muted-foreground">Gerencie os subtipos que aparecem no oráculo</p>
        </div>
        <button onClick={openNew} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo Tipo
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-bold">{editing ? "Editar Tipo" : "Novo Tipo"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria</Label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as "ire" | "ibi" }))}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="ire">Irê</option>
                <option value="ibi">Ibi</option>
              </select>
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Irê Ajé" className="mt-1" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição curta..." className="mt-1" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} id="active-check" />
            <Label htmlFor="active-check">Ativo</Label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-foreground text-background px-5 py-2 rounded-xl font-semibold text-sm">Salvar</button>
            <button onClick={() => setShowForm(false)} className="border border-border px-5 py-2 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-6">
          {[
            { label: "Irê", items: ireTypes, icon: Sun, color: "text-primary" },
            { label: "Ibi", items: ibiTypes, icon: AlertTriangle, color: "text-destructive" },
          ].map(({ label, items, icon: Icon, color }) => (
            <div key={label} className="space-y-2">
              <h3 className="font-display font-semibold text-sm flex items-center gap-2 border-b border-border pb-2">
                <Icon className={`h-4 w-4 ${color}`} /> {label} ({items.length})
              </h3>
              {items.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhum tipo cadastrado</p>}
              {items.map(t => (
                <div key={t.id} className={`bg-card border border-border rounded-xl p-3 flex items-center justify-between ${!t.is_active ? "opacity-50" : ""}`}>
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.description || "—"}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminIreIbiTypes;
