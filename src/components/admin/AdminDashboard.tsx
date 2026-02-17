import { Users, Crown, UserX, Compass, CalendarDays, BookOpen, MessageCircle, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdminStats, useAdminProfiles } from "@/hooks/useAdminData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const GENDER_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não-binário",
  prefiro_nao_dizer: "Não informado",
};

const RELIGION_LABELS: Record<string, string> = {
  candomble: "Candomblé",
  umbanda: "Umbanda",
  ifa: "Ifá",
  outra: "Outra",
  prefiro_nao_dizer: "Não informado",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--muted-foreground))",
  "hsl(25, 80%, 55%)",
  "hsl(280, 60%, 50%)",
];

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
    { label: "Posts Comunidade", value: stats?.total_posts ?? 0, icon: MessageCircle, color: "text-accent" },
    { label: "Respostas", value: stats?.total_replies ?? 0, icon: MessageSquare, color: "text-muted-foreground" },
  ];

  // Compute demographic data from profiles
  const genderData = (() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    for (const p of profiles) {
      const key = p.gender || "nao_informado";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: GENDER_LABELS[key] || key,
      value,
    }));
  })();

  const religionData = (() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    for (const p of profiles) {
      const key = p.religion || "nao_informado";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: RELIGION_LABELS[key] || key,
      value,
    }));
  })();

  const recentProfiles = profiles?.slice(0, 10) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do aplicativo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Demographics Charts */}
      {profiles && profiles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-sm mb-3">Distribuição por Gênero</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-sm mb-3">Distribuição por Religião</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={religionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {religionData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Users */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">Últimos Usuários Cadastrados</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Religião</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profilesLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Carregando...</TableCell>
                </TableRow>
              ) : recentProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              ) : (
                recentProfiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{GENDER_LABELS[p.gender || ""] || "—"}</TableCell>
                    <TableCell>{RELIGION_LABELS[p.religion || ""] || "—"}</TableCell>
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
