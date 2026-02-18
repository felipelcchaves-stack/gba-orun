import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles, Loader2 } from "lucide-react";
import VariableBadge from "./VariableBadge";
import { useOracleConfigs } from "@/hooks/useOracleConfig";

const ObiNode = ({ data, selected }: NodeProps) => {
  const { data: configs, isLoading } = useOracleConfigs();
  const results = configs?.map(c => c.result_key) || [];

  return (
    <div className={`min-w-[200px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="font-bold text-xs text-foreground">Lançamento de Obi</span>
      </div>
      <VariableBadge variableName={(data as any)?.config?.variable_name} />
      <div className="flex flex-wrap gap-1 px-4 py-2">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : results.length === 0 ? (
          <span className="text-[10px] text-muted-foreground">Sem odus configurados</span>
        ) : (
          results.map((r) => (
            <div key={r} className="relative">
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground capitalize">{r}</span>
              <Handle type="source" position={Position.Bottom} id={r} className="!bg-accent !w-2.5 !h-2.5" style={{ left: "50%" }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ObiNode;
