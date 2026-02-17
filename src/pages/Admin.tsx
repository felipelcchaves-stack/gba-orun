import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useRituals, useCreateRitual, useUpdateRitual, useDeleteRitual, Ritual } from "@/hooks/useRituals";
import { Plus, Pencil, Trash2, Shield, Sunrise } from "lucide-react";
import { toast } from "sonner";
import JsonImporter from "@/components/JsonImporter";
import AdminRitualForm from "@/components/admin/AdminRitualForm";
import AdminOfferSettings from "@/components/admin/AdminOfferSettings";
import AdminOracleConfigs from "@/components/admin/AdminOracleConfigs";
import AdminOracleTaskTemplates from "@/components/admin/AdminOracleTaskTemplates";
import AdminOracleStepTexts from "@/components/admin/AdminOracleStepTexts";
import AdminSidebar, { AdminSection } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminRitualLinks from "@/components/admin/AdminRitualLinks";
import AdminCommunity from "@/components/admin/AdminCommunity";
import AdminPlans from "@/components/admin/AdminPlans";
import AdminPromotions from "@/components/admin/AdminPromotions";
import AdminGuidance from "@/components/admin/AdminGuidance";

import { ALL_CATEGORY_KEYS, getCategoryLabel } from "@/lib/categories";
const CATEGORIES = ALL_CATEGORY_KEYS;

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
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [defaultFormCategory, setDefaultFormCategory] = useState<string | undefined>(undefined);
  const [oracleSubTab, setOracleSubTab] = useState<"configs" | "tasks" | "texts">("configs");
  const [filterCat, setFilterCat] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
  };

  const openEdit = (r: Ritual) => { setEditing(r); setDefaultFormCategory(undefined); setShowForm(true); };
  const openNew = () => { setEditing(null); setDefaultFormCategory(undefined); setShowForm(true); };

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

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar active={activeSection} onNavigate={setActiveSection} onSignOut={signOut} />

      <main className="flex-1 p-8 overflow-auto">
        {activeSection === "dashboard" && <AdminDashboard />}

        {activeSection === "users" && <AdminUsers />}

        {activeSection === "plans" && <AdminPlans />}

        {activeSection === "rituals" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Rituais</h1>
              <p className="text-sm text-muted-foreground mt-1">Gerencie os rituais do aplicativo</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
                <button onClick={() => setFilterCat("")} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${!filterCat ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>Todos</button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilterCat(c)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${filterCat === c ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>{getCategoryLabel(c)}</button>
                ))}
              </div>
              <button onClick={openNew} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Novo Ritual
              </button>
              <button onClick={() => { setEditing(null); setDefaultFormCategory("oracao_manha"); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0">
                <Sunrise className="h-4 w-4" /> Nova Oração
              </button>
            </div>

            {showForm && (
              <AdminRitualForm editing={editing} onSave={handleSave} onCancel={() => setShowForm(false)} defaultCategory={defaultFormCategory} />
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}
              </div>
            ) : rituals && rituals.length > 0 ? (
              (() => {
                const PRAYER_CATS = ["oracao_manha", "oracao_noite", "oracao_ori", "oracao_iyami"];
                const filtered = rituals.filter(r => !filterCat || r.category === filterCat);
                const prayers = filtered.filter(r => PRAYER_CATS.includes(r.category));
                const others = filtered.filter(r => !PRAYER_CATS.includes(r.category));

                const renderItem = (r: Ritual) => (
                  <div key={r.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold flex items-center gap-2">
                        {r.title}
                        {r.is_premium && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">Premium</span>}
                      </h3>
                      <span className="text-xs text-muted-foreground">{getCategoryLabel(r.category)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                );

                return (
                  <div className="space-y-6">
                    {others.length > 0 && (
                      <div className="space-y-3">
                        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                          <Shield className="h-5 w-5 text-primary" /> Rituais ({others.length})
                        </h2>
                        {others.map(renderItem)}
                      </div>
                    )}
                    {prayers.length > 0 && (
                      <div className="space-y-3">
                        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                          <Sunrise className="h-5 w-5 text-primary" /> Orações ({prayers.length})
                        </h2>
                        {prayers.map(renderItem)}
                      </div>
                    )}
                    {filtered.length === 0 && (
                      <p className="text-center text-muted-foreground py-12">Nenhum item encontrado.</p>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-center text-muted-foreground py-12">Nenhum ritual cadastrado.</p>
            )}
          </div>
        )}

        {activeSection === "oracle" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Oráculo</h1>
              <p className="text-sm text-muted-foreground mt-1">Configure o motor de decisão</p>
            </div>
            <div className="flex gap-2">
              {([
                { key: "configs" as const, label: "Resultados do Obi" },
                { key: "tasks" as const, label: "Tarefas Sugeridas" },
                { key: "texts" as const, label: "Textos das Etapas" },
              ]).map(sub => (
                <button
                  key={sub.key}
                  onClick={() => setOracleSubTab(sub.key)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    oracleSubTab === sub.key
                      ? "bg-foreground text-background"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
            {oracleSubTab === "configs" && <AdminOracleConfigs />}
            {oracleSubTab === "tasks" && <AdminOracleTaskTemplates />}
            {oracleSubTab === "texts" && <AdminOracleStepTexts />}
          </div>
        )}

        {activeSection === "links" && <AdminRitualLinks />}

        {activeSection === "community" && <AdminCommunity />}

        {activeSection === "promotions" && <AdminPromotions />}

        {activeSection === "guidance" && <AdminGuidance />}

        {activeSection === "settings" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground mt-1">Ajustes gerais do aplicativo</p>
            </div>
            <AdminOfferSettings />
          </div>
        )}

        {activeSection === "import" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Importar Dados</h1>
              <p className="text-sm text-muted-foreground mt-1">Importe rituais e conteúdo via JSON</p>
            </div>
            <JsonImporter />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
