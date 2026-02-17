import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAdminProfiles } from "@/hooks/useAdminData";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const STATUS_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "premium", label: "Premium" },
  { key: "free", label: "Gratuito" },
] as const;

type FilterKey = (typeof STATUS_FILTERS)[number]["key"];

const AdminUsers = () => {
  const { data: profiles, isLoading } = useAdminProfiles();
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");
  const [genderFilter, setGenderFilter] = useState("");
  const [religionFilter, setReligionFilter] = useState("");

  const filtered = (profiles ?? []).filter((p) => {
    if (statusFilter === "premium" && !p.is_premium) return false;
    if (statusFilter === "free" && p.is_premium) return false;
    if (genderFilter && (p.gender || "") !== genderFilter) return false;
    if (religionFilter && (p.religion || "") !== religionFilter) return false;
    return true;
  });

  const calcAge = (birthDate: string | null) => {
    if (!birthDate) return "—";
    return differenceInYears(new Date(), new Date(birthDate));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de assinantes e usuários do aplicativo</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {STATUS_FILTERS.map(({ key, label }) => (
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

        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-border bg-background text-foreground"
        >
          <option value="">Gênero: Todos</option>
          {Object.entries(GENDER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={religionFilter}
          onChange={e => setReligionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border border-border bg-background text-foreground"
        >
          <option value="">Religião: Todas</option>
          {Object.entries(RELIGION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} usuário(s)
        </span>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gênero</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Religião</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dia de Cuidado</TableHead>
              <TableHead>Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{GENDER_LABELS[p.gender || ""] || "—"}</TableCell>
                  <TableCell>{calcAge(p.birth_date)}</TableCell>
                  <TableCell>{RELIGION_LABELS[p.religion || ""] || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_premium ? "default" : "secondary"} className={p.is_premium ? "bg-green-600 hover:bg-green-700" : ""}>
                      {p.is_premium ? "Premium" : "Gratuito"}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.care_day !== null && p.care_day !== undefined ? WEEKDAYS[p.care_day] : "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminUsers;
