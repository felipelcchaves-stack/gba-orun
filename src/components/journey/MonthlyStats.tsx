import { Calendar, CheckCircle, Flame } from "lucide-react";

interface MonthlyStatsProps {
  totalConsultations: number;
  totalTasksDone: number;
  activeDays: number;
}

const MonthlyStats = ({ totalConsultations, totalTasksDone, activeDays }: MonthlyStatsProps) => (
  <div className="grid grid-cols-3 gap-3 mb-5">
    {[
      { icon: Calendar, label: "Consultas", value: totalConsultations },
      { icon: CheckCircle, label: "Tarefas feitas", value: totalTasksDone },
      { icon: Flame, label: "Dias ativos", value: activeDays },
    ].map(({ icon: Icon, label, value }) => (
      <div key={label} className="bg-card rounded-2xl p-3 shadow-card text-center">
        <Icon className="h-4 w-4 mx-auto mb-1 text-accent" strokeWidth={1.5} />
        <span className="text-xl font-bold block">{value}</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    ))}
  </div>
);

export default MonthlyStats;
