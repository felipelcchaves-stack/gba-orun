import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfWeek, subWeeks, isAfter, isBefore, addWeeks } from "date-fns";

export type EnergyKey = "ebo" | "ori" | "iyami" | "egbe" | "egungun" | "orixa";

export const MIN_JOURNEYS = 15;

export const RITUAL_GUIDANCE: Record<EnergyKey, {
  ritual: string;
  intro: string;
  question: string;
  answerYes: string;
  answerNo: string;
}> = {
  ebo: {
    ritual: "consultar um Awó",
    intro: "O oráculo mostrou que conversar com um Awó (Babalawó/Ìyánífá) pode te ajudar bastante.",
    question: "Você já conversou com um Awó?",
    answerYes: "Que bom! Quando sentir que precisa, procure ele de novo.",
    answerNo: "Tudo bem, no seu tempo. Quando sentir que é a hora, procure um Awó pra te orientar.",
  },
  ori: {
    ritual: "Ìborí",
    intro: "O oráculo mostrou que sua cabeça (Orí) precisa de força. Um Ìborí pode ajudar.",
    question: "Você já fez Ìborí?",
    answerYes: "Que bom! Se sentir que precisa, converse com um Awó sobre isso.",
    answerNo: "Tudo bem, no seu tempo. Quando sentir que é a hora, um Awó pode te ajudar com o Ìborí.",
  },
  iyami: {
    ritual: "Ìmùlẹ̀",
    intro: "O oráculo mostrou que as Ìyàmi (as Mães) pedem mais atenção. Um Ìmùlẹ̀ pode ajudar.",
    question: "Você já fez Ìmùlẹ̀?",
    answerYes: "Que bom! Se sentir que precisa, converse com um Awó sobre isso.",
    answerNo: "Tudo bem, no seu tempo. Quando sentir que é a hora, um Awó pode te ajudar.",
  },
  egbe: {
    ritual: "assentar Ẹgbẹ́ Ọ̀run",
    intro: "O oráculo mostrou que seu Ẹgbẹ́ Ọ̀run precisa de cuidado. Assentar pode ajudar.",
    question: "Você já assentou seu Ẹgbẹ́ Ọ̀run?",
    answerYes: "Que bom! Se sentir que precisa, converse com um Awó sobre isso.",
    answerNo: "Tudo bem, no seu tempo. Quando sentir que é a hora, um Awó pode te orientar.",
  },
  egungun: {
    ritual: "assentar Egúngún",
    intro: "O oráculo mostrou que seus ancestrais pedem atenção. Assentar Egúngún pode ajudar.",
    question: "Você já assentou Egúngún?",
    answerYes: "Que bom! Se sentir que precisa, converse com um Awó sobre isso.",
    answerNo: "Tudo bem, no seu tempo. Quando sentir que é a hora, um Awó pode te orientar.",
  },
  orixa: {
    ritual: "assentar seu Òrìṣà",
    intro: "O oráculo mostrou que seu Òrìṣà quer mais atenção. Assentar pode ajudar.",
    question: "Você já assentou seu Òrìṣà?",
    answerYes: "Que bom! Se sentir que precisa, converse com um Awó sobre isso.",
    answerNo: "Tudo bem, no seu tempo. Quando sentir que é a hora, um Awó pode te orientar.",
  },
};

interface EnergyScore {
  key: EnergyKey;
  label: string;
  score: number;
  level: "equilibrado" | "atencao" | "critico";
  suggestion: string;
  color: string;
  total: number;
  completed: number;
}

interface WeeklyData {
  semana: string;
  ebo: number;
  ori: number;
  iyami: number;
  egbe: number;
  egungun: number;
  orixa: number;
}

const TASK_TYPE_MAP: Record<EnergyKey, string[]> = {
  ebo: ["ebo", "cuidado_espiritual"],
  ori: ["ibori", "oracao_ori", "oracao_manha", "oracao_noite", "meditacao"],
  iyami: ["iyami", "oracao_iyami", "oferenda_iyami", "imule"],
  egbe: ["egbe_orun", "oferenda_egbe"],
  egungun: ["egungun", "egupaka", "egun", "oferenda_egun", "oracao_egun"],
  orixa: ["orixa", "oriki", "cantiga", "oferenda_orixa", "orunmila"],
};

const KEYWORD_FALLBACK: Record<EnergyKey, string[]> = {
  ebo: ["ebo", "cuidado"],
  ori: ["ori", "oracao", "reza", "prece", "meditac", "ibori"],
  iyami: ["iyami", "mae", "mãe", "imule", "imulé"],
  egbe: ["egbe", "egbé"],
  egungun: ["egun", "ancestr", "egupaka", "oriodu", "ofé"],
  orixa: ["orixa", "orunmila", "oriki", "cantiga", "orin"],
};

function classifyByKeyword(taskType: string): EnergyKey | null {
  const lower = taskType.toLowerCase();
  for (const [key, keywords] of Object.entries(KEYWORD_FALLBACK)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return key as EnergyKey;
    }
  }
  return null;
}

