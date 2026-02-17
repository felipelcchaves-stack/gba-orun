import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ClipboardCheck } from "lucide-react";
import VariableBadge from "./VariableBadge";

const DiagnosisNode = ({ data, selected }: NodeProps) => (
  <div className={`min-w-[180px] rounded-2xl bg-secondary border-2 shadow-md ${selected ? "border-primary" : "border-transparent"}`}>
    <div className="flex items-center gap-2 px-5 py-3">
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <ClipboardCheck className="h-5 w-5 text-secondary-foreground" />
      <span className="font-bold text-sm text-secondary-foreground">Diagnóstico Final</span>
    </div>
    <VariableBadge variableName={(data as any)?.config?.variable_name} />
  </div>
);

export default DiagnosisNode;
