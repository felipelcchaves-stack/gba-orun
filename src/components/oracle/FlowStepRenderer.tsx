import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronRight, Loader2, Play, Pause, BookOpen, UtensilsCrossed } from "lucide-react";
import { type OracleFlowNode } from "@/hooks/useOracleFlows";
import { useOracleConfigs } from "@/hooks/useOracleConfig";
import { useIreIbiTypes } from "@/hooks/useIreIbiTypes";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useAddJourneyEntry, useCreateJourneyTasks } from "@/hooks/useJourney";
import { useRituals, useRitual } from "@/hooks/useRituals";
import { useOfferings } from "@/hooks/useOfferings";
import { getCategoryImage, getCategoryLabel } from "@/lib/categories";
import { Progress } from "@/components/ui/progress";
import AudioPlayer from "@/components/AudioPlayer";
// RitualCombobox removed — rituals are now linked via config.ritual_ids
import OfferingCombobox from "@/components/OfferingCombobox";
import TaskGuidanceBubble from "@/components/TaskGuidanceBubble";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

interface FlowStepRendererProps {
  node: OracleFlowNode;
  onNext: (handleId: string, answer?: string) => void;
  answers?: Record<string, string>;
  allNodes?: OracleFlowNode[];
}

// Inline guidance bubble that uses config data (not DB guidance_bubbles)
const InlineGuidance = ({ message, audioUrl }: { message: string; audioUrl?: string | null }) => {
  const { data: settings } = useAppSettings();
  const avatarUrl = settings?.guidance_avatar_url || "";
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!message) return null;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className="relative flex items-start gap-3 animate-fade-up mb-4">
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
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line">{message}</p>
        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} preload="none" />
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

