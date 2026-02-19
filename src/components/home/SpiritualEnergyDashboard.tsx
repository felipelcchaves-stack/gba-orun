import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, AlertCircle, Compass, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSpiritualAnalysis, RITUAL_GUIDANCE, MIN_JOURNEYS, type EnergyKey } from "@/hooks/useSpiritualAnalysis";
import { motion, AnimatePresence } from "framer-motion";

const levelIcon = {
  critico: <AlertTriangle className="h-4 w-4 text-destructive" />,
  atencao: <AlertCircle className="h-4 w-4 text-accent" />,
  equilibrado: <CheckCircle className="h-4 w-4 text-leaf" />,
};

const levelBg = {
  critico: "bg-destructive/10",
  atencao: "bg-accent/10",
  equilibrado: "bg-leaf/10",
};

type GuidanceAnswer = "sim" | "nao" | null;

const SpiritualEnergyDashboard = () => {
  const { data, isLoading } = useSpiritualAnalysis();
  const [answers, setAnswers] = useState<Record<string, GuidanceAnswer>>({});

  if (isLoading || !data) return null;

  const { energies, mostUrgent, totalJourneys } = data;
  const showGuidance = (totalJourneys ?? 0) >= MIN_JOURNEYS;

  const hasNoData = energies.every((e) => e.total === 0);

  if (hasNoData) {
    return (
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-accent" />
            Equilíbrio Espiritual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Compass className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground mb-1">Você ainda não começou!</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Use o Oráculo e veja aqui como está sua espiritualidade.</p>
            <Link
              to="/oraculo"
              className="inline-block text-xs font-semibold py-2 px-5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Consultar Oráculo
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAnswer = (key: EnergyKey, answer: GuidanceAnswer) => {
    setAnswers((prev) => ({ ...prev, [key]: answer }));
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Compass className="h-5 w-5 text-accent" />
          Equilíbrio Espiritual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {energies.map((e) => (
          <div key={e.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {levelIcon[e.level]}
                <span className="text-sm font-semibold">{e.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {e.completed} de {e.total} feitos
              </span>
            </div>
            <div className="relative">
              <Progress
                value={100 - e.score}
                className="h-3 rounded-full bg-muted"
                style={{
                  // @ts-ignore
                  "--progress-color": e.color,
                }}
              />
              <div
                className="absolute inset-0 h-3 rounded-full transition-all"
                style={{
                  width: `${100 - e.score}%`,
                  backgroundColor: e.color,
                  opacity: 0.85,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{e.suggestion}</p>

            {/* Interactive guidance for fragile axes after 15+ journeys */}
            {showGuidance && e.level !== "equilibrado" && e.total > 0 && (
              <GuidanceCard
                energyKey={e.key}
                answer={answers[e.key] ?? null}
                onAnswer={(a) => handleAnswer(e.key, a)}
              />
            )}
          </div>
        ))}

        {/* Most urgent suggestion (only if no guidance shown for it already) */}
        {mostUrgent && mostUrgent.level !== "equilibrado" && !showGuidance && (
          <div className={`rounded-xl p-4 mt-2 ${levelBg[mostUrgent.level]}`}>
            <div className="flex items-start gap-3">
              {levelIcon[mostUrgent.level]}
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {mostUrgent.label} precisa de um cuidado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mostUrgent.suggestion}
                </p>
              </div>
            </div>
            <Link
              to="/oraculo"
              className="mt-3 block text-center text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Consultar Oráculo
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface GuidanceCardProps {
  energyKey: EnergyKey;
  answer: GuidanceAnswer;
  onAnswer: (a: GuidanceAnswer) => void;
}

const GuidanceCard = ({ energyKey, answer, onAnswer }: GuidanceCardProps) => {
  const guidance = RITUAL_GUIDANCE[energyKey];

  return (
    <div className="rounded-xl bg-muted/40 p-3.5 mt-1 space-y-2.5">
      <div className="flex items-start gap-2">
        <Heart className="h-4 w-4 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
        <p className="text-xs text-foreground/80 leading-relaxed">
          {guidance.intro}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {answer === null ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium text-foreground/70 pl-6">
              {guidance.question}
            </p>
            <div className="flex gap-2 pl-6">
              <button
                onClick={() => onAnswer("sim")}
                className="text-xs px-4 py-1.5 rounded-lg border border-border text-foreground/70 hover:bg-muted/60 transition-colors"
              >
                Já fiz
              </button>
              <button
                onClick={() => onAnswer("nao")}
                className="text-xs px-4 py-1.5 rounded-lg border border-border text-foreground/70 hover:bg-muted/60 transition-colors"
              >
                Ainda não
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pl-6"
          >
            <p className="text-xs text-foreground/70 leading-relaxed italic">
              {answer === "sim" ? guidance.answerYes : guidance.answerNo}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpiritualEnergyDashboard;
