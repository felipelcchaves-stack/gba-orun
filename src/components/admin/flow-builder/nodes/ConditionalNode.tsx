import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ConditionalNode = ({ data, selected }: NodeProps) => {
  const config = (data as any)?.config || {};
  const variableName = config.variable_name_to_evaluate || "";
  const conditions: Array<{ value: string; handle_id: string }> = config.conditions || [];

  return (
    <div className={`min-w-[180px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-cyan-500" />
        <span className="font-bold text-xs text-foreground">Condicional</span>
      </div>
      <div className="px-4 py-2 space-y-1.5">
        {variableName ? (
          <p className="text-[10px] font-mono text-primary">{`{{${variableName}}}`}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Configure a variável...</p>
        )}
        {conditions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {conditions.map((c, i) => (
              <Badge key={i} variant="secondary" className="text-[9px]">
                {c.value || "?"}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {/* Dynamic handles for each condition */}
      {conditions.map((c, i) => (
        <Handle
          key={c.handle_id || `cond_${i}`}
          type="source"
          position={Position.Bottom}
          id={c.handle_id || `cond_${i}`}
          className="!bg-cyan-500 !w-3 !h-3"
          style={{ left: `${((i + 1) / (conditions.length + 1)) * 100}%` }}
        />
      ))}
      {/* Fallback/else handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="else"
        className="!bg-muted-foreground !w-3 !h-3"
        style={{ left: conditions.length > 0 ? `${((conditions.length + 1) / (conditions.length + 2)) * 100}%` : '50%' }}
      />
    </div>
  );
};

export default ConditionalNode;
