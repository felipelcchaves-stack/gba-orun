import { useJourney, useCompleteJourney } from "@/hooks/useJourney";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Compass, BookOpen, CheckCircle, Circle, Plus, Calendar, Sunrise, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import dailyRoutine from "@/assets/daily-routine.jpg";
import obiOracle from "@/assets/obi-oracle.jpg";

const JourneyPage = () => {
  const { user } = useAuth();
  const { data: entries, isLoading } = useJourney();
  const completeJourney = useCompleteJourney();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate week days
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter entries for selected date
  const dayEntries = entries?.filter((e: any) => {
    const entryDate = new Date(e.created_at);
    return isSameDay(entryDate, selectedDate);
  }) ?? [];

  const todayEntries = entries?.filter((e: any) => {
    return isSameDay(new Date(e.created_at), new Date());
  }) ?? [];

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6 gap-4 bg-background">
        <Compass className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-muted-foreground text-center text-sm">Faça login para acompanhar sua jornada espiritual.</p>
        <Link to="/auth" className="text-primary font-medium text-sm underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Plano de Vida</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Sua rotina espiritual</p>
          </div>
          <div className="flex gap-2">
            <Link to="/oraculo" className="p-2.5 rounded-xl bg-card shadow-card hover:shadow-soft transition-all">
              <Plus className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <div className="p-2.5 rounded-xl bg-card shadow-card">
              <Calendar className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Week day selector */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            const today = isToday(day);
            const dayLabel = format(day, "EEE", { locale: ptBR }).slice(0, 3);
            const dayNum = format(day, "d");

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`shrink-0 flex flex-col items-center py-2 px-3 rounded-xl transition-all min-w-[48px] ${
                  active
                    ? "bg-foreground text-background"
                    : today
                      ? "bg-card shadow-card text-foreground"
                      : "text-muted-foreground hover:bg-card"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{dayLabel}</span>
                <span className="text-lg font-bold mt-0.5">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : dayEntries.length > 0 ? (
          <div className="space-y-6">
            {/* Manhã */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sunrise className="h-4 w-4 text-accent" strokeWidth={1.5} />
                <h3 className="font-display font-bold text-sm">Manhã</h3>
              </div>
              <div className="space-y-2">
                {dayEntries.map((entry: any) => (
                  <div key={entry.id} className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3">
                    <img src={obiOracle} alt="Obi" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] bg-foreground text-background px-2 py-0.5 rounded-full font-medium">
                          {entry.oracle_result}
                        </span>
                      </div>
                      {entry.rituals ? (
                        <Link
                          to={`/rituais/${entry.suggested_ritual_id}`}
                          className="font-display font-bold text-sm hover:text-primary transition-colors truncate block"
                        >
                          {entry.rituals.title}
                        </Link>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sem ritual sugerido</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(entry.created_at), "HH:mm")}
                      </p>
                    </div>
                    <button
                      onClick={() => !entry.completed && completeJourney.mutate(entry.id)}
                      className="shrink-0"
                    >
                      {entry.completed ? (
                        <CheckCircle className="h-6 w-6 text-primary" strokeWidth={1.5} />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <img src={dailyRoutine} alt="Rotina" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover opacity-60" />
            <p className="text-muted-foreground text-sm mb-1 font-medium">Nenhuma consulta neste dia</p>
            <p className="text-muted-foreground text-xs mb-4">Consulte o Oráculo para começar sua rotina</p>
            <Link
              to="/oraculo"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-medium"
            >
              <Compass className="h-4 w-4" /> Consultar Obi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyPage;
