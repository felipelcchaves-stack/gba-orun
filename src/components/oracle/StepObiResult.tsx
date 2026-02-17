import { ChevronRight, AlertTriangle, Shield, CheckCircle, Sparkles, Heart } from "lucide-react";
import obiOracle from "@/assets/obi-oracle.jpg";

export const OBI_RESULTS = [
  { key: "oyekun", name: "Oyekun", meaning: "Nenhum aberto — NÃO", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  { key: "okaran", name: "Okaran", meaning: "1 aberto — TALVEZ", icon: Shield, color: "bg-accent/15 text-accent-foreground" },
  { key: "ejife", name: "Ejife", meaning: "2 abertos — SIM", icon: CheckCircle, color: "bg-primary/10 text-primary" },
  { key: "etagun", name: "Etagun", meaning: "3 abertos — SIM FORTE", icon: Sparkles, color: "bg-primary/10 text-primary" },
  { key: "alafia", name: "Alafia", meaning: "Todos abertos — PAZ (confirme)", icon: Heart, color: "bg-accent/15 text-accent-foreground" },
] as const;

interface Props {
  onSelect: (key: string) => void;
}

const StepObiResult = ({ onSelect }: Props) => (
  <>
    <h1 className="text-3xl font-display font-bold text-center mb-1">Oráculo do Obi</h1>
    <p className="text-center text-muted-foreground text-sm mb-8">Qual foi o resultado do seu Obi hoje?</p>

    <div className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden shadow-soft">
      <img src={obiOracle} alt="Obi" className="w-full h-full object-cover" />
    </div>

    <div className="space-y-3">
      {OBI_RESULTS.map(r => {
        const Icon = r.icon;
        return (
          <button
            key={r.key}
            onClick={() => onSelect(r.key)}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}>
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-base">{r.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{r.meaning}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          </button>
        );
      })}
    </div>
  </>
);

export default StepObiResult;
