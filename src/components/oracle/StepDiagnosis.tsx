import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useAddJourneyEntry, useCreateJourneyTasks } from "@/hooks/useJourney";
import { useRituals } from "@/hooks/useRituals";
import { getCategoryImage, getCategoryLabel } from "@/lib/categories";
import { useOracleConfigs, useOracleTaskTemplates } from "@/hooks/useOracleConfig";
import { getObiIcon, getObiColor, OBI_RESULTS_FALLBACK } from "./StepObiResult";
import { Progress } from "@/components/ui/progress";
import RitualCombobox from "@/components/RitualCombobox";
import RitualHelpButton from "@/components/RitualHelpButton";
import GuidanceBubble from "@/components/GuidanceBubble";
import TaskGuidanceBubble from "@/components/TaskGuidanceBubble";

export interface WizardState {
  intention: "cuidado_semanal" | "orientacao";
  result: string;
  ireOrIbi: "ire" | "ibi";
  eboApurado: boolean;
  eboTipo?: string;
  oriPrecisa: boolean;
  oriAcao?: string;
  iyamiQuer: boolean;
  egbeOrunQuer: boolean;
}

interface TaskDef {
  type: string;
  title: string;
  category: string;
  ritual_id?: string | null;
  guidance_message?: string;
  guidance_audio_url?: string | null;
}

function matchCondition(condition: string, state: WizardState): boolean {
  switch (condition) {
    case "always": return true;
    case "ebo_not_done": return !state.eboApurado;
    case "ebo_done": return state.eboApurado;
    case "ori_needs": return state.oriPrecisa;
    case "ori_needs_ibori": return state.oriPrecisa && (state.oriAcao === "ibori" || state.oriAcao === "ambos");
    case "ori_needs_oracao": return state.oriPrecisa && (state.oriAcao === "oracao" || state.oriAcao === "ambos");
    case "ori_needs_ambos": return state.oriPrecisa && state.oriAcao === "ambos";
    case "iyami_wants": return state.iyamiQuer;
    case "egbe_wants": return state.egbeOrunQuer;
    default: return false;
  }
}

// Fallback hardcoded tasks (same as old generateTasks)
function generateFallbackTasks(state: WizardState): TaskDef[] {
  const tasks: TaskDef[] = [];
  const isIbi = state.ireOrIbi === "ibi";

  if (!state.eboApurado) {
    tasks.push({ type: "ebo", title: isIbi ? "Fazer Ebó de Limpeza" : "Fazer Ebó de Agradecimento", category: "ebo" });
  } else if (state.eboTipo) {
    const label = state.eboTipo.charAt(0).toUpperCase() + state.eboTipo.slice(1);
    tasks.push({ type: "ebo", title: `Ebó de ${label}`, category: "ebo" });
  }

  if (state.oriPrecisa) {
    if (state.oriAcao === "ibori" || state.oriAcao === "ambos") tasks.push({ type: "ibori", title: "Ibori de Proteção", category: "ibori" });
    if (state.oriAcao === "oracao" || state.oriAcao === "ambos") tasks.push({ type: "oracao_ori", title: "Oração de Ori", category: "oracao_ori" });
  }

  if (state.iyamiQuer) {
    tasks.push({ type: "oracao_iyami", title: "Oração de Iyami", category: "oracao_iyami" });
    tasks.push({ type: "cantiga", title: "Cantiga de Apaziguamento", category: "cantiga" });
  }

  if (state.egbeOrunQuer) {
    tasks.push({ type: "egbe_orun", title: "Oferenda ao Egbe Orun", category: "egbe_orun" });
    tasks.push({ type: "cantiga", title: "Cantiga Sagrada", category: "cantiga" });
  }

  if (isIbi) {
    tasks.push({ type: "oracao_noite", title: "Oração da Noite", category: "oracao_noite" });
  } else {
    tasks.push({ type: "oracao_manha", title: "Oração da Manhã", category: "oracao_manha" });
  }

  if (!isIbi) {
    tasks.push({ type: "oriki", title: "Oriki de Agradecimento", category: "oriki" });
  }

  return tasks;
}

