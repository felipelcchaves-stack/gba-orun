import { ACHIEVEMENT_MAP } from "@/hooks/useAchievements";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  badges: string[];
  level: number;
  maxBadges?: number;
}

const AuthorBadges = ({ badges, level, maxBadges = 3 }: Props) => {
  const visibleBadges = badges
    .map((key) => ACHIEVEMENT_MAP[key])
    .filter(Boolean)
    .slice(-maxBadges);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {level > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center rounded-full bg-primary/15 text-primary text-[9px] font-bold px-1.5 py-0.5 leading-none">
                Nv.{level}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Nível {level} ({(level - 1) * 100}+ XP)
            </TooltipContent>
          </Tooltip>
        )}
        {visibleBadges.map((ach) => (
          <Tooltip key={ach.key}>
            <TooltipTrigger asChild>
              <span className="text-[11px] cursor-default" title={ach.name}>
                {ach.icon}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {ach.icon} {ach.name} — {ach.description}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default AuthorBadges;
