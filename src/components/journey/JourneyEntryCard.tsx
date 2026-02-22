import { Link } from "react-router-dom";
import { CheckCircle, Circle, Compass, Sunrise, Moon, ChevronDown, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { useJourneyTasks } from "@/hooks/useJourney";
import { useOracleConfigs } from "@/hooks/useOracleConfig";
import { getCategoryImage, getCategoryLabel } from "@/lib/categories";
import { Progress } from "@/components/ui/progress";
import GuidanceBubble from "@/components/GuidanceBubble";
import TaskGuidanceBubble from "@/components/TaskGuidanceBubble";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useMemo, useState, useEffect, useRef } from "react";

const JourneyEntryCard = ({
  entry,
  onComplete,
  onCompleteTask,
}: {
  entry: any;
  onComplete: () => void;
  onCompleteTask: (taskId: string) => void;
}) => {
  const { data: tasks } = useJourneyTasks(entry.id);
  const { data: oracleConfigs } = useOracleConfigs();
  const { data: settings } = useAppSettings();
  const showPrayerGroups = settings?.show_daily_prayers === "true";
  const oracleNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    oracleConfigs?.forEach((c) => { map[c.result_key] = c.name; });
    return map;
  }, [oracleConfigs]);
  const morningTypes = ["oracao_manha", "oracao_ori"];
  const nightTypes = ["oracao_noite", "oracao_iyami"];
  const otherTasks = tasks?.filter((t: any) => !morningTypes.includes(t.task_type) && !nightTypes.includes(t.task_type)) ?? [];
  const visibleTasks = showPrayerGroups ? (tasks ?? []) : otherTasks;
  const completedCount = visibleTasks.filter((t: any) => t.completed).length;
  const totalCount = visibleTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const [expanded, setExpanded] = useState(false);
  const autoCompletedRef = useRef(false);

  // Auto-mark journey as completed when all tasks are done
  useEffect(() => {
    if (allDone && !entry.completed && !autoCompletedRef.current) {
      autoCompletedRef.current = true;
      onComplete();
    }
  }, [allDone, entry.completed, onComplete]);

  const morningTasks = tasks?.filter((t: any) => morningTypes.includes(t.task_type)) ?? [];
  const nightTasks = tasks?.filter((t: any) => nightTypes.includes(t.task_type)) ?? [];

  // --- Compact completed state ---
  if (allDone && !expanded) {
    return (
      <div className="bg-card rounded-3xl p-4 shadow-sacred border border-leaf/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-leaf/15 flex items-center justify-center shrink-0">
            <PartyPopper className="h-5 w-5 text-leaf" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-leaf">Rotina concluída! ✨</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-leaf/15 text-leaf px-2 py-0.5 rounded-full font-medium">
                {oracleNameMap[entry.oracle_result] || entry.oracle_result}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(entry.created_at), "HH:mm")}
              </span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver detalhes
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // --- Full expanded state ---
  return (
    <div className={`bg-card rounded-3xl p-5 shadow-sacred border transition-all hover:shadow-gold/10 ${allDone ? "border-leaf/30" : "border-border/50"}`}>
      {allDone && (
        <button
          onClick={() => setExpanded(false)}
          className="flex items-center gap-1 text-[11px] text-leaf font-medium mb-3 hover:opacity-80 transition-opacity"
        >
          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
          Recolher
        </button>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Compass className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
             <span className="text-[10px] bg-foreground text-background px-2 py-0.5 rounded-full font-medium">
              {oracleNameMap[entry.oracle_result] || entry.oracle_result}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(entry.created_at), "HH:mm")}
            </span>
          </div>
          {entry.rituals?.title && (
            <Link
              to={`/rituais/${entry.suggested_ritual_id}`}
              className="font-display font-bold text-sm hover:text-primary transition-colors truncate block"
            >
              {entry.rituals.title}
            </Link>
          )}
        </div>
        {!allDone && (
          <button onClick={onComplete} className="shrink-0 transition-transform active:scale-90">
            {entry.completed ? (
              <CheckCircle className="h-6 w-6 text-leaf" strokeWidth={1.5} />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">Progresso</span>
            <span className="text-[10px] text-muted-foreground">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <GuidanceBubble pointKey="journey_task_card" className="mb-4" />

      {showPrayerGroups ? (
        <>
          {morningTasks.length > 0 && <TaskSection icon={Sunrise} label="Manhã" iconBg="bg-accent/15" iconColor="text-accent" tasks={morningTasks} onComplete={onCompleteTask} />}
          {otherTasks.length > 0 && <TaskSection icon={Compass} label="Rituais & Oferendas" iconBg="bg-earth/15" iconColor="text-earth" tasks={otherTasks} onComplete={onCompleteTask} />}
          {nightTasks.length > 0 && <TaskSection icon={Moon} label="Noite" iconBg="bg-primary/15" iconColor="text-primary" tasks={nightTasks} onComplete={onCompleteTask} />}
        </>
      ) : (
        otherTasks.length > 0 && <TaskSection icon={Compass} label="Oferendas" iconBg="bg-earth/15" iconColor="text-earth" tasks={otherTasks} onComplete={onCompleteTask} />
      )}
    </div>
  );
};

const TaskSection = ({ icon: Icon, label, iconBg, iconColor, tasks, onComplete }: { icon: typeof Sunrise; label: string; iconBg: string; iconColor: string; tasks: any[]; onComplete: (id: string) => void }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center gap-2 mb-2.5">
      <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} strokeWidth={1.5} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
    <div className="space-y-1.5 pl-1">
      {tasks.map((task: any) => (
        <div key={task.id} className="flex items-center gap-3 py-1.5">
          <button onClick={() => !task.completed && onComplete(task.id)} className="shrink-0 transition-transform active:scale-75">
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-leaf" strokeWidth={1.5} />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/30" strokeWidth={1.5} />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <Link
              to={task.ritual_id ? `/rituais/${task.ritual_id}` : `/rituais?cat=${task.task_type}`}
              className={`text-sm font-medium hover:text-primary transition-colors truncate block ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.task_title}
            </Link>
            <span className="text-[10px] text-muted-foreground">{getCategoryLabel(task.task_type)}</span>
            {task.guidance_message && (
              <TaskGuidanceBubble message={task.guidance_message} audioUrl={task.guidance_audio_url} className="mt-1.5" />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default JourneyEntryCard;
