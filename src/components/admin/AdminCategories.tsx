import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Power, PowerOff, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const EMPTY: Omit<Category, "id" | "created_at"> = {
  key: "", label: "", description: "", icon_name: "BookOpen",
  image_url: null, display_order: 0, is_active: true,
};

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories(false);
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [checking, setChecking] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, display_order: (categories?.length || 0) + 1 });
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      key: c.key, label: c.label, description: c.description,
      icon_name: c.icon_name, image_url: c.image_url,
      display_order: c.display_order, is_active: c.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.key || !form.label) {
      toast.error("Key e Label são obrigatórios");
      return;
    }
    if (!/^[a-z_]+$/.test(form.key)) {
      toast.error("Key deve conter apenas letras minúsculas e underscore");
      return;
    }
    try {
      if (editing) {
        await updateCat.mutateAsync({ id: editing.id, ...form });
        toast.success("Categoria atualizada!");
      } else {
        await createCat.mutateAsync(form);
        toast.success("Categoria criada!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (c: Category) => {
    setChecking(true);
    try {
      // Check if category is in use
      const [r1, r2] = await Promise.all([
        supabase.from("rituals").select("id", { count: "exact", head: true }).eq("category", c.key),
        supabase.from("offerings").select("id", { count: "exact", head: true }).eq("category", c.key),
      ]);
      const totalInUse = (r1.count || 0) + (r2.count || 0);
      if (totalInUse > 0) {
        toast.error(`Não é possível excluir: ${totalInUse} item(ns) usando esta categoria. Desative-a em vez disso.`);
        return;
      }
      if (!confirm(`Excluir a categoria "${c.label}"?`)) return;
      await deleteCat.mutateAsync(c.id);
      toast.success("Categoria excluída!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChecking(false);
    }
  };

  const toggleActive = async (c: Category) => {
    try {
      await updateCat.mutateAsync({ id: c.id, is_active: !c.is_active });
      toast.success(c.is_active ? "Categoria desativada" : "Categoria ativada");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as categorias de conteúdo</p>
        </div>
        <button onClick={openNew} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-bold text-lg">{editing ? "Editar Categoria" : "Nova Categoria"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Key (identificador único)</label>
              <input
                value={form.key}
                onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                disabled={!!editing}
                placeholder="ex: oriki"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Label</label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="ex: Orikis"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="ex: Louvações aos Orixás"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ícone Lucide</label>
              <input
                value={form.icon_name}
                onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))}
                placeholder="ex: Sparkles"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ordem</label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">URL da Imagem (opcional)</label>
              <input
                value={form.image_url || ""}
                onChange={e => setForm(f => ({ ...f, image_url: e.target.value || null }))}
                placeholder="https://..."
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <span className="text-sm">Ativa</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl font-semibold text-sm">
              {editing ? "Salvar" : "Criar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-border text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c.id} className={`bg-card rounded-2xl p-4 border border-border flex items-center gap-4 ${!c.is_active ? "opacity-50" : ""}`}>
              {c.image_url && (
                <img src={c.image_url} alt={c.label} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm flex items-center gap-2">
                  {c.label}
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{c.key}</span>
                  {!c.is_active && <span className="text-[10px] text-destructive">Inativa</span>}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{c.description}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">#{c.display_order}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggleActive(c)} className="p-2 rounded-lg hover:bg-muted" title={c.is_active ? "Desativar" : "Ativar"}>
                  {c.is_active ? <PowerOff className="h-4 w-4 text-muted-foreground" /> : <Power className="h-4 w-4 text-primary" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-muted">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(c)} disabled={checking} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Nenhuma categoria cadastrada.</p>
      )}
    </div>
  );
};

export default AdminCategories;
