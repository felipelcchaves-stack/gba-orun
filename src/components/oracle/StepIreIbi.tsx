import { useState, useRef } from "react";
import { Sun, AlertTriangle, ArrowLeft, Loader2, BookOpen, UtensilsCrossed, Play, Pause, ArrowRight } from "lucide-react";
import { useOracleConfigs, useStepText } from "@/hooks/useOracleConfig";
import { useIreIbiTypes, type IreIbiType } from "@/hooks/useIreIbiTypes";
import { useRituals } from "@/hooks/useRituals";
import { useOfferings } from "@/hooks/useOfferings";
import { useAppSettings } from "@/hooks/useAppSettings";
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
  const { data: rituals } = useRituals();
  const { data: offerings } = useOfferings();
  const { data: settings } = useAppSettings();
  const stepText = useStepText("ire_ibi", "Veio em Irê ou Ibi?", "");
  const [selectedCategory, setSelectedCategory] = useState<"ire" | "ibi" | null>(defaultCategory || null);
  const [guidanceType, setGuidanceType] = useState<IreIbiType | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dbResult = dbConfigs?.find(c => c.result_key === obiResult);
  const fallback = OBI_RESULTS_FALLBACK.find(r => r.key === obiResult);
  const resultName = dbResult?.name || fallback?.name || obiResult;
  const avatarUrl = settings?.guidance_avatar_url || "";

  const filteredTypes = types?.filter(t => t.category === selectedCategory) ?? [];

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  // Show guidance screen for selected type
  if (guidanceType) {
    const linkedRitual = rituals?.find(r => r.id === guidanceType.ritual_id);
    const linkedOffering = offerings?.find(o => o.id === guidanceType.offering_id);
    const isIre = guidanceType.category === "ire";

    return (
      <>
        <button
          onClick={() => setGuidanceType(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
        </button>

        <div className={`text-center mb-6 p-4 rounded-2xl ${isIre ? "bg-primary/10" : "bg-destructive/10"}`}>
          <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${isIre ? "bg-primary/20" : "bg-destructive/20"}`}>
            {isIre ? <Sun className="h-6 w-6 text-primary" /> : <AlertTriangle className="h-6 w-6 text-destructive" />}
          </div>
          <h3 className={`font-display font-bold text-lg ${isIre ? "text-primary" : "text-destructive"}`}>{guidanceType.name}</h3>
          {guidanceType.description && <p className="text-sm text-muted-foreground mt-1">{guidanceType.description}</p>}
        </div>

        {/* Master guidance bubble */}
        <div className="relative flex items-start gap-3 animate-fade-up mb-6">
          <div className="shrink-0 mt-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Orientador" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-400/20 ring-2 ring-amber-400 flex items-center justify-center text-lg">🧙</div>
            )}
          </div>
          <div className="relative flex-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl rounded-tl-sm p-4 shadow-sm">
            <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-amber-200 dark:border-r-amber-800/40" />
            <div className="absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-amber-50 dark:border-r-amber-950/30" />
            <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line">{guidanceType.guidance_message}</p>
            {guidanceType.guidance_audio_url && (
              <>
                <audio ref={audioRef} src={guidanceType.guidance_audio_url} onEnded={() => setPlaying(false)} preload="none" />
                <button onClick={toggleAudio} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {playing ? "Pausar áudio" : "Ouvir orientação"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Linked ritual / offering */}
        {(linkedRitual || linkedOffering) && (
          <div className="space-y-2 mb-6">
            {linkedRitual && (
              <a href={`/rituais/${linkedRitual.id}`} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Reza sugerida</p>
                  <p className="text-sm font-semibold truncate">{linkedRitual.title}</p>
                </div>
              </a>
            )}
            {linkedOffering && (
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Oferenda sugerida</p>
                  <p className="text-sm font-semibold truncate">{linkedOffering.title}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => onSelect(guidanceType.category, guidanceType.id, guidanceType.name)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-foreground text-background rounded-2xl font-display font-bold text-sm shadow-card hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          Continuar <ArrowRight className="h-4 w-4" />
        </button>
      </>
    );
  }

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

  const handleTypeClick = (t: IreIbiType) => {
    if (t.guidance_message) {
      setGuidanceType(t);
    } else {
      onSelect(selectedCategory, t.id, t.name);
    }
  };

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
      <p className="text-center text-muted-foreground text-sm mb-4">
        Selecione o tipo específico que veio para <strong>{resultName}</strong>
      </p>

      <GuidanceBubble pointKey={isIre ? "oracle_step_ire_subtype" : "oracle_step_ibi_subtype"} className="mb-6" />

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
              onClick={() => handleTypeClick(t)}
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
