import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowUpDown } from "lucide-react";

const IreIbiNode = ({ selected }: NodeProps) => (
  <div className={`min-w-[180px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
    <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
    <div className="px-4 py-2 border-b border-border flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-purple-500" />
      <span className="font-bold text-xs text-foreground">Seleção Irê / Ibi</span>
    </div>
    <div className="flex justify-between px-4 py-2">
      <div className="relative">
        <span className="text-[10px] text-green-600 font-semibold">Irê</span>
        <Handle type="source" position={Position.Bottom} id="ire" className="!bg-green-500 !w-3 !h-3 !left-2" />
      </div>
      <div className="relative">
        <span className="text-[10px] text-red-500 font-semibold">Ibi</span>
        <Handle type="source" position={Position.Bottom} id="ibi" className="!bg-red-500 !w-3 !h-3 !left-2" />
      </div>
    </div>
  </div>
);

export default IreIbiNode;
