import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Compass, CalendarHeart, AlertTriangle, Sparkles } from "lucide-react";
import { startOfWeek, endOfWeek, differenceInDays, format } from "date-fns";
import { pt } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const SpiritualCareCard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  // Fetch this week's journey entries
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });

  const { data: weekEntries } = useQuery({
    queryKey: ["week_journey", user?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("user_journey")
        .select("id, created_at, oracle_result")
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user || !profile || profile.care_day === null || profile.care_day === undefined) {
    return (
      <Link to="/perfil" className="block">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-dashed border-border">
          <div className="flex items-center gap-3">
            <CalendarHeart className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <h3 className="font-display font-bold text-sm">Defina seu dia de cuidado</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configure no perfil para receber lembretes personalizados.</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun
  const careDay = profile.care_day;
  const isToday = todayDay === careDay;

  // Calculate days until care day
  let daysUntil = (careDay - todayDay + 7) % 7;
  if (daysUntil === 0 && !isToday) daysUntil = 7;

  // Check if care day already passed this week without activity
  const careDayPassed = todayDay > careDay;
  const hadActivityOnCareDay = weekEntries?.some(e => {
    const d = new Date(e.created_at);
    return d.getDay() === careDay;
  });

  // Weekly active days
  const activeDays = new Set(weekEntries?.map(e => new Date(e.created_at).getDay()) ?? []);
  const activeDaysCount = activeDays.size;

  // Last consultation
  const lastEntry = weekEntries?.[0];
  const lastDate = lastEntry ? new Date(lastEntry.created_at) : null;
  const daysSinceLast = lastDate ? differenceInDays(today, lastDate) : null;

  // Determine card state
  let variant: "gold" | "alert" | "neutral" = "neutral";
  let message = "";
  let subMessage = "";

  if (isToday) {
    variant = "gold";
    message = "Hoje é seu dia de cuidado! 🌟";
    subMessage = hadActivityOnCareDay ? "Você já consultou o Oráculo hoje. Axé!" : "Já consultou o Oráculo?";
  } else if (careDayPassed && !hadActivityOnCareDay) {
    variant = "alert";
    message = `Você perdeu seu cuidado de ${DAY_NAMES[careDay]}`;
    subMessage = "Que tal consultar o Oráculo agora?";
  } else {
    variant = "neutral";
    message = `Próximo cuidado: ${DAY_NAMES[careDay]}`;
    subMessage = daysUntil === 1 ? "Amanhã!" : `Faltam ${daysUntil} dias`;
  }

  const bgClass = variant === "gold"
    ? "bg-gradient-to-r from-accent/20 to-accent/5 border-accent/30"
    : variant === "alert"
    ? "bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20"
    : "bg-card border-border/50";

  const iconClass = variant === "gold" ? "text-accent" : variant === "alert" ? "text-destructive" : "text-primary";

  return (
    <div className={`rounded-2xl p-5 shadow-card border ${bgClass}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-0.5">
          {variant === "gold" ? <Sparkles className={`h-6 w-6 ${iconClass}`} /> :
           variant === "alert" ? <AlertTriangle className={`h-6 w-6 ${iconClass}`} /> :
           <CalendarHeart className={`h-6 w-6 ${iconClass}`} />}
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-sm">{message}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subMessage}</p>
        </div>
        {(isToday && !hadActivityOnCareDay) || (careDayPassed && !hadActivityOnCareDay) ? (
          <Link to="/oraculo" className="shrink-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
            Consultar
          </Link>
        ) : null}
      </div>

      {/* Weekly progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Atividade semanal</span>
          <span>{activeDaysCount}/7 dias</span>
        </div>
        <Progress value={(activeDaysCount / 7) * 100} className="h-2" />
      </div>

      {/* Last consultation */}
      {daysSinceLast !== null && (
        <p className="text-xs text-muted-foreground mt-3">
          Última consulta: {daysSinceLast === 0 ? "hoje" : daysSinceLast === 1 ? "ontem" : `há ${daysSinceLast} dias`}
          {lastEntry && ` — ${lastEntry.oracle_result}`}
        </p>
      )}
    </div>
  );
};

export default SpiritualCareCard;
