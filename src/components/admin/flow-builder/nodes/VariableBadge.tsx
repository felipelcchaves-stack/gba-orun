import { Badge } from "@/components/ui/badge";

interface VariableBadgeProps {
  variableName?: string;
}

const VariableBadge = ({ variableName }: VariableBadgeProps) => {
  if (!variableName) return null;
  return (
    <div className="px-4 pb-1.5">
      <Badge variant="secondary" className="text-[9px] font-mono bg-primary/10 text-primary border-primary/20">
        🏷️ {variableName}
      </Badge>
    </div>
  );
};

export default VariableBadge;
