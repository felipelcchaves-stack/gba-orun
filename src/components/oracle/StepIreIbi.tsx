import { useState } from "react";
import { Sun, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { useOracleConfigs, useStepText } from "@/hooks/useOracleConfig";
import { useIreIbiTypes, type IreIbiType } from "@/hooks/useIreIbiTypes";
import { OBI_RESULTS_FALLBACK } from "./StepObiResult";
import RitualHelpButton from "@/components/RitualHelpButton";
import GuidanceBubble from "@/components/GuidanceBubble";

interface Props {
  obiResult: string;
  defaultCategory?: "ire" | "ibi";
  onSelect: (category: "ire" | "ibi", typeId: string, typeName: string) => void;
}

const StepIreIbi = ({ obiResult, defaultCategory, onSelect }: Props) => {
  const { data: dbConfigs } = useOracleConfigs();
  const { data: types, isLoading } = useIreIbiTypes();
  const stepText = useStepText("ire_ibi", "Veio em Irê ou Ibi?", "");
  const [selectedCategory, setSelectedCategory] = useState<"ire" | "ibi" | null>(defaultCategory || null);

  const dbResult = dbConfigs?.find(c => c.result_key === obiResult);
  const fallback = OBI_RESULTS_FALLBACK.find(r => r.key === obiResult);
  const resultName = dbResult?.name || fallback?.name || obiResult;

  const filteredTypes = types?.filter(t => t.category === selectedCategory) ?? [];

  if (!selectedCategory) {
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
            onClick={() => setSelectedCategory("ire")}
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
            onClick={() => setSelectedCategory("ibi")}
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
      </>
    );
  }

  // Subtype selection screen
  const isIre = selectedCategory === "ire";

  return (
    <>
      <button
        onClick={() => setSelectedCategory(null)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
      </button>

      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-display font-bold text-center flex-1">
          {isIre ? "Que tipo de Irê?" : "Que tipo de Ibi?"}
        </h2>
        <RitualHelpButton point="oracle_step_ire_ibi" />
      </div>
      <p className="text-center text-muted-foreground text-sm mb-6">
        Selecione o tipo específico que veio para <strong>{resultName}</strong>
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTypes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          Nenhum tipo cadastrado. O admin pode adicionar no painel.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(selectedCategory, t.id, t.name)}
              className={`w-full text-left p-4 rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] border-2 border-transparent ${
                isIre
                  ? "bg-primary/5 hover:border-primary"
                  : "bg-destructive/5 hover:border-destructive"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isIre ? "bg-primary/15" : "bg-destructive/15"
                }`}>
                  {isIre
                    ? <Sun className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    : <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
                  }
                </div>
                <div>
                  <h4 className={`font-display font-bold text-sm ${isIre ? "text-primary" : "text-destructive"}`}>
                    {t.name}
                  </h4>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default StepIreIbi;
