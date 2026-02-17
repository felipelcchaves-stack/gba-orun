interface XPBarProps {
  xp: number;
  level?: number;
}

const XPBar = ({ xp, level }: XPBarProps) => {
  const currentLevel = level ?? Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-secondary">Nível {currentLevel}</span>
        <span className="text-muted-foreground">{xpInLevel}/100 XP</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-secondary to-accent rounded-full transition-all duration-500"
          style={{ width: `${xpInLevel}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;
