import { Users, Crown, UserX, Compass, CalendarDays, BookOpen, MessageCircle, MessageSquare, UserCheck, AlertTriangle, DollarSign, MousePointerClick, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStats, useAdminProfiles, useAdminKnowledgeStats } from "@/hooks/useAdminData";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState } from "react";

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
  const { data: plans } = useSubscriptionPlans();
  const { data: knowledgeStats } = useAdminKnowledgeStats();
  const [knowledgeFilter, setKnowledgeFilter] = useState<string>("all");

  // Revenue forecast: active subscribers × their plan price
  const revenueForecast = (() => {
    if (!profiles || !plans) return 0;
    let total = 0;
    const planMap = new Map(plans.map(p => [p.id, p]));
    for (const p of profiles) {
      if (p.subscription_status === "active" && p.subscription_plan_id) {
        const plan = planMap.get(p.subscription_plan_id);
        if (plan) total += Number(plan.price);
      }
    }
    // If active subscribers exist but no plan linked, estimate with cheapest plan
    const activeWithoutPlan = (profiles || []).filter(p => p.subscription_status === "active" && !p.subscription_plan_id).length;
    if (activeWithoutPlan > 0 && plans.length > 0) {
      const cheapest = Math.min(...plans.filter(p => p.is_active).map(p => Number(p.price)));
      total += activeWithoutPlan * cheapest;
    }
    return total;
  })();

  const KPI_CARDS = [
    { label: "Total de Usuários", value: stats?.total_users ?? 0, icon: Users, color: "text-primary" },
    { label: "Assinantes Ativos", value: stats?.active_subscribers ?? 0, icon: UserCheck, color: "text-green-600" },
    { label: "Inadimplentes", value: stats?.overdue_users ?? 0, icon: AlertTriangle, color: "text-destructive" },
    { label: "Previsão Receita/Mês", value: `R$ ${revenueForecast.toFixed(2)}`, icon: DollarSign, color: "text-accent" },
    { label: "Premium (Pagantes)", value: stats?.premium_users ?? 0, icon: Crown, color: "text-accent" },
    { label: "Gratuitos", value: stats?.free_users ?? 0, icon: UserX, color: "text-muted-foreground" },
    { label: "Consultas Hoje", value: stats?.consultations_today ?? 0, icon: CalendarDays, color: "text-primary" },
    { label: "Rituais Cadastrados", value: stats?.total_rituals ?? 0, icon: BookOpen, color: "text-primary" },
    { label: "Cliques Promoções", value: stats?.total_promo_clicks ?? 0, icon: MousePointerClick, color: "text-accent" },
    { label: "Cliques Hoje", value: stats?.promo_clicks_today ?? 0, icon: MousePointerClick, color: "text-primary" },
  ];

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

  const knowledgeBarData = (() => {
    if (!knowledgeStats || !knowledgeStats.total_onboarded) return [];
    const t = knowledgeStats.total_onboarded;
    return [
      { name: "Obi", pct: Math.round((knowledgeStats.not_knows_obi / t) * 100) },
      { name: "Ebó", pct: Math.round((knowledgeStats.not_knows_ebo / t) * 100) },
      { name: "Ori", pct: Math.round((knowledgeStats.not_knows_ori / t) * 100) },
      { name: "Iyami", pct: Math.round((knowledgeStats.not_knows_iyami / t) * 100) },
      { name: "Egbe", pct: Math.round((knowledgeStats.not_knows_egbe_orun / t) * 100) },
      { name: "Sem Ifá", pct: Math.round((knowledgeStats.total_sem_ifa / t) * 100) },
    ].sort((a, b) => b.pct - a.pct);
  })();

  const ifaPieData = (() => {
    if (!knowledgeStats) return [];
    return [
      { name: "Babalawo", value: knowledgeStats.total_babalawo },
      { name: "Iyanifa", value: knowledgeStats.total_iyanifa },
      { name: "Omo Ifá", value: knowledgeStats.total_omo_ifa },
      { name: "Sem Ifá", value: knowledgeStats.total_sem_ifa },
    ].filter(d => d.value > 0);
  })();

  const filteredProfiles = (() => {
    if (!profiles) return [];
    let list = [...profiles];
    if (knowledgeFilter === "not_obi") list = list.filter(p => p.knows_obi === false);
    else if (knowledgeFilter === "not_ebo") list = list.filter(p => p.knows_ebo === false);
    else if (knowledgeFilter === "not_ori") list = list.filter(p => p.knows_ori === false);
    else if (knowledgeFilter === "not_iyami") list = list.filter(p => p.knows_iyami === false);
    else if (knowledgeFilter === "not_egbe") list = list.filter(p => p.knows_egbe_orun === false);
    else if (knowledgeFilter === "not_ifa") list = list.filter(p => !p.ifa_status || p.ifa_status === "nao");
    return list;
  })();

  const recentProfiles = filteredProfiles.slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do aplicativo</p>
      </div>

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

      {ifaPieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-sm mb-3">Distribuição por Status em Ifá</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={ifaPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {ifaPieData.map((_, i) => (
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

      {knowledgeBarData.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-sm">Lacunas de Conhecimento</h3>
              <span className="text-xs text-muted-foreground ml-auto">{knowledgeStats?.total_onboarded ?? 0} alunos mapeados</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={knowledgeBarData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={50} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" fill="hsl(0, 84%, 60%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-foreground">Últimos Usuários</h2>
          <Select value={knowledgeFilter} onValueChange={setKnowledgeFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por lacuna" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="not_obi">Não sabe Obi</SelectItem>
              <SelectItem value="not_ebo">Não sabe Ebó</SelectItem>
              <SelectItem value="not_ori">Não sabe Ori</SelectItem>
              <SelectItem value="not_iyami">Não sabe Iyami</SelectItem>
              <SelectItem value="not_egbe">Não sabe Egbe</SelectItem>
              <SelectItem value="not_ifa">Não tem Ifá</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Conhecimento</TableHead>
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
                recentProfiles.map((p) => {
                  const subStatus = p.subscription_status || "free";
                  const statusConfig: Record<string, { label: string; className: string }> = {
                    active: { label: "Ativo", className: "bg-green-600 hover:bg-green-700" },
                    overdue: { label: "Inadimplente", className: "bg-destructive hover:bg-destructive/90" },
                    cancelled: { label: "Cancelado", className: "bg-yellow-600 hover:bg-yellow-700" },
                    free: { label: "Gratuito", className: "" },
                  };
                  const cfg = statusConfig[subStatus] || statusConfig.free;
                  const knowledgeBadges = [
                    { key: "Obi", val: p.knows_obi },
                    { key: "Ebó", val: p.knows_ebo },
                    { key: "Ori", val: p.knows_ori },
                    { key: "Iyami", val: p.knows_iyami },
                    { key: "Egbe", val: p.knows_egbe_orun },
                  ];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>
                        <Badge variant={subStatus === "free" ? "secondary" : "default"} className={cfg.className}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.onboarding_completed ? (
                            <>
                              {knowledgeBadges.map(kb => (
                                <Badge key={kb.key} variant="outline" className={`text-[10px] px-1.5 py-0 ${kb.val ? "border-green-500 text-green-600" : "border-destructive text-destructive"}`}>{kb.key}</Badge>
                              ))}
                              {(() => {
                                const ifaCfg: Record<string, { label: string; cls: string }> = {
                                  babalawo: { label: "Babalawo", cls: "bg-blue-100 text-blue-800 border-blue-300" },
                                  iyanifa: { label: "Iyanifa", cls: "bg-purple-100 text-purple-800 border-purple-300" },
                                  omo_ifa: { label: "Omo Ifá", cls: "bg-green-100 text-green-800 border-green-300" },
                                  nao: { label: "Sem Ifá", cls: "bg-muted text-muted-foreground border-border" },
                                };
                                const c = ifaCfg[p.ifa_status || ""] || ifaCfg.nao;
                                return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${c.cls}`}>{c.label}</Badge>;
                              })()}
                            </>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
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
    </div>
  );
};

export default AdminDashboard;
