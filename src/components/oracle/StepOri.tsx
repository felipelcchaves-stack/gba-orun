import { Check, X, Heart, Sun } from "lucide-react";
import { useState } from "react";
import { useStepText } from "@/hooks/useOracleConfig";
import RitualHelpButton from "@/components/RitualHelpButton";
import GuidanceBubble from "@/components/GuidanceBubble";

const ORI_ACTIONS = [
  { key: "ibori", label: "Ibori", desc: "Ritual para fortalecer o Ori", icon: Heart },
  { key: "oracao", label: "Oração de Ori", desc: "Oração específica para o Ori", icon: Sun },
  { key: "ambos", label: "Ambos", desc: "Ibori + Oração de Ori", icon: Heart },
];

interface Props {
  ireOrIbi: "ire" | "ibi";
  onAnswer: (precisa: boolean, acao?: string) => void;
}

const StepOri = ({ ireOrIbi, onAnswer }: Props) => {
  const [showActions, setShowActions] = useState(false);
  const stepText = useStepText("ori", "O Ori precisa de algo?", "");
  const subText = useStepText(
    ireOrIbi === "ibi" ? "ori_ibi" : "ori_ire",
    "O que o Ori precisa?",
    "Selecione a ação necessária"
  );

  if (showActions) {
    return (
      <>
        <h2 className="text-2xl font-display font-bold text-center mb-1">{subText.title}</h2>
        <p className="text-center text-muted-foreground text-sm mb-8">{subText.description}</p>
        <div className="space-y-3">
          {ORI_ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => onAnswer(true, a.key)}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm">{a.label}</h4>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const defaultDesc = ireOrIbi === "ibi"
    ? "Em Ibi, o Ori quase sempre precisa de cuidado e fortalecimento."
    : "Em Irê, o Ori pode precisar de manutenção para manter a harmonia.";

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-display font-bold text-center flex-1">{stepText.title}</h2>
        <RitualHelpButton point="oracle_step_ori" />
      </div>
      <p className="text-center text-muted-foreground text-sm mb-4">
        {stepText.description || defaultDesc}
      </p>

      <GuidanceBubble pointKey="oracle_step_ori" className="mb-6" />

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowActions(true)}
          className="flex flex-col items-center gap-3 p-6 bg-primary/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-primary"
        >
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <h3 className="font-display font-bold">Sim</h3>
          <p className="text-xs text-muted-foreground text-center">Precisa de cuidado</p>
        </button>

        <button
          onClick={() => onAnswer(false)}
          className="flex flex-col items-center gap-3 p-6 bg-accent/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-accent"
        >
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
            <X className="h-7 w-7 text-accent-foreground" strokeWidth={2} />
          </div>
          <h3 className="font-display font-bold">Não</h3>
          <p className="text-xs text-muted-foreground text-center">Já está bem</p>
        </button>
      </div>
    </>
  );
};

export default StepOri;
