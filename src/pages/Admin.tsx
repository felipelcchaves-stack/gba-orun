import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useRituals, useCreateRitual, useUpdateRitual, useDeleteRitual, Ritual } from "@/hooks/useRituals";
import { useAppSettings, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, LogOut, Settings, BookOpen, Users, FileJson } from "lucide-react";
import { toast } from "sonner";
import JsonImporter from "@/components/JsonImporter";
import AdminRitualForm from "@/components/admin/AdminRitualForm";
import AdminOfferSettings from "@/components/admin/AdminOfferSettings";

const CATEGORIES = ["oriki", "ibori", "ebo", "geral"];

const AdminPage = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: rituals, isLoading } = useRituals();
  const createRitual = useCreateRitual();
  const updateRitual = useUpdateRitual();
  const deleteRitual = useDeleteRitual();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState<Ritual | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"rituals" | "settings" | "import">("rituals");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
  };

  const openEdit = (r: Ritual) => {
    setEditing(r);
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSave = async (payload: any) => {
    try {
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
    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      const { error } = await signUp(email, password);
      if (error) toast.error(error.message);
      else toast.success("Conta criada! Você já está logado.");
    };

    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-display font-bold text-center mb-2">Admin</h1>
          <p className="text-center text-muted-foreground mb-8">Acesse o painel de gestão</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary outline-none" required />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary outline-none" required />
            <button type="submit" className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-lg">Entrar</button>
            <button type="button" onClick={handleSignUp} className="w-full py-3 rounded-xl border border-border font-semibold text-sm hover:bg-muted">Criar Conta Admin (primeiro acesso)</button>
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

  const TABS = [
    { key: "rituals" as const, label: "Rituais", icon: BookOpen },
    { key: "settings" as const, label: "Configurações", icon: Settings },
    { key: "import" as const, label: "Importar", icon: FileJson },
  ];

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
          <button onClick={signOut} className="p-2 rounded-xl border border-border hover:bg-muted" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "rituals" && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={openNew} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Novo Ritual
              </button>
            </div>

            {showForm && (
              <AdminRitualForm
                editing={editing}
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
              />
            )}

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
                        {r.is_premium && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">Premium</span>}
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
              <p className="text-center text-muted-foreground py-12">Nenhum ritual cadastrado.</p>
            )}
          </>
        )}

        {activeTab === "settings" && <AdminOfferSettings />}
        {activeTab === "import" && <JsonImporter />}
      </div>
    </div>
  );
};

export default AdminPage;
