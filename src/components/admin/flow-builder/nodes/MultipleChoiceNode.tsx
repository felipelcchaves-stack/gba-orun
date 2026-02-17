import { Handle, Position, type NodeProps } from "@xyflow/react";
import { List } from "lucide-react";
import VariableBadge from "./VariableBadge";

const MultipleChoiceNode = ({ data, selected }: NodeProps) => {
  const rawOptions: any[] = (data as any)?.config?.options || [];
  const options: string[] = rawOptions.map((o: any) => typeof o === "string" ? o : o?.label || "");
  return (
    <div className={`min-w-[180px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <List className="h-4 w-4 text-blue-500" />
        <span className="font-bold text-xs text-foreground">Escolha Múltipla</span>
      </div>
      <VariableBadge variableName={(data as any)?.config?.variable_name} />
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {(data as any)?.config?.question || "Configure as opções..."}
        </p>
      </div>
      <div className="flex flex-wrap gap-1 px-4 pb-2">
        {(options.length > 0 ? options : ["Opção 1", "Opção 2"]).map((opt, i) => (
          <div key={i} className="relative">
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{opt}</span>
            <Handle type="source" position={Position.Bottom} id={`option_${i}`} className="!bg-blue-500 !w-2.5 !h-2.5" style={{ left: "50%" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceNode;
