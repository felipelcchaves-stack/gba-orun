import { Flame } from "lucide-react";

interface StreakCounterProps {
  days: number;
}

const StreakCounter = ({ days }: StreakCounterProps) => (
  <div className="flex items-center gap-2 bg-accent/20 rounded-full px-4 py-2">
    <Flame className="h-5 w-5 text-accent" />
    <span className="text-sm font-bold text-accent-foreground">
      {days} {days === 1 ? "dia" : "dias"}
    </span>
  </div>
);

export default StreakCounter;
