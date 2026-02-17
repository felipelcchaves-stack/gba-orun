import { useState, useRef } from "react";
import { ChevronRight, AlertTriangle, Shield, CheckCircle, Sparkles, Heart, Loader2, Play, Pause, ArrowRight } from "lucide-react";
import obiOracle from "@/assets/obi-oracle.jpg";
import { useOracleConfigs, type OracleConfig } from "@/hooks/useOracleConfig";
import RitualHelpButton from "@/components/RitualHelpButton";
import GuidanceBubble from "@/components/GuidanceBubble";
import { useGuidanceBubble } from "@/hooks/useGuidance";

// Fallback hardcoded values
export const OBI_RESULTS_FALLBACK = [
  { key: "oyekun", name: "Oyekun", meaning: "Nenhum aberto — NÃO", color_type: "danger", default_ire_ibi: "ibi" },
  { key: "okaran", name: "Okaran", meaning: "1 aberto — TALVEZ", color_type: "warning", default_ire_ibi: "ibi" },
  { key: "ejife", name: "Ejife", meaning: "2 abertos — SIM", color_type: "success", default_ire_ibi: "ire" },
  { key: "etagun", name: "Etagun", meaning: "3 abertos — SIM FORTE", color_type: "success", default_ire_ibi: "ire" },
  { key: "alafia", name: "Alafia", meaning: "Todos abertos — PAZ (confirme)", color_type: "accent", default_ire_ibi: "ire" },
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

const ResultGuidanceBubble = ({ config }: { config: { guidance_message: string; guidance_audio_url?: string | null } }) => {
  const { avatar_url } = useGuidanceBubble("oracle_step_obi"); // reuse avatar from settings
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className="relative flex items-start gap-3 animate-fade-up">
      <div className="shrink-0 mt-1">
        {avatar_url ? (
          <img src={avatar_url} alt="Orientador" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-amber-400/20 ring-2 ring-amber-400 flex items-center justify-center text-lg">🧙</div>
        )}
      </div>
      <div className="relative flex-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl rounded-tl-sm p-4 shadow-sm">
        <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-amber-200 dark:border-r-amber-800/40" />
        <div className="absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-amber-50 dark:border-r-amber-950/30" />
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line">{config.guidance_message}</p>
        {config.guidance_audio_url && (
          <>
            <audio ref={audioRef} src={config.guidance_audio_url} onEnded={() => setPlaying(false)} preload="none" />
            <button onClick={toggleAudio} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pausar áudio" : "Ouvir orientação"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const StepObiResult = ({ onSelect }: Props) => {
  const { data: dbConfigs, isLoading } = useOracleConfigs();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const configs: Array<{ key: string; name: string; meaning: string; color_type: string; default_ire_ibi: string; guidance_message?: string; guidance_audio_url?: string | null }> =
    dbConfigs && dbConfigs.length > 0
      ? dbConfigs.map(c => ({ key: c.result_key, name: c.name, meaning: c.meaning, color_type: c.color_type, default_ire_ibi: c.default_ire_ibi || "ibi", guidance_message: c.guidance_message, guidance_audio_url: c.guidance_audio_url }))
      : OBI_RESULTS_FALLBACK;

  const selectedConfig = selectedKey ? configs.find(c => c.key === selectedKey) : null;
  const hasGuidance = selectedConfig?.guidance_message && selectedConfig.guidance_message.trim().length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show guidance after selection
  if (selectedKey && hasGuidance) {
    return (
      <>
        <h1 className="text-3xl font-display font-bold text-center mb-2">{selectedConfig!.name}</h1>
        <p className="text-center text-muted-foreground text-sm mb-8">{selectedConfig!.meaning}</p>

        <ResultGuidanceBubble config={{ guidance_message: selectedConfig!.guidance_message!, guidance_audio_url: selectedConfig!.guidance_audio_url }} />

        <button
          onClick={() => onSelect(selectedKey)}
          className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-secondary text-secondary-foreground rounded-2xl font-display font-bold text-base shadow-card hover:shadow-soft transition-all active:scale-[0.98]"
        >
          Continuar <ArrowRight className="h-5 w-5" />
        </button>

        <button
          onClick={() => setSelectedKey(null)}
          className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar aos resultados
        </button>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-display font-bold text-center flex-1">Oráculo do Obi</h1>
        <RitualHelpButton point="oracle_step_obi" />
      </div>
      <p className="text-center text-muted-foreground text-sm mb-8">Qual foi o resultado do seu Obi hoje?</p>

      <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-soft">
        <img src={obiOracle} alt="Obi" className="w-full h-full object-cover" />
      </div>

      <GuidanceBubble pointKey="oracle_step_obi" className="mb-6" />

      <div className="space-y-3">
        {configs.map(r => {
          const Icon = getObiIcon(r.color_type);
          const color = getObiColor(r.color_type);
          return (
            <button
              key={r.key}
              onClick={() => {
                if (r.guidance_message && r.guidance_message.trim().length > 0) {
                  setSelectedKey(r.key);
                } else {
                  onSelect(r.key);
                }
              }}
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
