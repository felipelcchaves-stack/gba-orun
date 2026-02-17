import { cn } from "@/lib/utils";

const STEP_LABELS = ["Obi", "Irê/Ibi", "Ebó", "Ori", "Iyami & Egbe", "Resultado"];

interface Props {
  currentStep: number;
  totalSteps?: number;
}

const OracleProgressBar = ({ currentStep, totalSteps = 6 }: Props) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isDone && "bg-primary text-primary-foreground",
                isActive && "bg-accent text-accent-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isDone && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? "✓" : step}
            </div>
            <span className={cn(
              "text-[10px] mt-1 text-center leading-tight hidden sm:block",
              isActive ? "text-foreground font-semibold" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      />
    </div>
  </div>
);

export default OracleProgressBar;
