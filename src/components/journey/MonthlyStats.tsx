import { Compass, CheckCircle, Flame } from "lucide-react";

interface MonthlyStatsProps {
  totalConsultations: number;
  totalTasksDone: number;
  activeDays: number;
}

const MonthlyStats = ({ totalConsultations, totalTasksDone, activeDays }: MonthlyStatsProps) => (
  <div className="grid grid-cols-3 gap-3 mb-5">
    {[
      { icon: Compass, label: "Consultas", value: totalConsultations, bgClass: "bg-accent/15", iconClass: "text-accent" },
      { icon: CheckCircle, label: "Tarefas feitas", value: totalTasksDone, bgClass: "bg-leaf/15", iconClass: "text-leaf" },
      { icon: Flame, label: "Dias ativos", value: activeDays, bgClass: "bg-earth/15", iconClass: "text-earth" },
    ].map(({ icon: Icon, label, value, bgClass, iconClass }) => (
      <div key={label} className="bg-card rounded-2xl p-3 shadow-card text-center">
        <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center mx-auto mb-2`}>
          <Icon className={`h-4.5 w-4.5 ${iconClass}`} strokeWidth={1.5} />
        </div>
        <span className="text-2xl font-bold block">{value}</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    ))}
  </div>
);

export default MonthlyStats;
