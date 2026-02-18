import { Link } from "react-router-dom";
import { Compass, Sun } from "lucide-react";

interface TodayHeroCardProps {
  completedCount: number;
  totalCount: number;
  greeting: string;
}

const motivationalPhrases = [
  "Seu Ori agradece cada passo 🙏",
  "A ancestralidade caminha com você ✨",
  "Cada ritual fortalece seu axé 🌿",
  "Você está no caminho certo 🌟",
];

const TodayHeroCard = ({ completedCount, totalCount, greeting }: TodayHeroCardProps) => {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const phrase = motivationalPhrases[Math.floor(new Date().getHours() / 6) % motivationalPhrases.length];
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (totalCount === 0) {
    return (
      <div className="rounded-3xl p-6 gradient-sacred text-primary-foreground shadow-sacred mb-6">
        <p className="text-sm opacity-80 mb-1">{greeting}</p>
        <h2 className="text-xl font-display font-bold mb-3">Comece sua rotina espiritual</h2>
        <p className="text-sm opacity-70 mb-5">Consulte o Obi para receber suas orientações do dia.</p>
        <Link
          to="/oraculo"
          className="inline-flex items-center gap-2.5 bg-accent text-accent-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-gold hover:scale-[1.02] transition-transform animate-pulse-gold"
        >
          <Compass className="h-5 w-5" strokeWidth={2} />
          Consultar o Obi
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 gradient-sacred text-primary-foreground shadow-sacred mb-6">
      <p className="text-sm opacity-80 mb-1">{greeting}</p>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
            <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(0 0% 100% / 0.15)" strokeWidth="6" />
            <circle
              cx="48" cy="48" r="40" fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Sun className="h-4 w-4 mb-0.5 opacity-70" strokeWidth={1.5} />
            <span className="text-lg font-bold leading-none">{progress}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-display font-bold mb-1">Rotina de Hoje</h2>
          <p className="text-sm opacity-80 mb-2">
            {completedCount} de {totalCount} tarefa{totalCount !== 1 ? "s" : ""} concluída{completedCount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs opacity-60 italic">{phrase}</p>
        </div>
      </div>
    </div>
  );
};

export default TodayHeroCard;
