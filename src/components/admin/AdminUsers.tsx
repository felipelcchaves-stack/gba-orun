import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAdminProfiles } from "@/hooks/useAdminData";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Unlock } from "lucide-react";

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

  const togglePremium = async (userId: string, currentPremium: boolean, currentStatus: string | null) => {
    const newPremium = !currentPremium;
    const newStatus = newPremium ? "active" : "overdue";
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: newPremium, subscription_status: newStatus } as any)
      .eq("user_id", userId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(newPremium ? "Acesso liberado!" : "Acesso travado!");
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de assinantes e usuários do aplicativo</p>
      </div>

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
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const sub = p.subscription_status || "free";
                const cfg = SUB_STATUS_CONFIG[sub] || SUB_STATUS_CONFIG.free;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>
                      <Badge variant={sub === "free" ? "secondary" : "default"} className={cfg.className}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.subscription_expires_at
                        ? format(new Date(p.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell>{GENDER_LABELS[p.gender || ""] || "—"}</TableCell>
                    <TableCell>{calcAge(p.birth_date)}</TableCell>
                    <TableCell>{p.care_day !== null && p.care_day !== undefined ? WEEKDAYS[p.care_day] : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePremium(p.user_id, p.is_premium, p.subscription_status)}
                        title={p.is_premium ? "Travar acesso" : "Liberar acesso"}
                        className={`p-2 rounded-lg transition-colors ${p.is_premium ? "hover:bg-destructive/10 text-destructive" : "hover:bg-green-100 text-green-700"}`}
                      >
                        {p.is_premium ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminUsers;
