import { useState } from "react";
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion, usePromotionClickStats, Promotion } from "@/hooks/usePromotions";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const KNOWLEDGE_OPTIONS = [
  { key: "obi", label: "Obi" },
  { key: "ebo", label: "Ebo" },
  { key: "ori", label: "Ori" },
  { key: "iyami", label: "Iyami" },
  { key: "egbe_orun", label: "Egbe Orun" },
];

const EMPTY: Omit<Promotion, "id" | "created_at"> = {
  title: "",
  description: "",
  banner_url: "",
  checkout_url: "",
  is_active: true,
  display_order: 0,
  show_on_home: false,
  target_knowledge_gaps: [],
  force_show_all: false,
};

const AdminPromotions = () => {
  const { data: promotions, isLoading } = usePromotions();
  const { data: clickStats } = usePromotionClickStats();
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();
  const deletePromo = useDeletePromotion();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description || "", banner_url: p.banner_url || "", checkout_url: p.checkout_url, is_active: p.is_active, display_order: p.display_order, show_on_home: p.show_on_home, target_knowledge_gaps: p.target_knowledge_gaps || [], force_show_all: p.force_show_all || false });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.checkout_url) { toast.error("Título e URL de checkout são obrigatórios"); return; }
    try {
      if (editing) {
        await updatePromo.mutateAsync({ id: editing.id, ...form });
        toast.success("Promoção atualizada!");
      } else {
        await createPromo.mutateAsync(form);
        toast.success("Promoção criada!");
      }
      setShowForm(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta promoção?")) return;
    try { await deletePromo.mutateAsync(id); toast.success("Excluída!"); } catch (e: any) { toast.error(e.message); }
  };

  const toggleActive = async (p: Promotion) => {
    await updatePromo.mutateAsync({ id: p.id, is_active: !p.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Promoções</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie ofertas e acompanhe cliques</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nova Promoção</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>URL de Checkout *</Label><Input value={form.checkout_url} onChange={e => setForm(f => ({ ...f, checkout_url: e.target.value }))} /></div>
              <div><Label>URL do Banner</Label><Input value={form.banner_url || ""} onChange={e => setForm(f => ({ ...f, banner_url: e.target.value }))} /></div>
              <div><Label>Ordem</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Descrição</Label><Input value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Ativa</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.show_on_home} onCheckedChange={v => setForm(f => ({ ...f, show_on_home: v }))} />
              <Label>Exibir na Home</Label>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-semibold">Segmentação por Conhecimento</Label>
              <p className="text-xs text-muted-foreground">Mostra só para quem NÃO sabe os tópicos marcados</p>
              <div className="flex flex-wrap gap-4">
                {KNOWLEDGE_OPTIONS.map(opt => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.target_knowledge_gaps.includes(opt.key)}
                      disabled={form.force_show_all}
                      onCheckedChange={(checked) => {
                        setForm(f => ({
                          ...f,
                          target_knowledge_gaps: checked
                            ? [...f.target_knowledge_gaps, opt.key]
                            : f.target_knowledge_gaps.filter(g => g !== opt.key),
                        }));
                      }}
                    />
                    <Label className="text-sm">{opt.label}</Label>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Switch checked={form.force_show_all} onCheckedChange={v => setForm(f => ({ ...f, force_show_all: v }))} />
                <Label>Forçar para todos (ignora segmentação — ex: Black Friday)</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <div className="h-20 bg-card rounded-2xl animate-pulse" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Público</TableHead>
              <TableHead>Home</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(promotions || []).map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>
                  <button onClick={() => toggleActive(p)} className="flex items-center gap-1.5 text-xs">
                    {p.is_active ? <><Eye className="h-3.5 w-3.5 text-green-600" /> Ativa</> : <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> Inativa</>}
                  </button>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {p.force_show_all
                      ? "Todos (forçado)"
                      : p.target_knowledge_gaps?.length
                        ? `Não sabe: ${p.target_knowledge_gaps.map(g => KNOWLEDGE_OPTIONS.find(o => o.key === g)?.label || g).join(", ")}`
                        : "Todos"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs ${p.show_on_home ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                    {p.show_on_home ? "Sim" : "Não"}
                  </span>
                </TableCell>
                <TableCell>{p.display_order}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {clickStats && clickStats.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Top Promoções por Cliques e Conversões</h3>
            <div className="space-y-2">
            {clickStats.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{s.title}</span>
                  <div className="flex gap-4">
                    <span className="font-bold">{s.clicks} cliques</span>
                    <span className="font-bold text-accent">{s.conversions} {s.conversions === 1 ? "conversão" : "conversões"}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPromotions;
