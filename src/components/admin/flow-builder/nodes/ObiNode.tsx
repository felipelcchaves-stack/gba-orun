import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles } from "lucide-react";

const OBI_RESULTS = ["alafia", "etawa", "ejife", "okaran", "oyekun"];

const ObiNode = ({ selected }: NodeProps) => (
  <div className={`min-w-[200px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
    <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
    <div className="px-4 py-2 border-b border-border flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-accent" />
      <span className="font-bold text-xs text-foreground">Lançamento de Obi</span>
    </div>
    <div className="flex flex-wrap gap-1 px-4 py-2">
      {OBI_RESULTS.map((r) => (
        <div key={r} className="relative">
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground capitalize">{r}</span>
          <Handle type="source" position={Position.Bottom} id={r} className="!bg-accent !w-2.5 !h-2.5" style={{ left: "50%" }} />
        </div>
      ))}
    </div>
  </div>
);

export default ObiNode;
