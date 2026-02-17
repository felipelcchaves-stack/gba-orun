import { Sun, AlertTriangle } from "lucide-react";
import { OBI_RESULTS } from "./StepObiResult";

interface Props {
  obiResult: string;
  onSelect: (value: "ire" | "ibi") => void;
}

const StepIreIbi = ({ obiResult, onSelect }: Props) => {
  const result = OBI_RESULTS.find(r => r.key === obiResult);

  return (
    <>
      <h2 className="text-2xl font-display font-bold text-center mb-1">Veio em Irê ou Ibi?</h2>
      <p className="text-center text-muted-foreground text-sm mb-2">
        O resultado <strong>{result?.name}</strong> veio em caminho positivo ou negativo?
      </p>
      <p className="text-center text-xs text-muted-foreground mb-8">
        Irê = bom caminho · Ibi = caminho que precisa de cuidado
      </p>

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
    </>
  );
};

export default StepIreIbi;
