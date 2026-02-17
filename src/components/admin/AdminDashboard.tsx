import { Users, Crown, UserX, Compass, CalendarDays, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdminStats, useAdminProfiles } from "@/hooks/useAdminData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();

  const KPI_CARDS = [
    { label: "Total de Usuários", value: stats?.total_users ?? 0, icon: Users, color: "text-primary" },
    { label: "Premium (Pagantes)", value: stats?.premium_users ?? 0, icon: Crown, color: "text-accent" },
    { label: "Gratuitos", value: stats?.free_users ?? 0, icon: UserX, color: "text-muted-foreground" },
    { label: "Consultas (Total)", value: stats?.total_consultations ?? 0, icon: Compass, color: "text-primary" },
    { label: "Consultas Hoje", value: stats?.consultations_today ?? 0, icon: CalendarDays, color: "text-accent" },
    { label: "Rituais Cadastrados", value: stats?.total_rituals ?? 0, icon: BookOpen, color: "text-primary" },
  ];

  const recentProfiles = profiles?.slice(0, 10) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do aplicativo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_CARDS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? "—" : value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">Últimos Usuários Cadastrados</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Religião</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profilesLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando...</TableCell>
                </TableRow>
              ) : recentProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              ) : (
                recentProfiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.religion || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_premium ? "default" : "secondary"} className={p.is_premium ? "bg-green-600 hover:bg-green-700" : ""}>
                        {p.is_premium ? "Premium" : "Gratuito"}
                      </Badge>
                    </TableCell>
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
    </div>
  );
};

export default AdminDashboard;
