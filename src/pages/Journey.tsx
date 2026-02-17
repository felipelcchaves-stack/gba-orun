import { useJourneyByMonth, useCompleteJourney, useCompleteTask } from "@/hooks/useJourney";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Compass, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import MonthlyStats from "@/components/journey/MonthlyStats";
import JourneyEntryCard from "@/components/journey/JourneyEntryCard";

import dailyRoutine from "@/assets/daily-routine.jpg";

const JourneyPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { entries, tasks, isLoading } = useJourneyByMonth(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );

  const completeJourney = useCompleteJourney();
  const completeTask = useCompleteTask();

  // Map: day number -> { entries, allTasksDone }
  const dayMap = useMemo(() => {
    const map = new Map<string, { entries: any[]; tasksDone: number; tasksTotal: number }>();
    for (const e of entries) {
      const key = format(new Date(e.created_at), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, { entries: [], tasksDone: 0, tasksTotal: 0 });
      map.get(key)!.entries.push(e);
    }
    for (const t of tasks) {
      const key = format(new Date((t as any).created_at), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, { entries: [], tasksDone: 0, tasksTotal: 0 });
      const d = map.get(key)!;
      d.tasksTotal++;
      if ((t as any).completed) d.tasksDone++;
    }
    return map;
  }, [entries, tasks]);

  const dayEntries = entries.filter((e: any) => isSameDay(new Date(e.created_at), selectedDate));

  // Monthly stats
  const totalConsultations = entries.length;
  const totalTasksDone = tasks.filter((t: any) => t.completed).length;
  const activeDays = dayMap.size;

  // Modifiers for calendar dots
  const daysWithActivity = useMemo(() => {
    const result: { complete: Date[]; partial: Date[]; none: Date[] } = { complete: [], partial: [], none: [] };
    dayMap.forEach((val, key) => {
      const d = new Date(key + "T12:00:00");
      if (val.tasksTotal === 0 && val.entries.length > 0) {
        result.none.push(d);
      } else if (val.tasksDone === val.tasksTotal && val.tasksTotal > 0) {
        result.complete.push(d);
      } else if (val.tasksDone > 0) {
        result.partial.push(d);
      } else if (val.tasksTotal > 0) {
        result.none.push(d);
      }
    });
    return result;
  }, [dayMap]);

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Plano de Vida</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Sua rotina espiritual</p>
          </div>
          <Link to="/oraculo" className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 shadow-card hover:shadow-soft transition-all">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
          </Link>
        </div>

        <MonthlyStats totalConsultations={totalConsultations} totalTasksDone={totalTasksDone} activeDays={activeDays} />

        {/* Calendar */}
        <div className="bg-card rounded-2xl shadow-card mb-6 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            locale={ptBR}
            className="p-3 pointer-events-auto"
            modifiers={{
              activity_complete: daysWithActivity.complete,
              activity_partial: daysWithActivity.partial,
              activity_none: daysWithActivity.none,
            }}
            modifiersStyles={{
              activity_complete: {
                position: "relative",
              },
              activity_partial: {
                position: "relative",
              },
              activity_none: {
                position: "relative",
              },
            }}
            components={{
              DayContent: ({ date }) => {
                const key = format(date, "yyyy-MM-dd");
                const info = dayMap.get(key);
                let dotColor: string | null = null;
                if (info) {
                  if (info.tasksTotal > 0 && info.tasksDone === info.tasksTotal) {
                    dotColor = "hsl(var(--leaf))";
                  } else if (info.tasksDone > 0) {
                    dotColor = "hsl(var(--accent))";
                  } else {
                    dotColor = "hsl(var(--destructive))";
                  }
                }
                return (
                  <div className="flex flex-col items-center">
                    <span>{date.getDate()}</span>
                    {dotColor && (
                      <span
                        className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    )}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Selected day label */}
        <p className="text-xs text-muted-foreground mb-3 font-medium">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : dayEntries.length > 0 ? (
          <div className="space-y-6">
            {dayEntries.map((entry: any) => (
              <JourneyEntryCard
                key={entry.id}
                entry={entry}
                onComplete={() => !entry.completed && completeJourney.mutate(entry.id)}
                onCompleteTask={(taskId: string) => completeTask.mutate(taskId)}
              />
            ))}
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
