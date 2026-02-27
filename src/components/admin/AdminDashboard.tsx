import { Users, Crown, UserX, Compass, CalendarDays, BookOpen, MessageCircle, MessageSquare, UserCheck, AlertTriangle, DollarSign, MousePointerClick, GraduationCap, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminStats, useAdminProfiles, useAdminKnowledgeStats, useSubscriptionHistory } from "@/hooks/useAdminData";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { useState } from "react";

// --- Sub-components for charts ---

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--muted-foreground))",
  "hsl(25, 80%, 55%)",
  "hsl(280, 60%, 50%)",
];

const SUB_COLORS = {
  active: "#22c55e",
  courtesy: "#8b5cf6",
  overdue: "#ef4444",
  cancelled: "#eab308",
  revenue: "#FFD700",
  newUsers: "#3b82f6",
};

const formatLabel = (m: string, granularity: string) => {
  try {
    const d = new Date(m);
    if (granularity === 'daily') return format(d, "dd/MM", { locale: ptBR });
    if (granularity === 'yearly') return format(d, "yyyy", { locale: ptBR });
    return format(d, "MMM/yy", { locale: ptBR });
  } catch {
    return m;
  }
};

const SubscriberEvolutionChart = ({ data, granularity }: { data: any[]; granularity: string }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-sm">Evolução de Assinantes</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickFormatter={(m) => formatLabel(m, granularity)} fontSize={11} />
          <YAxis fontSize={11} allowDecimals={false} />
          <Tooltip labelFormatter={(m) => formatLabel(m, granularity)} />
          <Legend />
          <Line type="monotone" dataKey="active_subscribers" name="Ativos Pagantes" stroke={SUB_COLORS.active} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="courtesy_users" name="Cortesia" stroke={SUB_COLORS.courtesy} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="overdue_users" name="Inadimplentes" stroke={SUB_COLORS.overdue} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cancelled_users" name="Cancelados" stroke={SUB_COLORS.cancelled} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const RevenueChart = ({ data, granularity }: { data: any[]; granularity: string }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-accent" />
        <h3 className="font-display font-semibold text-sm">Previsão de Receita</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickFormatter={(m) => formatLabel(m, granularity)} fontSize={11} />
          <YAxis fontSize={11} tickFormatter={(v: number) => `R$${v}`} />
          <Tooltip labelFormatter={(m) => formatLabel(m, granularity)} formatter={(v: number) => [`R$ ${Number(v).toFixed(2)}`, "Receita"]} />
          <Area type="monotone" dataKey="revenue_estimate" name="Receita" stroke={SUB_COLORS.revenue} fill={SUB_COLORS.revenue} fillOpacity={0.25} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const UserGrowthChart = ({ data, granularity }: { data: any[]; granularity: string }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-sm">Crescimento de Usuários</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickFormatter={(m) => formatLabel(m, granularity)} fontSize={11} />
          <YAxis fontSize={11} allowDecimals={false} />
          <Tooltip labelFormatter={(m) => formatLabel(m, granularity)} />
          <Line type="monotone" dataKey="new_users" name="Novos Cadastros" stroke={SUB_COLORS.newUsers} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// --- Constants ---

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

// --- Main Component ---

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: plans } = useSubscriptionPlans();
  const { data: knowledgeStats } = useAdminKnowledgeStats();
  const [granularity, setGranularity] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const { data: historyData } = useSubscriptionHistory(granularity);
  const { data: monthlyHistory } = useSubscriptionHistory('monthly');
  const [knowledgeFilter, setKnowledgeFilter] = useState<string>("all");

  const PERIOD_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, yearly: 12 };

  // Revenue forecast (normalized to monthly)
  const monthlyRevenueForecast = (() => {
    if (!profiles || !plans) return 0;
    let total = 0;
    const planMap = new Map(plans.map(p => [p.id, p]));
    for (const p of profiles) {
      if (p.subscription_status === "active" && p.subscription_plan_id && !p.is_courtesy) {
        const plan = planMap.get(p.subscription_plan_id);
        if (plan) {
          const months = PERIOD_MONTHS[plan.billing_period] || 1;
          total += Number(plan.net_price ?? plan.price) / months;
        }
      }
    }
    const activeWithoutPlan = (profiles || []).filter(p => p.subscription_status === "active" && !p.subscription_plan_id && !p.is_courtesy).length;
    if (activeWithoutPlan > 0 && plans.length > 0) {
      const cheapest = Math.min(...plans.filter(p => p.is_active).map(p => Number(p.net_price ?? p.price)));
      total += activeWithoutPlan * cheapest;
    }
    return total;
  })();

  const yearlyRevenueForecast = monthlyRevenueForecast * 12;

  const totalRevenueForecast = monthlyRevenueForecast + yearlyRevenueForecast;

  // Revenue evolution: compare total forecast with previous month from history
  const revenueEvolution = (() => {
    if (totalRevenueForecast === 0) return null;
    const current = totalRevenueForecast;
    if (!monthlyHistory || monthlyHistory.length < 2) return { current, percentage: null };
    const prev = Number(monthlyHistory[monthlyHistory.length - 2]?.revenue_estimate ?? 0);
    if (prev === 0) return { current, percentage: null };
    const pct = ((current - prev) / prev) * 100;
    return { current, percentage: pct };
  })();

  const courtesyCount = profiles?.filter(p => p.is_courtesy).length ?? 0;

  const hasAnySubscriber = profiles?.some(p =>
    p.subscription_status === "active" ||
    p.subscription_status === "overdue" ||
    p.subscription_status === "cancelled"
  ) ?? false;

  const KPI_CARDS = [
    { label: "Total de Usuários", value: stats?.total_users ?? 0, icon: Users, color: "text-primary" },
    { label: "Assinantes Ativos", value: stats?.active_subscribers ?? 0, icon: UserCheck, color: "text-green-600" },
    ...(hasAnySubscriber ? [
      { label: "Inadimplentes", value: stats?.overdue_users ?? 0, icon: AlertTriangle, color: "text-destructive" },
      { label: "Receita Mensal Prevista", value: `R$ ${monthlyRevenueForecast.toFixed(2)}`, icon: DollarSign, color: "text-accent" },
      { label: "Receita Anual Prevista", value: `R$ ${yearlyRevenueForecast.toFixed(2)}`, icon: TrendingUp, color: "text-green-600" },
    ] : []),
    { label: "Premium Pagantes", value: (stats?.premium_users ?? 0) - courtesyCount, icon: Crown, color: "text-accent" },
    { label: "Cortesia", value: courtesyCount, icon: Gift, color: "text-purple-600" },
    { label: "Consultas Hoje", value: stats?.consultations_today ?? 0, icon: CalendarDays, color: "text-primary" },
    { label: "Rituais Cadastrados", value: stats?.total_rituals ?? 0, icon: BookOpen, color: "text-primary" },
    { label: "Cliques Promoções", value: stats?.total_promo_clicks ?? 0, icon: MousePointerClick, color: "text-accent" },
    { label: "Cliques Hoje", value: stats?.promo_clicks_today ?? 0, icon: MousePointerClick, color: "text-primary" },
  ];

  const genderData = (() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    for (const p of profiles) { const key = p.gender || "nao_informado"; counts[key] = (counts[key] || 0) + 1; }
    return Object.entries(counts).map(([key, value]) => ({ name: GENDER_LABELS[key] || key, value }));
  })();

  const religionData = (() => {
    if (!profiles) return [];
    const counts: Record<string, number> = {};
    for (const p of profiles) { const key = p.religion || "nao_informado"; counts[key] = (counts[key] || 0) + 1; }
    return Object.entries(counts).map(([key, value]) => ({ name: RELIGION_LABELS[key] || key, value }));
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

      {/* Revenue Evolution Card */}
      {hasAnySubscriber && revenueEvolution && (
        <TooltipProvider>
          <UiTooltip>
            <TooltipTrigger asChild>
              <Card className="border-accent/30 cursor-help">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">
                      R$ {revenueEvolution.current.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">Receita Este Mês</p>
                  </div>
                  {revenueEvolution.percentage !== null ? (
                    <Badge className={`text-sm px-3 py-1 ${revenueEvolution.percentage >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {revenueEvolution.percentage >= 0 ? "↑" : "↓"} {Math.abs(revenueEvolution.percentage).toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge className="bg-accent/20 text-accent-foreground text-sm px-3 py-1">Novo</Badge>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-sm space-y-1 p-3">
              <p>Mensal: R$ {monthlyRevenueForecast.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p>Anual (÷12): R$ {yearlyRevenueForecast.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </TooltipContent>
          </UiTooltip>
        </TooltipProvider>
      )}

      {/* Revenue Composition Pie */}
      {hasAnySubscriber && (monthlyRevenueForecast > 0 || yearlyRevenueForecast > 0) && (() => {
        const pieData = [
          { name: "Mensal", value: monthlyRevenueForecast },
          { name: "Anual (÷12)", value: yearlyRevenueForecast },
        ].filter(d => d.value > 0);
        const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))"];
        return (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Composição da Receita</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })()}

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

      {/* Evolution Charts */}
      {historyData && historyData.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Evolução</h2>
            <Select value={granularity} onValueChange={(v) => setGranularity(v as any)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SubscriberEvolutionChart data={historyData} granularity={granularity} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={historyData} granularity={granularity} />
            <UserGrowthChart data={historyData} granularity={granularity} />
          </div>
        </>
      )}

      {/* Demographic Charts */}
      {profiles && profiles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display font-semibold text-sm mb-3">Distribuição por Gênero</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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
                    {religionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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
                    {ifaPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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

      {/* Users Table */}
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
                <TableHead>Último Login</TableHead>
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
                      <TableCell className="text-muted-foreground text-sm">
                        {p.last_sign_in_at ? format(new Date(p.last_sign_in_at), "dd/MM/yyyy", { locale: ptBR }) : "Nunca"}
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
