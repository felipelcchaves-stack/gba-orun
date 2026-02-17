import { Check, X, AlertTriangle, Users } from "lucide-react";
import { useState } from "react";

interface Props {
  onAnswer: (iyamiQuer: boolean, egbeOrunQuer: boolean) => void;
}

const StepIyamiEgbe = ({ onAnswer }: Props) => {
  const [subStep, setSubStep] = useState<"iyami" | "egbe">("iyami");
  const [iyamiQuer, setIyamiQuer] = useState<boolean | null>(null);

  const handleIyami = (value: boolean) => {
    setIyamiQuer(value);
    setSubStep("egbe");
  };

  const handleEgbe = (value: boolean) => {
    onAnswer(iyamiQuer!, value);
  };

  if (subStep === "iyami") {
    return (
      <>
        <h2 className="text-2xl font-display font-bold text-center mb-1">As Iyami querem algo?</h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Verifique se as Mães Ancestrais pedem atenção neste momento.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleIyami(true)}
            className="flex flex-col items-center gap-3 p-6 bg-destructive/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-destructive"
          >
            <div className="w-14 h-14 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-bold">Sim</h3>
            <p className="text-xs text-muted-foreground text-center">Precisam de atenção</p>
          </button>

          <button
            onClick={() => handleIyami(false)}
            className="flex flex-col items-center gap-3 p-6 bg-accent/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-accent"
          >
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
              <X className="h-7 w-7 text-accent-foreground" strokeWidth={2} />
            </div>
            <h3 className="font-display font-bold">Não</h3>
            <p className="text-xs text-muted-foreground text-center">Estão em paz</p>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-display font-bold text-center mb-1">O Egbe Orun quer algo?</h2>
      <p className="text-center text-muted-foreground text-sm mb-8">
        Verifique se os ancestrais e sua comunidade espiritual pedem algo.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleEgbe(true)}
          className="flex flex-col items-center gap-3 p-6 bg-primary/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-primary"
        >
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="font-display font-bold">Sim</h3>
          <p className="text-xs text-muted-foreground text-center">Querem oferenda</p>
        </button>

        <button
          onClick={() => handleEgbe(false)}
          className="flex flex-col items-center gap-3 p-6 bg-accent/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-accent"
        >
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
            <X className="h-7 w-7 text-accent-foreground" strokeWidth={2} />
          </div>
          <h3 className="font-display font-bold">Não</h3>
          <p className="text-xs text-muted-foreground text-center">Estão satisfeitos</p>
        </button>
      </div>
    </>
  );
};

export default StepIyamiEgbe;
