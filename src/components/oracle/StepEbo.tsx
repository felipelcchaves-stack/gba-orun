import { Check, X, Shield } from "lucide-react";
import { useState } from "react";
import { useStepText } from "@/hooks/useOracleConfig";

const EBO_TYPES = [
  { key: "limpeza", label: "Limpeza" },
  { key: "prosperidade", label: "Prosperidade" },
  { key: "saude", label: "Saúde" },
  { key: "protecao", label: "Proteção" },
  { key: "caminho", label: "Abrir Caminhos" },
  { key: "agradecimento", label: "Agradecimento" },
];

interface Props {
  ireOrIbi: "ire" | "ibi";
  onAnswer: (apurado: boolean, tipo?: string) => void;
}

const StepEbo = ({ ireOrIbi, onAnswer }: Props) => {
  const [showTypes, setShowTypes] = useState(false);
  const stepText = useStepText("ebo", "Você já apurou o Ebó?", "");
  const subStepText = useStepText(
    ireOrIbi === "ibi" ? "ebo_ibi" : "ebo_ire",
    "Qual tipo de Ebó?",
    "Selecione o tipo que foi apurado"
  );

  if (showTypes) {
    return (
      <>
        <h2 className="text-2xl font-display font-bold text-center mb-1">{subStepText.title}</h2>
        <p className="text-center text-muted-foreground text-sm mb-8">{subStepText.description}</p>
        <div className="space-y-3">
          {EBO_TYPES.map(t => (
            <button
              key={t.key}
              onClick={() => onAnswer(true, t.key)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-display font-bold text-sm">{t.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const defaultDesc = ireOrIbi === "ibi"
    ? "Em Ibi, o ebó é fundamental para restabelecer o equilíbrio."
    : "Em Irê, o ebó pode ser de agradecimento ou para fortalecer o caminho.";

  return (
    <>
      <h2 className="text-2xl font-display font-bold text-center mb-1">{stepText.title}</h2>
      <p className="text-center text-muted-foreground text-sm mb-8">
        {stepText.description || defaultDesc}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowTypes(true)}
          className="flex flex-col items-center gap-3 p-6 bg-primary/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-primary"
        >
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <h3 className="font-display font-bold">Sim</h3>
          <p className="text-xs text-muted-foreground text-center">Já sei qual ebó</p>
        </button>

        <button
          onClick={() => onAnswer(false)}
          className="flex flex-col items-center gap-3 p-6 bg-accent/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-accent"
        >
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
            <X className="h-7 w-7 text-accent-foreground" strokeWidth={2} />
          </div>
          <h3 className="font-display font-bold">Não</h3>
          <p className="text-xs text-muted-foreground text-center">Preciso de orientação</p>
        </button>
      </div>
    </>
  );
};

export default StepEbo;
