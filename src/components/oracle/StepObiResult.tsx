import { ChevronRight, AlertTriangle, Shield, CheckCircle, Sparkles, Heart, Loader2 } from "lucide-react";
import obiOracle from "@/assets/obi-oracle.jpg";
import { useOracleConfigs, type OracleConfig } from "@/hooks/useOracleConfig";

// Fallback hardcoded values
export const OBI_RESULTS_FALLBACK = [
  { key: "oyekun", name: "Oyekun", meaning: "Nenhum aberto — NÃO", color_type: "danger" },
  { key: "okaran", name: "Okaran", meaning: "1 aberto — TALVEZ", color_type: "warning" },
  { key: "ejife", name: "Ejife", meaning: "2 abertos — SIM", color_type: "success" },
  { key: "etagun", name: "Etagun", meaning: "3 abertos — SIM FORTE", color_type: "success" },
  { key: "alafia", name: "Alafia", meaning: "Todos abertos — PAZ (confirme)", color_type: "accent" },
];

const ICON_MAP: Record<string, any> = {
  danger: AlertTriangle,
  warning: Shield,
  success: CheckCircle,
  accent: Heart,
};

const COLOR_MAP: Record<string, string> = {
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-accent/15 text-accent-foreground",
  success: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent-foreground",
};

// Re-export for StepDiagnosis backward compat
export const OBI_RESULTS = OBI_RESULTS_FALLBACK.map(r => ({
  ...r,
  icon: ICON_MAP[r.color_type] || CheckCircle,
  color: COLOR_MAP[r.color_type] || "bg-primary/10 text-primary",
}));

export function getObiIcon(colorType: string) {
  return ICON_MAP[colorType] || CheckCircle;
}

export function getObiColor(colorType: string) {
  return COLOR_MAP[colorType] || "bg-primary/10 text-primary";
}

interface Props {
  onSelect: (key: string) => void;
}

const StepObiResult = ({ onSelect }: Props) => {
  const { data: dbConfigs, isLoading } = useOracleConfigs();

  const configs: Array<{ key: string; name: string; meaning: string; color_type: string }> =
    dbConfigs && dbConfigs.length > 0
      ? dbConfigs.map(c => ({ key: c.result_key, name: c.name, meaning: c.meaning, color_type: c.color_type }))
      : OBI_RESULTS_FALLBACK;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-display font-bold text-center mb-1">Oráculo do Obi</h1>
      <p className="text-center text-muted-foreground text-sm mb-8">Qual foi o resultado do seu Obi hoje?</p>

      <div className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden shadow-soft">
        <img src={obiOracle} alt="Obi" className="w-full h-full object-cover" />
      </div>

      <div className="space-y-3">
        {configs.map(r => {
          const Icon = getObiIcon(r.color_type);
          const color = getObiColor(r.color_type);
          return (
            <button
              key={r.key}
              onClick={() => onSelect(r.key)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
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
};

export default StepObiResult;
