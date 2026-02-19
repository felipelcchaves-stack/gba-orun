import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAllIreIbiTypes,
  useCreateIreIbiType,
  useUpdateIreIbiType,
  useDeleteIreIbiType,
  IreIbiType,
} from "@/hooks/useIreIbiTypes";
import { useRituals } from "@/hooks/useRituals";
import { useOfferings } from "@/hooks/useOfferings";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "ire" as "ire" | "ibi",
  display_order: 0,
  is_active: true,
  guidance_message: "",
  guidance_audio_url: "",
  ritual_id: "",
  offering_id: "",
};

const AdminIreIbiTypes = () => {
  const { data: types, isLoading } = useAllIreIbiTypes();
  const createType = useCreateIreIbiType();
  const updateType = useUpdateIreIbiType();
  const deleteType = useDeleteIreIbiType();
  const { data: rituals } = useRituals();
  const { data: offerings } = useOfferings();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (t: IreIbiType) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description,
      category: t.category,
      display_order: t.display_order,
      is_active: t.is_active,
      guidance_message: t.guidance_message,
      guidance_audio_url: t.guidance_audio_url || "",
      ritual_id: t.ritual_id || "",
      offering_id: t.offering_id || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        display_order: form.display_order,
        is_active: form.is_active,
        guidance_message: form.guidance_message,
        guidance_audio_url: form.guidance_audio_url || null,
        ritual_id: form.ritual_id || null,
        offering_id: form.offering_id || null,
      };
      if (editingId) {
        await updateType.mutateAsync({ id: editingId, ...payload });
        toast.success("Tipo atualizado!");
      } else {
        await createType.mutateAsync(payload);
        toast.success("Tipo criado!");
      }
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteType.mutateAsync(deleteId);
      toast.success("Tipo excluído!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteId(null);
    }
  };

  const ireTypes = (types || []).filter(t => t.category === "ire");
  const ibiTypes = (types || []).filter(t => t.category === "ibi");

  const renderList = (items: IreIbiType[], label: string) => (
    <div className="space-y-3">
      <h3 className="text-lg font-display font-semibold text-foreground border-b border-border pb-2">{label} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Nenhum tipo cadastrado.</p>
      ) : (
        items.map(t => (
          <Card key={t.id} className="p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{t.name}</span>
                <Badge variant={t.is_active ? "default" : "secondary"} className="text-[10px]">
                  {t.is_active ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-xs text-muted-foreground">Ordem: {t.display_order}</span>
              </div>
              {t.description && <p className="text-xs text-muted-foreground mt-1 truncate">{t.description}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Tipos Iré / Ibi</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os tipos de Iré e Ibi usados no oráculo</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Novo Tipo
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {renderList(ireTypes, "Iré (Bênçãos)")}
          {renderList(ibiTypes, "Ibi (Obstáculos)")}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Tipo" : "Novo Tipo Iré/Ibi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Iré Aiku" />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as "ire" | "ibi" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ire">Iré</SelectItem>
                    <SelectItem value="ibi">Ibi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição do tipo" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ordem de exibição</Label>
                <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mensagem de orientação</Label>
              <Textarea value={form.guidance_message} onChange={e => setForm(f => ({ ...f, guidance_message: e.target.value }))} placeholder="Mensagem exibida ao usuário" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>URL do áudio de orientação</Label>
              <Input value={form.guidance_audio_url} onChange={e => setForm(f => ({ ...f, guidance_audio_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ritual vinculado</Label>
                <Select value={form.ritual_id || "none"} onValueChange={v => setForm(f => ({ ...f, ritual_id: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {(rituals || []).map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Oferenda vinculada</Label>
                <Select value={form.offering_id || "none"} onValueChange={v => setForm(f => ({ ...f, offering_id: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {(offerings || []).map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
              {saving ? "Salvando..." : editingId ? "Salvar" : "Criar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminIreIbiTypes;
