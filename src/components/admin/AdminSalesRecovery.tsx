import { useState, useMemo } from "react";
import { useRecoveryLeads } from "@/hooks/useRecoveryLeads";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminSalesRecovery = () => {
  const [promotionFilter, setPromotionFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("30");

  const periodDays = periodFilter === "all" ? null : parseInt(periodFilter);
  const { data: leads, isLoading } = useRecoveryLeads(promotionFilter, periodDays);

  const { data: promotions } = useQuery({
    queryKey: ["promotions-list"],
    queryFn: async () => {
      const { data } = await supabase.from("promotions").select("id, title").order("title");
      return data || [];
    },
  });

  const stats = useMemo(() => {
    if (!leads) return { total: 0, notConverted: 0, converted: 0, rate: 0 };
    const notConverted = leads.filter((l) => !l.converted).length;
    const converted = leads.filter((l) => l.converted).length;
    const total = leads.length;
    return { total, notConverted, converted, rate: total > 0 ? Math.round((converted / total) * 100) : 0 };
  }, [leads]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Recuperação de Vendas</h1>
        <p className="text-sm text-muted-foreground mt-1">Leads que clicaram em promoções mas não converteram</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Não Convertidos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-destructive">{stats.notConverted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Convertidos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-primary">{stats.converted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{stats.rate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={promotionFilter} onValueChange={setPromotionFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Todas as promoções" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as promoções</SelectItem>
            {promotions?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : leads && leads.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Promoção</TableHead>
                <TableHead>Último Clique</TableHead>
                <TableHead className="text-center">Cliques</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.filter((l) => !l.converted).map((lead, i) => (
                <TableRow key={`${lead.user_id}-${lead.promotion_id}-${i}`}>
                  <TableCell className="font-medium">{lead.display_name || "Sem nome"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{lead.email || "—"}</TableCell>
                  <TableCell>{lead.promotion_title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(lead.last_clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={lead.total_clicks >= 3 ? "destructive" : "secondary"}>
                      {lead.total_clicks}x
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-destructive border-destructive/30">
                      Não converteu
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <p className="text-center text-muted-foreground py-12">Nenhum lead encontrado no período.</p>
      )}
    </div>
  );
};

export default AdminSalesRecovery;
