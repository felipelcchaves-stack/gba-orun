import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useAddJourneyEntry, useCreateJourneyTasks } from "@/hooks/useJourney";
import { useRituals } from "@/hooks/useRituals";
import { getCategoryImage, getCategoryLabel } from "@/lib/categories";
import { OBI_RESULTS } from "./StepObiResult";
import { Progress } from "@/components/ui/progress";

export interface WizardState {
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
}

function generateTasks(state: WizardState): TaskDef[] {
  const tasks: TaskDef[] = [];
  const isIbi = state.ireOrIbi === "ibi";

  // Ebó tasks
  if (!state.eboApurado) {
    tasks.push({
      type: "ebo",
      title: isIbi ? "Fazer Ebó de Limpeza" : "Fazer Ebó de Agradecimento",
      category: "ebo",
    });
  } else if (state.eboTipo) {
    const label = state.eboTipo.charAt(0).toUpperCase() + state.eboTipo.slice(1);
    tasks.push({ type: "ebo", title: `Ebó de ${label}`, category: "ebo" });
  }

  // Ori tasks
  if (state.oriPrecisa) {
    if (state.oriAcao === "ibori" || state.oriAcao === "ambos") {
      tasks.push({ type: "ibori", title: "Ibori de Proteção", category: "ibori" });
    }
    if (state.oriAcao === "oracao" || state.oriAcao === "ambos") {
      tasks.push({ type: "oracao_ori", title: "Oração de Ori", category: "oracao_ori" });
    }
  }

  // Iyami tasks
  if (state.iyamiQuer) {
    tasks.push({ type: "oracao_iyami", title: "Oração de Iyami", category: "oracao_iyami" });
    tasks.push({ type: "cantiga", title: "Cantiga de Apaziguamento", category: "cantiga" });
  }

  // Egbe Orun tasks
  if (state.egbeOrunQuer) {
    tasks.push({ type: "egbe_orun", title: "Oferenda ao Egbe Orun", category: "egbe_orun" });
    tasks.push({ type: "cantiga", title: "Cantiga Sagrada", category: "cantiga" });
  }

  // Always add daily prayer
  if (isIbi) {
    tasks.push({ type: "oracao_noite", title: "Oração da Noite", category: "oracao_noite" });
  } else {
    tasks.push({ type: "oracao_manha", title: "Oração da Manhã", category: "oracao_manha" });
  }

  // Ire always gets oriki
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
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tasks = generateTasks(state);
  const obiResult = OBI_RESULTS.find(r => r.key === state.result);

  const handleSave = async () => {
    if (!user || saving || saved) return;
    setSaving(true);

    try {
      const contextJson = JSON.stringify({
        ireOrIbi: state.ireOrIbi,
        eboApurado: state.eboApurado,
        eboTipo: state.eboTipo,
        oriPrecisa: state.oriPrecisa,
        oriAcao: state.oriAcao,
        iyamiQuer: state.iyamiQuer,
        egbeOrunQuer: state.egbeOrunQuer,
      });

      const notes = `${obiResult?.name} em ${state.ireOrIbi === "ire" ? "Irê" : "Ibi"}. ` +
        `Ebó: ${state.eboApurado ? state.eboTipo : "pendente"}. ` +
        `Ori: ${state.oriPrecisa ? state.oriAcao : "ok"}. ` +
        `Iyami: ${state.iyamiQuer ? "sim" : "não"}. ` +
        `Egbe Orun: ${state.egbeOrunQuer ? "sim" : "não"}.`;

      const entry = await addJourneyEntry.mutateAsync({
        oracle_result: obiResult?.name || state.result,
        context: contextJson,
        notes,
      });

      if (entry) {
        const taskRows = tasks.map(t => {
          const matchRitual = rituals?.find(r => r.category === t.category);
          return {
            journey_id: (entry as any).id,
            task_type: t.type,
            task_title: t.title,
            ritual_id: matchRitual?.id,
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
      <h2 className="text-2xl font-display font-bold text-center mb-1">Diagnóstico Completo</h2>
      <p className="text-center text-muted-foreground text-sm mb-6">Resumo da sua consulta ao Obi</p>

      {/* Summary card */}
      <div className="bg-card rounded-2xl p-5 shadow-card mb-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${obiResult?.color}`}>
            {(() => { const Icon = obiResult?.icon || CheckCircle; return <Icon className="h-5 w-5" strokeWidth={1.5} />; })()}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">{obiResult?.name}</h3>
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
            className="flex items-center gap-3 p-3.5 bg-card rounded-2xl shadow-card animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <img src={getCategoryImage(t.category)} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-sm">{t.title}</h4>
              <p className="text-[11px] text-muted-foreground">{getCategoryLabel(t.category)}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
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
