import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAdminProfiles } from "@/hooks/useAdminData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const WEEKDAYS = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "premium", label: "Premium" },
  { key: "free", label: "Gratuito" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const AdminUsers = () => {
  const { data: profiles, isLoading } = useAdminProfiles();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = (profiles ?? []).filter((p) => {
    if (filter === "premium") return p.is_premium;
    if (filter === "free") return !p.is_premium;
    return true;
  });

  // Mock payment status based on is_premium for now
  const getPaymentStatus = (isPremium: boolean) => {
    if (!isPremium) return { label: "N/A", variant: "outline" as const };
    // Mock: 80% em dia, 20% inadimplente
    return Math.random() > 0.2
      ? { label: "Em dia", variant: "default" as const }
      : { label: "Inadimplente", variant: "destructive" as const };
  };

  // Cache the mock statuses so they don't re-randomize on re-render
  const [paymentStatuses] = useState<Record<string, { label: string; variant: "default" | "destructive" | "outline" }>>({});
  const getStablePaymentStatus = (id: string, isPremium: boolean) => {
    if (!paymentStatuses[id]) {
      paymentStatuses[id] = getPaymentStatus(isPremium);
    }
    return paymentStatuses[id];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de assinantes e usuários do aplicativo</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? "bg-secondary text-secondary-foreground"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">
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
              <TableHead>Religião</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Dia de Cuidado</TableHead>
              <TableHead>Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const payment = getStablePaymentStatus(p.id, p.is_premium);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.religion || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_premium ? "default" : "secondary"} className={p.is_premium ? "bg-green-600 hover:bg-green-700" : ""}>
                        {p.is_premium ? "Premium" : "Gratuito"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.variant}>{payment.label}</Badge>
                    </TableCell>
                    <TableCell>{p.care_day ? WEEKDAYS[p.care_day] : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(p.created_at), "dd/MM/yyyy", { locale: ptBR })}
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
