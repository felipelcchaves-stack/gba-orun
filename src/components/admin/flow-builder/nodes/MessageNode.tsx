import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageCircle } from "lucide-react";
import VariableBadge from "./VariableBadge";

const MessageNode = ({ data, selected }: NodeProps) => (
  <div className={`min-w-[180px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
    <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
    <div className="px-4 py-2 border-b border-border flex items-center gap-2">
      <MessageCircle className="h-4 w-4 text-primary" />
      <span className="font-bold text-xs text-foreground">Mensagem</span>
    </div>
    <VariableBadge variableName={(data as any)?.config?.variable_name} />
    <div className="px-4 py-2">
      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
        {(data as any)?.config?.message || "Configure a mensagem..."}
      </p>
    </div>
    <Handle type="source" position={Position.Bottom} id="default" className="!bg-accent !w-3 !h-3" />
  </div>
);

export default MessageNode;
