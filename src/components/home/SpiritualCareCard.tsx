import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOracleFlows } from "@/hooks/useOracleFlows";
import { Link } from "react-router-dom";
import { CalendarHeart, AlertTriangle, Sparkles, CheckCircle, Clock } from "lucide-react";
import { startOfWeek, endOfWeek, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const SpiritualCareCard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

  // Fetch this week's journey entries
  const { data: weekEntries } = useQuery({
    queryKey: ["week_journey", user?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_journey")
        .select("id, created_at, oracle_result, flow_name")
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch last activity ever (for users without care day)
  const { data: lastActivity } = useQuery({
    queryKey: ["last_activity", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_journey")
        .select("id, created_at, oracle_result")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch oracle flows for completion_phrase
  const { data: oracleFlows } = useOracleFlows();

  if (!user || !profile) return null;

  const today = new Date();
  const todayDay = today.getDay();
  const hasCareDay = profile.care_day !== null && profile.care_day !== undefined;

  // Weekly active days
  const activeDays = new Set(weekEntries?.map(e => new Date(e.created_at).getDay()) ?? []);
  const activeDaysCount = activeDays.size;

  // Days since last activity (any)
  const lastDate = lastActivity ? new Date(lastActivity.created_at) : null;
  const daysSinceLast = lastDate ? differenceInDays(today, lastDate) : null;

  let variant: "gold" | "success" | "warn" | "alert" | "neutral" = "neutral";
  let icon: React.ReactNode;
  let message = "";
  let subMessage = "";
  let showConsultButton = false;

  if (hasCareDay) {
    // === CENÁRIO 1: TEM dia de cuidado ===
    const careDay = profile.care_day!;
    const isToday = todayDay === careDay;
    const hadActivityToday = weekEntries?.some(e => {
      const d = new Date(e.created_at);
      return d.getDay() === careDay;
    });

    let daysUntil = (careDay - todayDay + 7) % 7;
    if (daysUntil === 0 && !isToday) daysUntil = 7;

    if (isToday && hadActivityToday) {
      // Build smart completion message using flow_name + completion_phrase
      const todayEntry = weekEntries?.find(e => new Date(e.created_at).getDay() === careDay);
      const entryFlowName = (todayEntry as any)?.flow_name as string | undefined;
      const matchedFlow = entryFlowName && oracleFlows?.find(f => f.name === entryFlowName);
      const completionPhrase = matchedFlow?.completion_phrase || (entryFlowName ? entryFlowName : "o seu cuidado espiritual");
      
      variant = "success";
      icon = <CheckCircle className="h-6 w-6 text-emerald-500" />;
      message = `Você fez ${completionPhrase} hoje. Àṣẹ́! ✨`;
      subMessage = "Continue assim, seu Ori agradece.";
    } else if (isToday) {
      variant = "gold";
      icon = <Sparkles className="h-6 w-6 text-accent" />;
      message = "Hoje é seu dia de cuidado! 🌟";
      subMessage = "Cuide do seu Ori — consulte o Oráculo.";
      showConsultButton = true;
    } else {
      variant = "neutral";
      icon = <CalendarHeart className="h-6 w-6 text-primary" />;
      message = `Próximo cuidado: ${DAY_NAMES[careDay]}`;
      subMessage = daysUntil === 1 ? "Amanhã! 🙏" : `Faltam ${daysUntil} dias`;
    }
  } else {
    // === CENÁRIO 2: NÃO tem dia de cuidado ===
    if (daysSinceLast === null) {
      // Never used oracle
      variant = "neutral";
      icon = <Sparkles className="h-6 w-6 text-primary" />;
      message = "Comece sua jornada espiritual";
      subMessage = "Consulte o Oráculo pela primeira vez!";
      showConsultButton = true;
    } else if (daysSinceLast === 0) {
      variant = "success";
      icon = <Sparkles className="h-6 w-6 text-emerald-500" />;
      message = "Você está em dia! ✨";
      subMessage = "Última consulta: hoje";
    } else if (daysSinceLast <= 2) {
      variant = "success";
      icon = <Sparkles className="h-6 w-6 text-emerald-500" />;
      message = "Você está em dia! ✨";
      subMessage = daysSinceLast === 1 ? "Última consulta: ontem" : `Última consulta: há ${daysSinceLast} dias`;
    } else if (daysSinceLast <= 6) {
      variant = "warn";
      icon = <Clock className="h-6 w-6 text-yellow-500" />;
      message = `Você está há ${daysSinceLast} dias sem cuidar da sua espiritualidade`;
      subMessage = "Que tal consultar o Oráculo?";
      showConsultButton = true;
    } else {
      variant = "alert";
      icon = <AlertTriangle className="h-6 w-6 text-orange-500" />;
      message = `Seu Ori sente sua falta… (${daysSinceLast} dias)`;
      subMessage = "Volte a cuidar da sua espiritualidade.";
      showConsultButton = true;
    }
  }

  const bgClass =
    variant === "gold" ? "bg-gradient-to-r from-accent/20 to-accent/5 border-accent/30" :
    variant === "success" ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" :
    variant === "warn" ? "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/20" :
    variant === "alert" ? "bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20" :
    "bg-card border-border/50";

  return (
    <div className={`rounded-2xl p-5 shadow-card border ${bgClass}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-sm">{message}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subMessage}</p>
        </div>
        {showConsultButton && (
          <Link to="/oraculo" className="shrink-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
            Consultar
          </Link>
        )}
      </div>

      {/* Weekly progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Atividade semanal</span>
          <span>{activeDaysCount}/7 dias</span>
        </div>
        <Progress value={(activeDaysCount / 7) * 100} className="h-2" />
      </div>
    </div>
  );
};

export default SpiritualCareCard;
