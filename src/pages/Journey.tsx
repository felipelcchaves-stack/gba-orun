import { useJourneyByMonth, useCompleteJourney, useCompleteTask } from "@/hooks/useJourney";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { Link } from "react-router-dom";
import { Compass, Sparkles, ChevronDown, CalendarDays } from "lucide-react";
import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TodayHeroCard from "@/components/journey/TodayHeroCard";
import WeekStreak from "@/components/journey/WeekStreak";
import MonthlyStats from "@/components/journey/MonthlyStats";
import JourneyEntryCard from "@/components/journey/JourneyEntryCard";

const getGreeting = (name?: string | null) => {
  const h = new Date().getHours();
  const n = name || "";
  if (h < 12) return `Bom dia${n ? ", " + n : ""} ☀️`;
  if (h < 18) return `Boa tarde${n ? ", " + n : ""} 🌤️`;
  return `Boa noite${n ? ", " + n : ""} 🌙`;
};

const JourneyPage = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: stats } = useUserStats();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { entries, tasks, isLoading } = useJourneyByMonth(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );

  const completeJourney = useCompleteJourney();
  const completeTask = useCompleteTask();

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

  // Today's data
  const todayKey = format(today, "yyyy-MM-dd");
  const todayInfo = dayMap.get(todayKey);
  const todayEntries = entries.filter((e: any) => isSameDay(new Date(e.created_at), today));
  const todayTasksDone = todayInfo?.tasksDone ?? 0;
  const todayTasksTotal = todayInfo?.tasksTotal ?? 0;

  // Selected day entries (only when calendar is open and a non-today date is selected)
  const showingToday = isSameDay(selectedDate, today);
  const displayEntries = showingToday
    ? todayEntries
    : entries.filter((e: any) => isSameDay(new Date(e.created_at), selectedDate));

  // Monthly stats
  const totalConsultations = entries.length;
  const totalTasksDone = tasks.filter((t: any) => t.completed).length;
  const activeDays = dayMap.size;

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
            <h1 className="text-2xl font-display font-bold">Minha Jornada</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{getGreeting(profile?.display_name)}</p>
          </div>
          <Link to="/oraculo" className="p-2.5 rounded-xl bg-accent/10 shadow-card hover:shadow-soft transition-all">
            <Sparkles className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Hero Card */}
        <TodayHeroCard
          completedCount={todayTasksDone}
          totalCount={todayTasksTotal}
          greeting={getGreeting(profile?.display_name)}
        />

        {/* Today's tasks */}
        {isLoading ? (
          <div className="space-y-4 mb-6">
            {[1, 2].map(i => <div key={i} className="h-24 bg-card rounded-3xl shadow-card animate-pulse" />)}
          </div>
        ) : todayEntries.length > 0 && showingToday ? (
          <div className="space-y-4 mb-6">
            {todayEntries.map((entry: any) => (
              <JourneyEntryCard
                key={entry.id}
                entry={entry}
                onComplete={() => !entry.completed && completeJourney.mutate(entry.id)}
                onCompleteTask={(taskId: string) => completeTask.mutate(taskId)}
              />
            ))}
          </div>
        ) : null}

        {/* Week Streak */}
        <WeekStreak dayMap={dayMap} streakDays={(stats as any)?.streak_days ?? 0} />

        {/* Collapsible Calendar + Stats */}
        <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between bg-card rounded-2xl px-4 py-3 shadow-card mb-4 hover:shadow-soft transition-all">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm font-medium">Ver histórico</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${calendarOpen ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
            <div className="bg-card rounded-2xl shadow-card mb-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                locale={ptBR}
                className="p-3 pointer-events-auto"
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
                      <div className="flex flex-col items-center relative">
                        <span>{date.getDate()}</span>
                        {dotColor && (
                          <span
                            className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: dotColor }}
                          />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </div>

            {/* Selected day label + entries */}
            {!showingToday && (
              <>
                <p className="text-xs text-muted-foreground mb-3 font-medium">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
                {displayEntries.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {displayEntries.map((entry: any) => (
                      <JourneyEntryCard
                        key={entry.id}
                        entry={entry}
                        onComplete={() => !entry.completed && completeJourney.mutate(entry.id)}
                        onCompleteTask={(taskId: string) => completeTask.mutate(taskId)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6 mb-4">Nenhuma consulta neste dia.</p>
                )}
              </>
            )}

            <MonthlyStats totalConsultations={totalConsultations} totalTasksDone={totalTasksDone} activeDays={activeDays} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default JourneyPage;
