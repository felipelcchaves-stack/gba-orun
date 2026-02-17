import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";
import VariableBadge from "./VariableBadge";

const TimerNode = ({ data, selected }: NodeProps) => {
  const config = (data as any)?.config || {};
  const duration = config.duration_seconds || 10;

  return (
    <div className={`min-w-[180px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <Clock className="h-4 w-4 text-orange-500" />
        <span className="font-bold text-xs text-foreground">Timer</span>
        <span className="text-[9px] text-muted-foreground ml-auto">{duration}s</span>
      </div>
      <VariableBadge variableName={config.variable_name} />
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {config.message || "Configure a mensagem..."}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!bg-accent !w-3 !h-3" />
    </div>
  );
};

export default TimerNode;
