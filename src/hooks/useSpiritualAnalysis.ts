import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfWeek, subWeeks, isAfter, isBefore, addWeeks } from "date-fns";

type EnergyKey = "ebo" | "ori" | "iyami" | "egbe";

interface EnergyScore {
  key: EnergyKey;
  label: string;
  score: number; // 0-100, higher = needs more attention
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
}

const TASK_TYPE_MAP: Record<EnergyKey, string[]> = {
  ebo: ["ebo", "limpeza", "banho", "cuidado_espiritual"],
  ori: ["ibori", "oracao_ori", "oracao_manha", "oracao_noite", "meditacao", "oriki", "cantiga"],
  iyami: ["iyami", "oracao_iyami", "oferenda_iyami"],
  egbe: ["egbe_orun", "oferenda_egbe"],
};

// Fallback keywords for unmapped task types
const KEYWORD_FALLBACK: Record<EnergyKey, string[]> = {
  ebo: ["ebo", "limpeza", "banho", "sacudimento", "cuidado"],
  ori: ["ori", "oracao", "reza", "prece", "meditac", "oriki", "cantiga"],
  iyami: ["iyami", "mae", "mãe", "imule", "imulé"],
  egbe: ["egbe", "egbé"],
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
  ebo: "Ebó",
  ori: "Ori",
  iyami: "Iyami",
  egbe: "Egbe Orun",
};

const COLORS: Record<EnergyKey, string> = {
  ebo: "hsl(25, 60%, 35%)",
  ori: "hsl(45, 90%, 52%)",
  iyami: "hsl(300, 100%, 25%)",
  egbe: "hsl(120, 40%, 38%)",
};

const SUGGESTIONS: Record<EnergyKey, Record<string, string>> = {
  ebo: {
    critico: "Consulte um Awo (Babalawó/Iyanifá)",
    atencao: "Faça um Ebó de manutenção",
    equilibrado: "Ebó em dia! ✨",
  },
  ori: {
    critico: "Precisa de um Igbá Ori (assento de Ori)",
    atencao: "Faça um Ibori de fortalecimento",
    equilibrado: "Ori fortalecido! ✨",
  },
  iyami: {
    critico: "Considere fazer Imulé (pacto com as Mães)",
    atencao: "Faça orações para Iyami",
    equilibrado: "Iyami em paz! ✨",
  },
  egbe: {
    critico: "Considere fazer Idi Egbé (1ª mão de Egbé)",
    atencao: "Faça uma oferenda ao Egbé Orun",
    equilibrado: "Egbé Orun satisfeito! ✨",
  },
};

function calcScore(total: number, completed: number): number {
  if (total === 0) return 50; // Neutro (sem dados = não sabemos)
  return Math.round(((total - completed) / total) * 100);
}

function getLevel(score: number, total: number): "equilibrado" | "atencao" | "critico" {
  if (total === 0) return "equilibrado"; // Sem dados = não alarmar
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

      const { data: tasks, error } = await supabase
        .from("journey_tasks")
        .select("task_type, completed, created_at")
        .eq("user_id", user.id);

      if (error) throw error;
      const allTasks = tasks ?? [];

      // Build a lookup: for each task, determine which energy it belongs to
      const taskEnergyMap = new Map<string, EnergyKey>();

      // First pass: direct mapping
      for (const [key, types] of Object.entries(TASK_TYPE_MAP)) {
        for (const t of types) {
          taskEnergyMap.set(t, key as EnergyKey);
        }
      }

      // Calculate scores per energy
      const energies: EnergyScore[] = (["ebo", "ori", "iyami", "egbe"] as EnergyKey[]).map((key) => {
        const relevant = allTasks.filter((t) => {
          // Direct match
          if (taskEnergyMap.get(t.task_type) === key) return true;
          // Fallback: keyword match for unmapped types
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

      // Weekly evolution (last 4 weeks)
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
        for (const key of ["ebo", "ori", "iyami", "egbe"] as EnergyKey[]) {
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

      // Most urgent energy (only consider energies with actual data)
      const energiesWithData = energies.filter((e) => e.total > 0);
      const mostUrgent = energiesWithData.length > 0
        ? [...energiesWithData].sort((a, b) => b.score - a.score)[0]
        : null;

      return { energies, weeklyData, mostUrgent };
    },
    enabled: !!user,
  });
};