const StepDiagnosis = ({ state }: { state: WizardState }) => {
  const { user } = useAuth();
  const addXP = useAddXP();
  const addJourneyEntry = useAddJourneyEntry();
  const createTasks = useCreateJourneyTasks();
  const { data: rituals } = useRituals();
  const { data: dbConfigs } = useOracleConfigs();
  const { data: dbTemplates } = useOracleTaskTemplates();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [taskRitualOverrides, setTaskRitualOverrides] = useState<Record<number, string | null>>({});

  // Generate tasks from DB templates or fallback
  const tasks: TaskDef[] = (() => {
    if (!dbTemplates || dbTemplates.length === 0) return generateFallbackTasks(state);

    return dbTemplates
      .filter(t => {
        if (t.oracle_result_key && t.oracle_result_key !== state.result) return false;
        if (t.ire_or_ibi && t.ire_or_ibi !== state.ireOrIbi) return false;
        if ((t as any).intention && (t as any).intention !== state.intention) return false;
        if (!matchCondition(t.condition, state)) return false;
        return true;
      })
      .map(t => ({
        type: t.task_type,
        title: t.task_title,
        category: t.category,
        ritual_id: t.ritual_id,
        guidance_message: t.guidance_message || "",
        guidance_audio_url: t.guidance_audio_url,
      }));
  })();

  // Auto-suggest rituals based on category match
  useEffect(() => {
    if (!rituals || rituals.length === 0 || tasks.length === 0) return;
    const defaults: Record<number, string | null> = {};
    tasks.forEach((t, i) => {
      if (taskRitualOverrides[i] !== undefined) return; // already overridden
      const match = t.ritual_id
        ? rituals.find(r => r.id === t.ritual_id)
        : rituals.find(r => r.category === t.category);
      if (match) defaults[i] = match.id;
    });
    if (Object.keys(defaults).length > 0) {
      setTaskRitualOverrides(prev => ({ ...defaults, ...prev }));
    }
  }, [rituals, tasks.length]);
  // Get config from DB or fallback
  const obiConfig = dbConfigs?.find(c => c.result_key === state.result);
  const fallback = OBI_RESULTS_FALLBACK.find(r => r.key === state.result);
  const obiName = obiConfig?.name || fallback?.name || state.result;
  const obiColorType = obiConfig?.color_type || fallback?.color_type || "accent";
  const ObiIcon = getObiIcon(obiColorType);
  const obiColor = getObiColor(obiColorType);

  const handleSave = async () => {
    if (!user || saving || saved) return;
    setSaving(true);

    try {
      const contextJson = JSON.stringify({
        intention: state.intention,
        ireOrIbi: state.ireOrIbi,
        eboApurado: state.eboApurado,
        eboTipo: state.eboTipo,
        oriPrecisa: state.oriPrecisa,
        oriAcao: state.oriAcao,
        iyamiQuer: state.iyamiQuer,
        egbeOrunQuer: state.egbeOrunQuer,
      });

      const intentionLabel = state.intention === "cuidado_semanal" ? "Cuidado Semanal" : "Orientação";
      const notes = `[${intentionLabel}] ${obiName} em ${state.ireOrIbi === "ire" ? "Irê" : "Ibi"}. ` +
        `Ebó: ${state.eboApurado ? state.eboTipo : "pendente"}. ` +
        `Ori: ${state.oriPrecisa ? state.oriAcao : "ok"}. ` +
        `Iyami: ${state.iyamiQuer ? "sim" : "não"}. ` +
        `Egbe Orun: ${state.egbeOrunQuer ? "sim" : "não"}.`;

      const entry = await addJourneyEntry.mutateAsync({
        oracle_result: obiName,
        context: contextJson,
        notes,
      });

      if (entry) {
        const taskRows = tasks.map((t, i) => {
          const overrideId = taskRitualOverrides[i];
          const ritualId = overrideId !== undefined ? overrideId : (
            t.ritual_id
              ? rituals?.find(r => r.id === t.ritual_id)?.id
              : rituals?.find(r => r.category === t.category)?.id
          ) || undefined;
          return {
            journey_id: (entry as any).id,
            task_type: t.type,
            task_title: t.title,
            ritual_id: ritualId,
            guidance_message: t.guidance_message || "",
            guidance_audio_url: t.guidance_audio_url || null,
          };
        });
        await createTasks.mutateAsync(taskRows);
      }

      addXP.mutate({ xp: 15, field: "oracle_throws" });
      setSaved(true);
      setTimeout(() => navigate("/jornada"), 1200);
    } catch {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-display font-bold text-center flex-1">Diagnóstico Completo</h2>
        <RitualHelpButton point="oracle_step_diagnosis" />
      </div>
      <p className="text-center text-muted-foreground text-sm mb-4">Resumo da sua consulta ao Obi</p>

      <GuidanceBubble pointKey="oracle_step_diagnosis" className="mb-6" />

      {/* Summary card */}
      <div className="bg-card rounded-2xl p-5 shadow-card mb-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${obiColor}`}>
            <ObiIcon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">{obiName}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${state.ireOrIbi === "ire" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
              {state.ireOrIbi === "ire" ? "Irê" : "Ibi"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p>📿 Ebó: {state.eboApurado ? `Apurado (${state.eboTipo})` : "Pendente"}</p>
          <p>🧠 Ori: {state.oriPrecisa ? `Precisa (${state.oriAcao})` : "Verificado"}</p>
          <p>👁 Iyami: {state.iyamiQuer ? "Querem atenção" : "Em paz"}</p>
          <p>👥 Egbe Orun: {state.egbeOrunQuer ? "Querem oferenda" : "Satisfeitos"}</p>
        </div>
      </div>

      {/* Tasks */}
      <h3 className="font-display font-bold text-lg mb-1">Sua Rotina Espiritual</h3>
      <p className="text-xs text-muted-foreground mb-3">0 de {tasks.length} tarefas concluídas</p>
      <Progress value={0} className="h-2 mb-4" />

      <div className="space-y-2.5 mb-6">
        {tasks.map((t, i) => (
          <div
            key={i}
            className="p-3.5 bg-card rounded-2xl shadow-card animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <img src={getCategoryImage(t.category)} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-sm">{t.title}</h4>
                <p className="text-[11px] text-muted-foreground">{getCategoryLabel(t.category)}</p>
              </div>
            </div>
            {t.guidance_message && (
              <TaskGuidanceBubble message={t.guidance_message} audioUrl={t.guidance_audio_url} className="mt-2" />
            )}
            <div className="mt-2">
              <RitualCombobox
                value={taskRitualOverrides[i] ?? null}
                onChange={(ritualId) => setTaskRitualOverrides(prev => ({ ...prev, [i]: ritualId }))}
                filterCategory={t.category}
                placeholder="Vincular reza/ritual..."
              />
            </div>
          </div>
        ))}
      </div>

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
    </>
  );
};

export default StepDiagnosis;
