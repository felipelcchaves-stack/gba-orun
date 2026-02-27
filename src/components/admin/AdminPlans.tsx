import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptionPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  SubscriptionPlan,
} from "@/hooks/useSubscriptionPlans";

const PERIOD_LABELS: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
};

const emptyForm = {
  name: "",
  price: 0,
  net_price: "" as string | number,
  billing_period: "monthly",
  guru_checkout_url: "",
  description: "",
  is_active: true,
  display_order: 0,
};

const AdminPlans = () => {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: SubscriptionPlan) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price,
      net_price: p.net_price ?? "",
      billing_period: p.billing_period,
      guru_checkout_url: p.guru_checkout_url || "",
      description: p.description || "",
      is_active: p.is_active,
      display_order: p.display_order,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, guru_checkout_url: form.guru_checkout_url || null, description: form.description || null, net_price: form.net_price === "" ? null : Number(form.net_price) };
      if (editing) {
        await updatePlan.mutateAsync({ id: editing.id, ...payload });
        toast.success("Plano atualizado!");
      } else {
        await createPlan.mutateAsync(payload);
        toast.success("Plano criado!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este plano?")) return;
    try {
      await deletePlan.mutateAsync(id);
      toast.success("Plano excluído!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (p: SubscriptionPlan) => {
    await updatePlan.mutateAsync({ id: p.id, is_active: !p.is_active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Planos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os planos de assinatura</p>
        </div>
        <button onClick={openNew} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo Plano
        </button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display font-bold">{editing ? "Editar Plano" : "Novo Plano"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Nome (ex: Mensal)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground" />
              <input type="number" step="0.01" placeholder="Preço bruto" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground" />
              <input type="number" step="0.01" placeholder="Valor líquido (recebido)" value={form.net_price} onChange={e => setForm(f => ({ ...f, net_price: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground" />
              <select value={form.billing_period} onChange={e => setForm(f => ({ ...f, billing_period: e.target.value }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground">
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
              <input type="number" placeholder="Ordem de exibição" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground" />
              <input placeholder="Link Checkout Guru" value={form.guru_checkout_url} onChange={e => setForm(f => ({ ...f, guru_checkout_url: e.target.value }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground col-span-full" />
              <textarea placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="px-4 py-3 rounded-xl bg-background border border-border text-foreground col-span-full" rows={2} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-xl font-semibold text-sm">Salvar</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border border-border text-sm">Cancelar</button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {(plans ?? []).map(p => (
            <Card key={p.id}>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-foreground">{p.name}</span>
                    <Badge variant={p.is_active ? "default" : "secondary"} className={p.is_active ? "bg-green-600" : ""}>
                      {p.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    R$ {Number(p.price).toFixed(2)} / {PERIOD_LABELS[p.billing_period] || p.billing_period}
                    {p.net_price != null && <span className="ml-2 text-primary font-medium">| Líquido: R$ {Number(p.net_price).toFixed(2)}</span>}
                  </p>
                  {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                  {p.guru_checkout_url && <p className="text-xs text-primary mt-1 truncate max-w-md">{p.guru_checkout_url}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={p.is_active} onCheckedChange={() => handleToggle(p)} />
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
