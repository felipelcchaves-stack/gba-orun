import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";

const StartNode = ({ selected }: NodeProps) => (
  <div className={`px-5 py-3 rounded-2xl bg-primary text-primary-foreground shadow-lg border-2 ${selected ? "border-accent" : "border-transparent"} flex items-center gap-2`}>
    <Play className="h-5 w-5" />
    <span className="font-bold text-sm">Início</span>
    <Handle type="source" position={Position.Bottom} id="default" className="!bg-accent !w-3 !h-3" />
  </div>
);

export default StartNode;
