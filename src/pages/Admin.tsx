import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useRituals, useCreateRitual, useUpdateRitual, useDeleteRitual, Ritual } from "@/hooks/useRituals";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";
import JsonImporter from "@/components/JsonImporter";

const CATEGORIES = ["oriki", "ibori", "ebo", "geral"];

const AdminPage = () => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: rituals, isLoading } = useRituals();
  const createRitual = useCreateRitual();
  const updateRitual = useUpdateRitual();
  const deleteRitual = useDeleteRitual();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState<Ritual | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("geral");
  const [contentFull, setContentFull] = useState("");
  const [triggerOracle, setTriggerOracle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
  };

  const openEdit = (r: Ritual) => {
    setEditing(r);
    setTitle(r.title);
    setCategory(r.category);
    setContentFull(r.content_full);
    setTriggerOracle(r.trigger_oracle || "");
    setImageUrl(r.image_url || "");
    setIsPremium((r as any).is_premium ?? false);
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setCategory("geral");
    setContentFull("");
    setTriggerOracle("");
    setImageUrl("");
    setIsPremium(false);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        category,
        content_full: contentFull,
        trigger_oracle: triggerOracle || null,
        image_url: imageUrl || null,
        is_premium: isPremium,
      };
      if (editing) {
        await updateRitual.mutateAsync({ id: editing.id, ...payload });
        toast.success("Ritual atualizado!");
      } else {
        await createRitual.mutateAsync(payload);
        toast.success("Ritual criado!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ritual?")) return;
    try {
      await deleteRitual.mutateAsync(id);
      toast.success("Ritual excluído!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (authLoading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-display font-bold text-center mb-2">Admin</h1>
          <p className="text-center text-muted-foreground mb-8">Acesse o painel de gestão</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary outline-none" required />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary outline-none" required />
            <button type="submit" className="w-full py-3 rounded-xl gradient-sacred text-primary-foreground font-bold text-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-muted-foreground text-center">Você não tem permissão de administrador.</p>
        <button onClick={signOut} className="text-sm text-primary underline">Sair</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-3xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" /> Início
            </Link>
            <h1 className="text-3xl font-display font-bold">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImporter(!showImporter)} className="px-3 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted">
              📦 JSON
            </button>
            <button onClick={openNew} className="gradient-sacred text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> Novo
            </button>
            <button onClick={signOut} className="p-2 rounded-xl border border-border hover:bg-muted" title="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showImporter && (
          <div className="mb-6">
            <JsonImporter />
          </div>
        )}

        {/* Ritual Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-start justify-center overflow-y-auto p-4">
            <div className="bg-background rounded-2xl p-6 w-full max-w-2xl my-8 border border-border">
              <h2 className="text-2xl font-display font-bold mb-4">{editing ? "Editar Ritual" : "Novo Ritual"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Título</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Categoria</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="w-5 h-5 rounded accent-accent" />
                      <span className="text-sm font-semibold">🔒 Premium</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Trigger Oráculo (opcional)</label>
                  <input type="text" value={triggerOracle} onChange={e => setTriggerOracle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: Ejife, Alafia..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">URL da Imagem (opcional)</label>
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Conteúdo Completo (Markdown)</label>
                  <textarea value={contentFull} onChange={e => setContentFull(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none min-h-[300px] font-mono text-sm resize-y" placeholder="# Título&#10;&#10;Use **negrito**, *itálico*, listas, etc." required />
                  <p className="text-xs text-muted-foreground mt-1">Suporta Markdown: # Títulos, **negrito**, *itálico*, listas, citações (&gt;), etc.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-3 rounded-xl gradient-sacred text-primary-foreground font-bold">
                    {editing ? "Salvar Alterações" : "Criar Ritual"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-border font-semibold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rituals list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="space-y-3">
            {rituals.map(r => (
              <div key={r.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold flex items-center gap-2">
                    {r.title}
                    {(r as any).is_premium && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">Premium</span>}
                  </h3>
                  <span className="text-xs text-muted-foreground capitalize">{r.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">Nenhum ritual cadastrado. Clique em "Novo" para começar.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
