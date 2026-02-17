import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAdminProfiles } from "@/hooks/useAdminData";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Unlock, UserPlus, Upload, MoreHorizontal, Pencil, Shield, ShieldOff, Trash2, ChevronDown, Smartphone } from "lucide-react";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const GENDER_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não-binário",
  prefiro_nao_dizer: "N/I",
};

const RELIGION_LABELS: Record<string, string> = {
  candomble: "Candomblé",
  umbanda: "Umbanda",
  ifa: "Ifá",
  outra: "Outra",
  prefiro_nao_dizer: "N/I",
};

const SUB_STATUS_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativos" },
  { key: "overdue", label: "Inadimplentes" },
  { key: "cancelled", label: "Cancelados" },
  { key: "free", label: "Gratuitos" },
] as const;

type FilterKey = (typeof SUB_STATUS_FILTERS)[number]["key"];

const SUB_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-green-600 hover:bg-green-700" },
  overdue: { label: "Inadimplente", className: "bg-destructive hover:bg-destructive/90" },
  cancelled: { label: "Cancelado", className: "bg-yellow-600 hover:bg-yellow-700" },
  free: { label: "Gratuito", className: "" },
};

const AdminUsers = () => {
  const { data: profiles, isLoading } = useAdminProfiles();
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");
  const [genderFilter, setGenderFilter] = useState("");
  const [religionFilter, setReligionFilter] = useState("");
  const qc = useQueryClient();

  // Create single user
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPremium, setCreatePremium] = useState(false);
  const [createAdmin, setCreateAdmin] = useState(false);
  const [creating, setCreating] = useState(false);

  // Bulk import
  const [showBulk, setShowBulk] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Edit modal
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editReligion, setEditReligion] = useState("");
  const [editCareDay, setEditCareDay] = useState("");
  const [editSubStatus, setEditSubStatus] = useState("");
  const [editExpires, setEditExpires] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  const filtered = (profiles ?? []).filter((p) => {
    const sub = p.subscription_status || "free";
    if (statusFilter !== "all" && sub !== statusFilter) return false;
    if (genderFilter && (p.gender || "") !== genderFilter) return false;
    if (religionFilter && (p.religion || "") !== religionFilter) return false;
    return true;
  });

  const calcAge = (birthDate: string | null) => {
    if (!birthDate) return "—";
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const callEdgeFn = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("admin-manage-users", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  // ─── CREATE SINGLE ───
  const handleCreate = async () => {
    if (!createEmail || !createPassword || createPassword.length < 6) {
      toast.error("Email e senha (mín. 6 caracteres) obrigatórios");
      return;
    }
    setCreating(true);
    try {
      await callEdgeFn({
        action: "create_single",
        email: createEmail,
        password: createPassword,
        display_name: createName || null,
        is_premium: createPremium,
        is_admin: createAdmin,
      });
      toast.success(`Usuário ${createEmail} criado!`);
      setCreateEmail(""); setCreatePassword(""); setCreateName("");
      setCreatePremium(false); setCreateAdmin(false); setShowCreate(false);
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  // ─── BULK IMPORT ───
  const handleBulk = async () => {
    setBulkLoading(true);
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON deve ser um array");
      const result = await callEdgeFn({ action: "create_bulk", users: parsed });
      const successCount = result.success?.length || 0;
      const failCount = result.failed?.length || 0;
      toast.success(`${successCount} criado(s), ${failCount} falha(s)`);
      if (failCount > 0) {
        console.log("Falhas na importação:", result.failed);
        toast.error(`Falhas: ${result.failed.map((f: any) => `${f.email}: ${f.error}`).join(", ")}`);
      }
      setBulkJson(""); setShowBulk(false);
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (e: any) {
      if (e instanceof SyntaxError) toast.error("JSON inválido");
      else toast.error(e.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ─── TOGGLE PREMIUM ───
  const togglePremium = async (userId: string, currentPremium: boolean) => {
    const newPremium = !currentPremium;
    const newStatus = newPremium ? "active" : "overdue";
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: newPremium, subscription_status: newStatus } as any)
      .eq("user_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success(newPremium ? "Acesso liberado!" : "Acesso travado!");
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    }
  };

  // ─── TOGGLE ADMIN ───
  const handleToggleAdmin = async (userId: string, email: string) => {
    try {
      const result = await callEdgeFn({ action: "toggle_admin", user_id: userId });
      toast.success(result.is_admin ? `${email} agora é admin` : `${email} não é mais admin`);
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // ─── DELETE ───
  const handleDelete = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      await callEdgeFn({ action: "delete_user", user_id: deleteUserId });
      toast.success(`Usuário ${deleteUserEmail} excluído`);
      setDeleteUserId(null);
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  // ─── RESET DEVICE ───
  const handleResetDevice = async (userId: string, email: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ device_id: null, device_changed_at: null } as any)
      .eq("user_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Dispositivo de ${email} resetado!`);
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    }
  };

  // ─── EDIT MODAL ───
  const openEdit = (p: any) => {
    setEditUser(p);
    setEditName(p.display_name || "");
    setEditGender(p.gender || "");
    setEditReligion(p.religion || "");
    setEditCareDay(p.care_day !== null && p.care_day !== undefined ? String(p.care_day) : "");
    setEditSubStatus(p.subscription_status || "free");
    setEditExpires(p.subscription_expires_at ? p.subscription_expires_at.split("T")[0] : "");
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const updates: any = {
        display_name: editName || null,
        gender: editGender || null,
        religion: editReligion || null,
        care_day: editCareDay !== "" ? Number(editCareDay) : null,
        subscription_status: editSubStatus,
        subscription_expires_at: editExpires || null,
        is_premium: editSubStatus === "active",
      };
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", editUser.user_id);
      if (error) throw error;
      toast.success("Perfil atualizado!");
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão completa de usuários</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCreate(!showCreate); setShowBulk(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" /> Adicionar
          </button>
          <button
            onClick={() => { setShowBulk(!showBulk); setShowCreate(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
          >
            <Upload className="h-4 w-4" /> Importar em Massa
          </button>
        </div>
      </div>

      {/* ─── CREATE FORM ─── */}
      <Collapsible open={showCreate} onOpenChange={setShowCreate}>
        <CollapsibleContent>
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Novo Usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Email *" value={createEmail} onChange={e => setCreateEmail(e.target.value)} />
              <Input placeholder="Senha * (mín. 6)" type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} />
              <Input placeholder="Nome de exibição" value={createName} onChange={e => setCreateName(e.target.value)} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={createPremium} onCheckedChange={(v) => setCreatePremium(!!v)} /> Premium
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={createAdmin} onCheckedChange={(v) => setCreateAdmin(!!v)} /> Admin
              </label>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar Usuário"}
            </button>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* ─── BULK IMPORT ─── */}
      <Collapsible open={showBulk} onOpenChange={setShowBulk}>
        <CollapsibleContent>
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Importar Usuários em Massa</h3>
            <p className="text-xs text-muted-foreground">
              Cole um array JSON. Campos: email, password, display_name, is_premium, is_admin
            </p>
            <Textarea
              value={bulkJson}
              onChange={e => setBulkJson(e.target.value)}
              placeholder={`[\n  { "email": "aluno@email.com", "password": "Senha123", "display_name": "Maria", "is_premium": true }\n]`}
              className="min-h-[160px] font-mono text-sm"
            />
            <button
              onClick={handleBulk}
              disabled={!bulkJson.trim() || bulkLoading}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
            >
              {bulkLoading ? "Importando..." : "Importar"}
            </button>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* ─── FILTERS ─── */}
      <div className="flex flex-wrap gap-2 items-center">
        {SUB_STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === key
                ? "bg-secondary text-secondary-foreground"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm border border-border bg-background text-foreground">
          <option value="">Gênero: Todos</option>
          {Object.entries(GENDER_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
        </select>
        <select value={religionFilter} onChange={e => setReligionFilter(e.target.value)} className="px-3 py-2 rounded-lg text-sm border border-border bg-background text-foreground">
          <option value="">Religião: Todas</option>
          {Object.entries(RELIGION_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
        </select>
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} usuário(s)</span>
      </div>

      {/* ─── TABLE ─── */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assinatura</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Gênero</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Dia de Cuidado</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell></TableRow>
            ) : (
              filtered.map((p) => {
                const sub = p.subscription_status || "free";
                const cfg = SUB_STATUS_CONFIG[sub] || SUB_STATUS_CONFIG.free;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>
                      <Badge variant={sub === "free" ? "secondary" : "default"} className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.subscription_expires_at ? format(new Date(p.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </TableCell>
                    <TableCell>{GENDER_LABELS[p.gender || ""] || "—"}</TableCell>
                    <TableCell>{calcAge(p.birth_date)}</TableCell>
                    <TableCell>{p.care_day !== null && p.care_day !== undefined ? WEEKDAYS[p.care_day] : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePremium(p.user_id, p.is_premium)}>
                            {p.is_premium ? <><Lock className="h-4 w-4 mr-2" /> Travar premium</> : <><Unlock className="h-4 w-4 mr-2" /> Liberar premium</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleAdmin(p.user_id, p.email)}>
                            <Shield className="h-4 w-4 mr-2" /> Toggle Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetDevice(p.user_id, p.email)}>
                            <Smartphone className="h-4 w-4 mr-2" /> Resetar Dispositivo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { setDeleteUserId(p.user_id); setDeleteUserEmail(p.email); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ─── EDIT DIALOG ─── */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil — {editUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Gênero</label>
                <select value={editGender} onChange={e => setEditGender(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="">—</option>
                  {Object.entries(GENDER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Religião</label>
                <select value={editReligion} onChange={e => setEditReligion(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="">—</option>
                  {Object.entries(RELIGION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Dia de Cuidado</label>
                <select value={editCareDay} onChange={e => setEditCareDay(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="">—</option>
                  {WEEKDAYS.map((d, i) => <option key={i} value={String(i)}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <select value={editSubStatus} onChange={e => setEditSubStatus(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="free">Gratuito</option>
                  <option value="active">Ativo</option>
                  <option value="overdue">Inadimplente</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Expira em</label>
              <Input type="date" value={editExpires} onChange={e => setEditExpires(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setEditUser(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancelar</button>
            <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRM ─── */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai remover permanentemente <strong>{deleteUserEmail}</strong> do sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
