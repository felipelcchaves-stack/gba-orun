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
    intro: "O oráculo percebe que seu caminho pode se beneficiar de uma consulta com um Awó (Babalawó/Ìyánífá).",
    question: "Você já teve a oportunidade de consultar um Awó?",
    answerYes: "Que bom! Considere uma nova consulta quando sentir necessidade.",
    answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que é o momento, busque a orientação de um Awó.",
  },
  ori: {
    ritual: "Ìborí",
    intro: "O oráculo percebe que seu Orí pode se beneficiar de um Ìborí (fortalecimento da cabeça).",
    question: "Você já teve a oportunidade de fazer Ìborí?",
    answerYes: "Que bom! Considere conversar com um Awó para fortalecer esse vínculo quando sentir necessidade.",
    answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que é o momento, um Awó pode te orientar sobre o Ìborí.",
  },
  iyami: {
    ritual: "Ìmùlẹ̀",
    intro: "O oráculo percebe que sua relação com Ìyàmi pode se beneficiar de um Ìmùlẹ̀ (pacto com as Mães).",
    question: "Você já teve a oportunidade de fazer Ìmùlẹ̀?",
    answerYes: "Que bom! Considere conversar com um Awó para fortalecer seu Ìmùlẹ̀ quando sentir necessidade.",
    answerNo: "Cada jornada tem seu tempo. Quando sentir que é o momento, um Awó pode te orientar sobre esse caminho.",
  },
  egbe: {
    ritual: "assentar Ẹgbẹ́ Ọ̀run",
    intro: "O oráculo percebe que sua conexão com Ẹgbẹ́ Ọ̀run pode se beneficiar de um assentamento.",
    question: "Você já teve a oportunidade de assentar Ẹgbẹ́ Ọ̀run?",
    answerYes: "Que bom! Considere conversar com um Awó para cuidar do seu Ẹgbẹ́ quando sentir necessidade.",
    answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que é o momento, um Awó pode te orientar.",
  },
  egungun: {
    ritual: "assentar Egúngún",
    intro: "O oráculo percebe que seus ancestrais pedem atenção. Assentar Egúngún pode fortalecer esse vínculo.",
    question: "Você já teve a oportunidade de assentar Egúngún?",
    answerYes: "Que bom! Considere conversar com um Awó para cuidar dos seus Egúngún quando sentir necessidade.",
    answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que é o momento, um Awó pode te orientar.",
  },
  orixa: {
    ritual: "assentar seu Òrìṣà",
    intro: "O oráculo percebe que sua devoção ao Òrìṣà pode se beneficiar de um assentamento.",
    question: "Você já teve a oportunidade de assentar seu Òrìṣà?",
    answerYes: "Que bom! Considere conversar com um Awó para fortalecer seu Òrìṣà quando sentir necessidade.",
    answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que é o momento, um Awó pode te orientar.",
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
    critico: "Consulte um Awó (Babalawó/Ìyánífá)",
    atencao: "Faça um Ẹbọ de manutenção",
    equilibrado: "Ẹbọ em dia! ✨",
  },
  ori: {
    critico: "Precisa de um Igbá Orí (assento de Orí)",
    atencao: "Faça um Ìborí de fortalecimento",
    equilibrado: "Orí fortalecido! ✨",
  },
  iyami: {
    critico: "Considere fazer Ìmùlẹ̀ (pacto com as Mães)",
    atencao: "Faça orações para Ìyàmi",
    equilibrado: "Ìyàmi em paz! ✨",
  },
  egbe: {
    critico: "Considere fazer Ìdí Ẹgbẹ́ (1ª mão de Ẹgbẹ́)",
    atencao: "Faça uma oferenda ao Ẹgbẹ́ Ọ̀run",
    equilibrado: "Ẹgbẹ́ Ọ̀run satisfeito! ✨",
  },
  egungun: {
    critico: "Cuide dos seus Egúngún com urgência",
    atencao: "Faça uma oferenda aos ancestrais",
    equilibrado: "Egúngún em paz! ✨",
  },
  orixa: {
    critico: "Fortaleça sua conexão com seu Òrìṣà",
    atencao: "Faça um Oríkì ou Orin",
    equilibrado: "Devoção aos Òrìṣà em dia! ✨",
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
