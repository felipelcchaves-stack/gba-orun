import { CalendarDays, Compass } from "lucide-react";
import { useStepText } from "@/hooks/useOracleConfig";
import GuidanceBubble from "@/components/GuidanceBubble";

type Intention = "cuidado_semanal" | "orientacao";

interface Props {
  onSelect: (intention: Intention) => void;
}

const OPTIONS: { value: Intention; icon: typeof CalendarDays; title: string; desc: string }[] = [
  {
    value: "cuidado_semanal",
    icon: CalendarDays,
    title: "Cuidado Espiritual Semanal",
    desc: "Rotina de manutenção e proteção",
  },
  {
    value: "orientacao",
    icon: Compass,
    title: "Quero uma Orientação",
    desc: "Consulta pontual para um problema ou dúvida",
  },
];

const StepIntention = ({ onSelect }: Props) => {
  const { title, description } = useStepText(
    "intention",
    "Como posso te ajudar hoje?",
    "Escolha o tipo de consulta que deseja realizar"
  );

  return (
    <div className="animate-fade-up">
      <h2 className="text-2xl font-display font-bold text-center mb-1">{title}</h2>
      <p className="text-center text-muted-foreground text-sm mb-4">{description}</p>

      <GuidanceBubble pointKey="oracle_step_intention" className="mb-6" />

      <div className="space-y-4">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="w-full bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">{opt.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIntention;