const LABELS: Record<EnergyKey, string> = {
  ebo: "Ẹbọ",
  ori: "Orí",
  iyami: "Ìyàmi",
  egbe: "Ẹgbẹ́ Ọ̀run",
  egungun: "Egúngún",
  orixa: "Òrìṣà",
};

const COLORS: Record<EnergyKey, string> = {
  ebo: "hsl(25, 60%, 35%)",
  ori: "hsl(45, 90%, 52%)",
  iyami: "hsl(300, 100%, 25%)",
  egbe: "hsl(120, 40%, 38%)",
  egungun: "hsl(0, 0%, 40%)",
  orixa: "hsl(210, 70%, 45%)",
};

const SUGGESTIONS: Record<EnergyKey, Record<string, string>> = {
  ebo: {
    critico: "Seria bom conversar com um Awó",
    atencao: "Um Ẹbọ pode te ajudar",
    equilibrado: "Ẹbọ em dia! ✨",
  },
  ori: {
    critico: "Seu Orí precisa de força",
    atencao: "Um Ìborí pode te fazer bem",
    equilibrado: "Orí firme e forte! ✨",
  },
  iyami: {
    critico: "As Mães pedem atenção",
    atencao: "Reze para Ìyàmi",
    equilibrado: "Ìyàmi em paz! ✨",
  },
  egbe: {
    critico: "Seu Ẹgbẹ́ Ọ̀run pede cuidado",
    atencao: "Uma oferenda ao Ẹgbẹ́ pode ajudar",
    equilibrado: "Ẹgbẹ́ Ọ̀run feliz! ✨",
  },
  egungun: {
    critico: "Seus ancestrais pedem atenção",
    atencao: "Uma oferenda aos ancestrais faz bem",
    equilibrado: "Egúngún em paz! ✨",
  },
  orixa: {
    critico: "Seu Òrìṣà quer mais atenção",
    atencao: "Um Oríkì ou Orin alegra seu Òrìṣà",
    equilibrado: "Seu Òrìṣà está feliz! ✨",
  },
};

function calcScore(total: number, completed: number): number {
  if (total === 0) return 50;
  return Math.round(((total - completed) / total) * 100);
}

function getLevel(score: number, total: number): "equilibrado" | "atencao" | "critico" {
  if (total === 0) return "equilibrado";
  if (score > 70) return "critico";
  if (score >= 40) return "atencao";
  return "equilibrado";
}

export const useSpiritualAnalysis = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["spiritual-analysis", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch tasks and journey count in parallel
      const [tasksResult, journeyCountResult] = await Promise.all([
        supabase
          .from("journey_tasks")
          .select("task_type, completed, created_at")
          .eq("user_id", user.id),
        supabase
          .from("user_journey")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      const allTasks = tasksResult.data ?? [];
      const totalJourneys = journeyCountResult.count ?? 0;

      const taskEnergyMap = new Map<string, EnergyKey>();
      for (const [key, types] of Object.entries(TASK_TYPE_MAP)) {
        for (const t of types) {
          taskEnergyMap.set(t, key as EnergyKey);
        }
      }

      const energies: EnergyScore[] = (["ebo", "ori", "iyami", "egbe", "egungun", "orixa"] as EnergyKey[]).map((key) => {
        const relevant = allTasks.filter((t) => {
          if (taskEnergyMap.get(t.task_type) === key) return true;
          if (!taskEnergyMap.has(t.task_type)) {
            return classifyByKeyword(t.task_type) === key;
          }
          return false;
        });
        const total = relevant.length;
        const completed = relevant.filter((t) => t.completed).length;
        const score = calcScore(total, completed);
        const level = getLevel(score, total);

        return {
          key,
          label: LABELS[key],
          score,
          level,
          suggestion: SUGGESTIONS[key][level],
          color: COLORS[key],
          total,
          completed,
        };
      });

      const now = new Date();
      const weeklyData: WeeklyData[] = [];

      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = addWeeks(weekStart, 1);

        const weekTasks = allTasks.filter((t) => {
          const d = new Date(t.created_at);
          return isAfter(d, weekStart) && isBefore(d, weekEnd);
        });

        const row: any = { semana: `Sem ${4 - i}` };
        for (const key of ["ebo", "ori", "iyami", "egbe", "egungun", "orixa"] as EnergyKey[]) {
          const relevant = weekTasks.filter((t) => {
            if (taskEnergyMap.get(t.task_type) === key) return true;
            if (!taskEnergyMap.has(t.task_type)) {
              return classifyByKeyword(t.task_type) === key;
            }
            return false;
          });
          row[key] = calcScore(relevant.length, relevant.filter((t) => t.completed).length);
        }
        weeklyData.push(row as WeeklyData);
      }

      const energiesWithData = energies.filter((e) => e.total > 0);
      const mostUrgent = energiesWithData.length > 0
        ? [...energiesWithData].sort((a, b) => b.score - a.score)[0]
        : null;

      return { energies, weeklyData, mostUrgent, totalJourneys };
    },
    enabled: !!user,
  });
};