// Linked ritual button (extracted so hooks are always called)
const LinkedRitualButton = ({ ritualId }: { ritualId: string }) => {
  const { data: ritual } = useRitual(ritualId);
  const [open, setOpen] = useState(false);

  if (!ritual) return null;

  const imageUrl = ritual.image_url || getCategoryImage(ritual.category);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Ver Ritual: {ritual.title}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-0">
          <div className="relative w-full h-36 sm:h-44 rounded-t-2xl overflow-hidden">
            <img src={imageUrl} alt={ritual.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h2 className="text-white font-display font-bold text-lg leading-tight">{ritual.title}</h2>
              <span className="text-white/70 text-xs capitalize">{ritual.category}</span>
            </div>
          </div>

          <div className="p-3 sm:p-4">

            {ritual.audio_url && (
              <div className="mb-3">
                <AudioPlayer url={ritual.audio_url} />
              </div>
            )}

            <div className="prose-ritual">
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>{ritual.content_full}</ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Linked offering button
const LinkedOfferingButton = ({ offeringId }: { offeringId: string }) => {
  const { data: offerings } = useOfferings();
  const [open, setOpen] = useState(false);

  const offering = offerings?.find((o) => o.id === offeringId);
  if (!offering) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/15 text-accent-foreground text-xs font-medium hover:bg-accent/25 transition-colors"
      >
        <UtensilsCrossed className="h-3.5 w-3.5" />
        <span>Ver Oferenda: {offering.title}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-0">
          {offering.image_url && (
            <div className="relative w-full h-36 sm:h-44 rounded-t-2xl overflow-hidden">
              <img src={offering.image_url} alt={offering.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-white font-display font-bold text-lg leading-tight">{offering.title}</h2>
                <span className="text-white/70 text-xs capitalize">{offering.category}</span>
              </div>
            </div>
          )}

          <div className="p-3 sm:p-4">
            {!offering.image_url && (
              <DialogHeader className="mb-3">
                <DialogTitle>{offering.title}</DialogTitle>
              </DialogHeader>
            )}

            {offering.audio_url && (
              <div className="mb-3">
                <AudioPlayer url={offering.audio_url} />
              </div>
            )}

            {offering.ingredients && (
              <div className="mb-3">
                <h3 className="text-sm font-semibold mb-1">Ingredientes</h3>
                <div className="prose-ritual text-sm">
                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>{offering.ingredients}</ReactMarkdown>
                </div>
              </div>
            )}

            {offering.instructions && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Modo de Preparo</h3>
                <div className="prose-ritual text-sm">
                  <ReactMarkdown remarkPlugins={[remarkBreaks]}>{offering.instructions}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Interpolate {{variable_name}} in text with answers
function interpolateVars(text: string, answers: Record<string, string>): string {
  if (!text) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => answers[key] || `{{${key}}}`);
}

// Common header for all steps
const StepHeader = ({ node, answers }: { node: OracleFlowNode; answers?: Record<string, string> }) => {
  const config = node.config || {};
  const vars = answers || {};
  return (
    <>
      {node.label && <h2 className="text-xl font-display font-bold text-foreground">{interpolateVars(node.label, vars)}</h2>}
      {config.description && <p className="text-muted-foreground text-sm">{interpolateVars(config.description as string, vars)}</p>}
      {config.guidance_message && (
        <InlineGuidance message={config.guidance_message} audioUrl={config.guidance_audio_url} />
      )}
      {(() => {
        const ritualIds = config.ritual_ids || (config.ritual_id ? [config.ritual_id] : []);
        const offeringId = config.offering_id as string | undefined;
        const hasLinks = ritualIds.length > 0 || offeringId;
        return hasLinks ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {ritualIds.map((id: string) => <LinkedRitualButton key={id} ritualId={id} />)}
            {offeringId && <LinkedOfferingButton offeringId={offeringId} />}
          </div>
        ) : null;
      })()}
    </>
  );
};

const FlowStepRenderer = ({ node, onNext, answers = {}, allNodes = [] }: FlowStepRendererProps) => {
  const config = node.config || {};
  const [openAnswer, setOpenAnswer] = useState("");

  // ── START ──
  if (node.node_type === "start") {
    return (
      <div className="text-center space-y-6 animate-fade-up">
        <StepHeader node={node} answers={answers} />
        <button onClick={() => onNext("default")} className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg">
          Começar
        </button>
      </div>
    );
  }

  // ── MESSAGE ──
  if (node.node_type === "message") {
    return (
      <div className="space-y-4 animate-fade-up">
        <StepHeader node={node} answers={answers} />
        {config.message && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{interpolateVars(config.message as string, answers)}</p>}
        {config.audio_url && <AudioPlayer url={config.audio_url as string} />}
        <button onClick={() => onNext("default")} className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg">
          Continuar
        </button>
      </div>
    );
  }

  // ── YES/NO ──
  if (node.node_type === "yes_no") {
    return <YesNoStep node={node} config={config} onNext={onNext} />;
  }

  // ── MULTIPLE CHOICE ──
  if (node.node_type === "multiple_choice") {
    const options: Array<{ label: string; description?: string }> =
      (config.options || []).map((o: any) => typeof o === "string" ? { label: o } : o);
    return (
      <div className="space-y-4 animate-fade-up">
        <StepHeader node={{ ...node, label: config.question || node.label } as OracleFlowNode} answers={answers} />
        <div className="space-y-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onNext(`option_${i}`, opt.label)}
              className="w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition text-left px-5"
            >
              <span className="block">{opt.label}</span>
              {opt.description && <span className="block text-xs text-muted-foreground font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── OBI (from DB) ──
  if (node.node_type === "obi") {
    return <ObiStep node={node} onNext={onNext} />;
  }

  // ── IRE/IBI (from DB) ──
  if (node.node_type === "ire_ibi") {
    return <IreIbiStep node={node} onNext={onNext} answers={answers} />;
  }

  // ── OPEN QUESTION ──
  if (node.node_type === "open_question") {
    return (
      <div className="space-y-4 animate-fade-up">
        <StepHeader node={{ ...node, label: config.question || node.label } as OracleFlowNode} answers={answers} />
        <textarea
          value={openAnswer}
          onChange={(e) => setOpenAnswer(e.target.value)}
          placeholder="Digite sua resposta..."
          className="w-full rounded-2xl border border-border bg-background p-4 text-foreground min-h-[100px]"
        />
        <button
          onClick={() => { if (openAnswer.trim()) onNext("default", openAnswer.trim()); }}
          disabled={!openAnswer.trim()}
          className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    );
  }

  // ── DIAGNOSIS ──
  if (node.node_type === "diagnosis") {
    return <DiagnosisStep node={node} answers={answers} allNodes={allNodes} />;
  }

  // ── MEDIA ──
  if (node.node_type === "media") {
    return <MediaStep node={node} config={config} onNext={onNext} answers={answers} />;
  }

  // ── TIMER ──
  if (node.node_type === "timer") {
    return <TimerStep node={node} config={config} onNext={onNext} answers={answers} />;
  }

  // ── CONDITIONAL ──
  if (node.node_type === "conditional") {
    return <ConditionalStep config={config} onNext={onNext} answers={answers} />;
  }

  return <p className="text-muted-foreground">Tipo de bloco desconhecido: {node.node_type}</p>;
};

// ── YES/NO STEP (with optional alert on "No") ──
const YesNoStep = ({ node, config, onNext }: { node: OracleFlowNode; config: Record<string, any>; onNext: (h: string, a?: string) => void }) => {
  const [showNoAlert, setShowNoAlert] = useState(false);

  const yesLabel = config.yes_label || "Sim";
  const noLabel = config.no_label || "Não";

  const handleNo = () => {
    if (config.no_alert_enabled) {
      setShowNoAlert(true);
    } else {
      onNext("nao", "nao");
    }
  };

  if (showNoAlert) {
    const alertTitle = config.no_alert_title || "Tem certeza?";
    const alertMessage = config.no_alert_message || "";
    const alertAudio = config.no_alert_audio_url || null;
    const confirmLabel = config.no_alert_confirm_label || "Tenho certeza";
    const cancelLabel = config.no_alert_cancel_label || "Vou reconsiderar";

    return (
      <div className="space-y-4 animate-fade-up">
        <h2 className="text-xl font-display font-bold text-foreground text-center">⚠️ {alertTitle}</h2>
        {alertMessage && <InlineGuidance message={alertMessage} audioUrl={alertAudio} />}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setShowNoAlert(false)}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-md hover:bg-primary/90 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onNext("nao", "nao")}
            className="w-full py-3 rounded-2xl bg-muted text-muted-foreground font-semibold text-sm hover:bg-muted/80 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <StepHeader node={{ ...node, label: config.question || node.label } as OracleFlowNode} answers={{}} />
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNext("sim", "sim")} className="py-4 rounded-2xl bg-primary/90 text-primary-foreground font-bold text-lg shadow-md hover:bg-primary transition">
          <span className="block">{yesLabel}</span>
          {config.yes_description && <span className="block text-xs font-normal opacity-80 mt-1">{config.yes_description}</span>}
        </button>
        <button onClick={handleNo} className="py-4 rounded-2xl bg-destructive/80 text-destructive-foreground font-bold text-lg shadow-md hover:bg-destructive transition">
          <span className="block">{noLabel}</span>
          {config.no_description && <span className="block text-xs font-normal opacity-80 mt-1">{config.no_description}</span>}
        </button>
      </div>
    </div>
  );
};

// ── OBI STEP (uses oracle_configs from DB) ──
const ObiStep = ({ node, onNext }: { node: OracleFlowNode; onNext: (h: string, a?: string) => void }) => {
  const { data: dbConfigs, isLoading } = useOracleConfigs();
  const config = node.config || {};
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const ICON_MAP: Record<string, string> = { danger: "⚡", warning: "⚖️", success: "✨", accent: "🕊️" };
  const COLOR_MAP: Record<string, string> = {
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-accent/15 text-accent-foreground",
    success: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
  };

  const configs = dbConfigs && dbConfigs.length > 0
    ? dbConfigs.map(c => ({ key: c.result_key, name: c.name, meaning: c.meaning, color_type: c.color_type, guidance_message: c.guidance_message, guidance_audio_url: c.guidance_audio_url }))
    : [
        { key: "oyekun", name: "Oyekun", meaning: "Nenhum aberto — NÃO", color_type: "danger", guidance_message: "", guidance_audio_url: null },
        { key: "okaran", name: "Okaran", meaning: "1 aberto — TALVEZ", color_type: "warning", guidance_message: "", guidance_audio_url: null },
        { key: "ejife", name: "Ejife", meaning: "2 abertos — SIM", color_type: "success", guidance_message: "", guidance_audio_url: null },
        { key: "etagun", name: "Etagun", meaning: "3 abertos — SIM FORTE", color_type: "success", guidance_message: "", guidance_audio_url: null },
        { key: "alafia", name: "Alafia", meaning: "Todos abertos — PAZ", color_type: "accent", guidance_message: "", guidance_audio_url: null },
      ];

  const selectedConfig = selectedKey ? configs.find(c => c.key === selectedKey) : null;
  const hasGuidance = selectedConfig?.guidance_message && selectedConfig.guidance_message.trim().length > 0;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (selectedKey && hasGuidance) {
    return (
      <div className="space-y-4 animate-fade-up">
        <h2 className="text-2xl font-display font-bold text-center">{selectedConfig!.name}</h2>
        <p className="text-center text-muted-foreground text-sm">{selectedConfig!.meaning}</p>
        <InlineGuidance message={selectedConfig!.guidance_message!} audioUrl={selectedConfig!.guidance_audio_url} />
        <button onClick={() => onNext(selectedKey, selectedKey)} className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg flex items-center justify-center gap-2">
          Continuar <ChevronRight className="h-5 w-5" />
        </button>
        <button onClick={() => setSelectedKey(null)} className="w-full text-sm text-muted-foreground hover:text-foreground">Voltar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <StepHeader node={node} answers={{}} />
      <div className="space-y-3">
        {configs.map((r) => (
          <button
            key={r.key}
            onClick={() => {
              if (r.guidance_message && r.guidance_message.trim().length > 0) setSelectedKey(r.key);
              else onNext(r.key, r.key);
            }}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${COLOR_MAP[r.color_type] || COLOR_MAP.accent}`}>
              <span className="text-xl">{ICON_MAP[r.color_type] || "🔮"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-base">{r.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{r.meaning}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── IRE/IBI STEP (uses ire_ibi_types from DB) ──
const IreIbiStep = ({ node, onNext, answers }: { node: OracleFlowNode; onNext: (h: string, a?: string) => void; answers: Record<string, string> }) => {
  const { data: types, isLoading } = useIreIbiTypes();
  const config = node.config || {};

  // Try to determine default category from previous obi answer
  const obiAnswer = Object.values(answers).find(a => ["alafia", "ejife", "etagun", "okaran", "oyekun"].includes(a));
  const ireResults = ["alafia", "ejife", "etagun"];
  const defaultCategory = obiAnswer && ireResults.includes(obiAnswer) ? "ire" : "ibi";

  const filteredTypes = types?.filter(t => t.category === defaultCategory) || [];

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (filteredTypes.length === 0) {
    // Fallback simple ire/ibi
    return (
      <div className="space-y-4 animate-fade-up">
        <StepHeader node={node} answers={answers} />
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNext("ire", "ire")} className="py-4 rounded-2xl bg-primary/90 text-primary-foreground font-bold text-lg shadow-md">Irê (Bom)</button>
          <button onClick={() => onNext("ibi", "ibi")} className="py-4 rounded-2xl bg-destructive/80 text-destructive-foreground font-bold text-lg shadow-md">Ibi (Ruim)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <StepHeader node={node} answers={answers} />
      <p className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: defaultCategory === "ire" ? "var(--primary-10, rgba(34,139,34,0.1))" : "var(--destructive-10, rgba(220,38,38,0.1))" }}>
        {defaultCategory === "ire" ? "✨ Irê" : "⚠️ Ibi"}
      </p>
      <div className="space-y-3">
        {filteredTypes.map((t) => (
          <IreIbiTypeCard key={t.id} type={t} onSelect={() => onNext(defaultCategory, `${defaultCategory}:${t.id}:${t.name}`)} />
        ))}
      </div>
    </div>
  );
};

const IreIbiTypeCard = ({ type, onSelect }: { type: any; onSelect: () => void }) => {
  const [showGuidance, setShowGuidance] = useState(false);
  const hasGuidance = type.guidance_message && type.guidance_message.trim().length > 0;

  if (showGuidance && hasGuidance) {
    return (
      <div className="animate-fade-up space-y-3">
        <h3 className="font-display font-bold text-lg">{type.name}</h3>
        <InlineGuidance message={type.guidance_message} audioUrl={type.guidance_audio_url} />
        <button onClick={onSelect} className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold">Continuar</button>
        <button onClick={() => setShowGuidance(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">Voltar</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => hasGuidance ? setShowGuidance(true) : onSelect()}
      className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-base">{type.name}</h3>
        {type.description && <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </button>
  );
};

// ── DIAGNOSIS STEP ──
interface DiagnosisTask {
  task_title: string;
  task_type: string;
  category: string;
  ritual_id?: string | null;
  ritual_ids?: string[];
  offering_id?: string | null;
  guidance_message?: string;
  guidance_audio_url?: string | null;
  condition: string;
}

function evaluateCondition(condition: string, answers: Record<string, string>): boolean {
  if (condition === "always") return true;
  
  const eqMatch = condition.match(/^answer_equals:(.+):(.+)$/);
  if (eqMatch) {
    const [, nodeId, value] = eqMatch;
    return answers[nodeId] === value;
  }
  
  const neqMatch = condition.match(/^answer_not_equals:(.+):(.+)$/);
  if (neqMatch) {
    const [, nodeId, value] = neqMatch;
    return answers[nodeId] !== value;
  }

  return false;
}

const DiagnosisStep = ({ node, answers, allNodes }: { node: OracleFlowNode; answers: Record<string, string>; allNodes: OracleFlowNode[] }) => {
  const { user } = useAuth();
  const addXP = useAddXP();
  const addJourneyEntry = useAddJourneyEntry();
  const createTasks = useCreateJourneyTasks();
  const { data: rituals } = useRituals();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [taskOfferingOverrides, setTaskOfferingOverrides] = useState<Record<number, string | null>>({});

  const config = node.config || {};
  const configTasks: DiagnosisTask[] = config.tasks || [];

  // Filter tasks by condition
  const tasks = configTasks.filter(t => evaluateCondition(t.condition, answers));

  const handleSave = async () => {
    if (!user || saving || saved) return;
    setSaving(true);
    try {
      const notes = `Diagnóstico via fluxo. Respostas: ${JSON.stringify(answers)}`;
      const obiResult = Object.values(answers).find(a => ["alafia", "ejife", "etagun", "okaran", "oyekun"].includes(a)) || "consulta";

      const entry = await addJourneyEntry.mutateAsync({
        oracle_result: obiResult,
        context: JSON.stringify(answers),
        notes,
      });

      if (entry) {
        const taskRows = tasks.map((t, i) => {
          const ritualIds = t.ritual_ids || (t.ritual_id ? [t.ritual_id] : []);
          const ritualId = ritualIds[0] || (rituals?.find(r => r.category === t.category)?.id) || undefined;
          return {
            journey_id: (entry as any).id,
            task_type: t.task_type,
            task_title: t.task_title,
            ritual_id: ritualId || undefined,
            offering_id: taskOfferingOverrides[i] ?? t.offering_id ?? undefined,
            guidance_message: t.guidance_message || "",
            guidance_audio_url: t.guidance_audio_url || null,
          };
        });
        await createTasks.mutateAsync(taskRows);
      }

      addXP.mutate({ xp: 15, field: "oracle_throws" });
      setSaved(true);
      setTimeout(() => navigate("/"), 1200);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <StepHeader node={node} answers={answers} />

      {/* Summary of answers */}
      <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
        <h3 className="font-display font-bold text-lg mb-3">Resumo da Consulta</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {Object.entries(answers).map(([key, answer]) => {
            // key is now variable_name or nodeId; try to find a readable label
            const srcNode = allNodes.find(n => n.id === key || (n.config as any)?.variable_name === key);
            const label = srcNode?.label || srcNode?.config?.question || key;
            return (
              <p key={key}>📿 <strong>{interpolateVars(label as string, answers)}:</strong> {answer}</p>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      {tasks.length > 0 && (
        <>
          <h3 className="font-display font-bold text-lg mb-1">Sua Rotina Espiritual</h3>
          <p className="text-xs text-muted-foreground mb-3">0 de {tasks.length} tarefas concluídas</p>
          <Progress value={0} className="h-2 mb-4" />

          <div className="space-y-2.5 mb-24">
            {tasks.map((t, i) => (
              <div key={i} className="p-3.5 bg-card rounded-2xl shadow-card animate-fade-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <img src={getCategoryImage(t.category)} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm">{interpolateVars(t.task_title, answers)}</h4>
                    <p className="text-[11px] text-muted-foreground">{getCategoryLabel(t.category)}</p>
                  </div>
                </div>
                {t.guidance_message && (
                  <TaskGuidanceBubble message={interpolateVars(t.guidance_message, answers)} audioUrl={t.guidance_audio_url} className="mt-2" />
                )}
                {/* Show linked rituals as buttons */}
                {(() => {
                  const ritualIds = t.ritual_ids || (t.ritual_id ? [t.ritual_id] : []);
                  return ritualIds.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ritualIds.map((id: string) => <LinkedRitualButton key={id} ritualId={id} />)}
                    </div>
                  ) : null;
                })()}
                <div className="mt-2 space-y-1">
                  <OfferingCombobox
                    value={taskOfferingOverrides[i] ?? t.offering_id ?? null}
                    onChange={(offeringId) => setTaskOfferingOverrides(prev => ({ ...prev, [i]: offeringId }))}
                    filterCategory={t.category}
                    placeholder="Vincular oferenda..."
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Nenhuma tarefa configurada para este diagnóstico.</p>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-10">
        <div className="max-w-lg mx-auto">
          {user ? (
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full bg-foreground text-background py-3.5 rounded-full font-medium text-sm disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</span>
              ) : saved ? (
                <span className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4" /> Salvo! Redirecionando...</span>
              ) : (
                "Iniciar Rotina"
              )}
            </button>
          ) : (
            <Link to="/auth" className="block text-center bg-foreground text-background py-3.5 rounded-full font-medium text-sm">
              Faça login para salvar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ── MEDIA STEP ──
const MediaStep = ({ node, config, onNext, answers }: { node: OracleFlowNode; config: Record<string, any>; onNext: (h: string) => void; answers?: Record<string, string> }) => {
  const mediaType = config.media_type || "image";
  const mediaUrl = config.media_url || "";
  const caption = config.caption || "";

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match?.[1] || "";
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <StepHeader node={node} answers={answers} />
      {mediaType === "youtube" && mediaUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(mediaUrl)}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : mediaUrl ? (
        <img src={mediaUrl} alt={caption || "Mídia"} className="w-full rounded-2xl object-cover max-h-80" />
      ) : null}
      {caption && <p className="text-sm text-muted-foreground text-center">{interpolateVars(caption, answers || {})}</p>}
      <button onClick={() => onNext("default")} className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg">
        Continuar
      </button>
    </div>
  );
};

// ── TIMER STEP ──
const TimerStep = ({ node, config, onNext, answers }: { node: OracleFlowNode; config: Record<string, any>; onNext: (h: string) => void; answers?: Record<string, string> }) => {
  const duration = (config.duration_seconds as number) || 10;
  const message = config.message || "Aguarde...";
  const [remaining, setRemaining] = useState(duration);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setRemaining(duration);
    setFinished(false);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duration]);

  const progress = ((duration - remaining) / duration) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-up text-center">
      <StepHeader node={node} answers={answers} />
      <p className="text-muted-foreground">{interpolateVars(message, answers || {})}</p>
      <div className="flex justify-center">
        <svg width="120" height="120" className="transform -rotate-90">
          <circle cx="60" cy="60" r="45" fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="60" cy="60" r="45" fill="none" strokeWidth="8"
            className="stroke-primary transition-all duration-1000"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute mt-10 text-3xl font-bold text-foreground">{remaining}s</span>
      </div>
      {finished ? (
        <button onClick={() => onNext("default")} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg animate-fade-up">
          Continuar
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">Aguarde o tempo expirar...</p>
      )}
    </div>
  );
};

// ── CONDITIONAL STEP (invisible — auto-advance) ──
const ConditionalStep = ({ config, onNext, answers }: { config: Record<string, any>; onNext: (h: string) => void; answers?: Record<string, string> }) => {
  const variableName = config.variable_name_to_evaluate || "";
  const conditions: Array<{ value: string; handle_id: string }> = config.conditions || [];
  const currentValue = answers?.[variableName] || "";

  useEffect(() => {
    const matched = conditions.find((c) => c.value.toLowerCase() === currentValue.toLowerCase());
    if (matched) {
      onNext(matched.handle_id);
    } else {
      onNext("else");
    }
  }, []);

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default FlowStepRenderer;
