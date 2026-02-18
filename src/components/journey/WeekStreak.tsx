import { format, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame } from "lucide-react";

interface WeekStreakProps {
  dayMap: Map<string, { entries: any[]; tasksDone: number; tasksTotal: number }>;
  streakDays: number;
}

const WeekStreak = ({ dayMap, streakDays }: WeekStreakProps) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <Flame className="h-4 w-4 text-accent" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold">Consistência</span>
        </div>
        {streakDays > 0 && (
          <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            🔥 {streakDays} dia{streakDays !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="flex justify-between gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const info = dayMap.get(key);
          const isToday = isSameDay(day, today);
          const isComplete = info && info.tasksTotal > 0 && info.tasksDone === info.tasksTotal;
          const isPartial = info && info.tasksDone > 0 && !isComplete;
          const hasActivity = info && (info.entries.length > 0 || info.tasksTotal > 0);

          return (
            <div key={key} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[9px] text-muted-foreground uppercase font-medium">
                {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isComplete ? "bg-leaf text-leaf-foreground" : ""}
                  ${isPartial ? "bg-accent/20 text-accent" : ""}
                  ${!isComplete && !isPartial && hasActivity ? "bg-destructive/15 text-destructive" : ""}
                  ${!hasActivity ? "bg-muted text-muted-foreground" : ""}
                  ${isToday ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}
                `}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStreak;
