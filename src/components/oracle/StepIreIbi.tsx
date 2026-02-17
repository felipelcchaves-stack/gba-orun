import { Sun, AlertTriangle } from "lucide-react";
import { useOracleConfigs, useStepText } from "@/hooks/useOracleConfig";
import { OBI_RESULTS_FALLBACK } from "./StepObiResult";
import RitualHelpButton from "@/components/RitualHelpButton";
import GuidanceBubble from "@/components/GuidanceBubble";

interface Props {
  obiResult: string;
  onSelect: (value: "ire" | "ibi") => void;
}

const StepIreIbi = ({ obiResult, onSelect }: Props) => {
  const { data: dbConfigs } = useOracleConfigs();
  const stepText = useStepText("ire_ibi", "Veio em Irê ou Ibi?", "");

  const dbResult = dbConfigs?.find(c => c.result_key === obiResult);
  const fallback = OBI_RESULTS_FALLBACK.find(r => r.key === obiResult);
  const resultName = dbResult?.name || fallback?.name || obiResult;

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-display font-bold text-center flex-1">{stepText.title}</h2>
        <RitualHelpButton point="oracle_step_ire_ibi" />
      </div>
      <p className="text-center text-muted-foreground text-sm mb-2">
        O resultado <strong>{resultName}</strong> veio em caminho positivo ou negativo?
      </p>
      <p className="text-center text-xs text-muted-foreground mb-4">
        {stepText.description || "Irê = bom caminho · Ibi = caminho que precisa de cuidado"}
      </p>

      <GuidanceBubble pointKey="oracle_step_ire_ibi" className="mb-6" />

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("ire")}
          className="flex flex-col items-center gap-3 p-6 bg-primary/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-primary"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Sun className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h3 className="font-display font-bold text-lg text-primary">Irê</h3>
            <p className="text-xs text-muted-foreground mt-1">Caminho positivo</p>
          </div>
        </button>

        <button
          onClick={() => onSelect("ibi")}
          className="flex flex-col items-center gap-3 p-6 bg-destructive/10 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.97] border-2 border-transparent hover:border-destructive"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h3 className="font-display font-bold text-lg text-destructive">Ibi</h3>
            <p className="text-xs text-muted-foreground mt-1">Precisa de cuidado</p>
          </div>
        </button>
      </div>

      {/* Contextual description from DB */}
      {dbResult && (
        <p className="text-center text-xs text-muted-foreground mt-6 italic px-4">
          Dica: selecione Irê ou Ibi para ver orientações específicas para {resultName}.
        </p>
      )}
    </>
  );
};

export default StepIreIbi;
