import { Link } from "react-router-dom";
import { CheckCircle, Circle, Compass, Sunrise, Moon } from "lucide-react";
import { format } from "date-fns";
import { useJourneyTasks } from "@/hooks/useJourney";
import { getCategoryImage, getCategoryLabel } from "@/lib/categories";
import { Progress } from "@/components/ui/progress";

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
  const completedCount = tasks?.filter((t: any) => t.completed).length ?? 0;
  const totalCount = tasks?.length ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const morningTypes = ["oracao_manha", "oracao_ori"];
  const nightTypes = ["oracao_noite", "oracao_iyami"];
  const morningTasks = tasks?.filter((t: any) => morningTypes.includes(t.task_type)) ?? [];
  const nightTasks = tasks?.filter((t: any) => nightTypes.includes(t.task_type)) ?? [];
  const otherTasks = tasks?.filter((t: any) => !morningTypes.includes(t.task_type) && !nightTypes.includes(t.task_type)) ?? [];

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <img src={getCategoryImage("geral")} alt="Obi" className="w-10 h-10 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] bg-foreground text-background px-2 py-0.5 rounded-full font-medium">
              {entry.oracle_result}
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
        <button onClick={onComplete} className="shrink-0">
          {entry.completed ? (
            <CheckCircle className="h-6 w-6 text-primary" strokeWidth={1.5} />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
          )}
        </button>
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

      {morningTasks.length > 0 && <TaskSection icon={Sunrise} label="Manhã" tasks={morningTasks} onComplete={onCompleteTask} />}
      {otherTasks.length > 0 && <TaskSection icon={Compass} label="Rituais & Oferendas" tasks={otherTasks} onComplete={onCompleteTask} />}
      {nightTasks.length > 0 && <TaskSection icon={Moon} label="Noite" tasks={nightTasks} onComplete={onCompleteTask} />}
    </div>
  );
};

const TaskSection = ({ icon: Icon, label, tasks, onComplete }: { icon: typeof Sunrise; label: string; tasks: any[]; onComplete: (id: string) => void }) => (
  <div className="mb-3 last:mb-0">
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
    <div className="space-y-1.5">
      {tasks.map((task: any) => (
        <div key={task.id} className="flex items-center gap-3 py-1.5">
          <button onClick={() => !task.completed && onComplete(task.id)} className="shrink-0">
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-primary" strokeWidth={1.5} />
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
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default JourneyEntryCard;
