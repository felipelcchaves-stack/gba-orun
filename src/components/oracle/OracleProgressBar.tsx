import { Sparkles } from "lucide-react";

interface Props {
  currentStep: number;
  totalSteps?: number;
}

const OracleProgressBar = ({ currentStep, totalSteps = 6 }: Props) => {
  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="mb-6">
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, hsl(var(--gold)), hsl(var(--earth)))`,
          }}
        />
        {/* Sparkle icon at the tip */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out pointer-events-none"
          style={{ left: `calc(${progress}% - 8px)` }}
        >
          <Sparkles className="h-4 w-4 text-gold drop-shadow-sm" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Passo {currentStep} de {totalSteps}
      </p>
    </div>
  );
};

export default OracleProgressBar;
