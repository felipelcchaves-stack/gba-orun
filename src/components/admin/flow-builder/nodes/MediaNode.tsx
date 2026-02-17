import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Image } from "lucide-react";
import VariableBadge from "./VariableBadge";

const MediaNode = ({ data, selected }: NodeProps) => {
  const config = (data as any)?.config || {};
  const mediaType = config.media_type || "image";
  const url = config.media_url || "";
  const truncatedUrl = url.length > 30 ? url.slice(0, 30) + "…" : url;

  return (
    <div className={`min-w-[180px] rounded-2xl bg-card border-2 shadow-md ${selected ? "border-primary" : "border-border"}`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3" />
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <Image className="h-4 w-4 text-pink-500" />
        <span className="font-bold text-xs text-foreground">Mídia</span>
        <span className="text-[9px] text-muted-foreground ml-auto">{mediaType === "youtube" ? "YouTube" : "Imagem"}</span>
      </div>
      <VariableBadge variableName={config.variable_name} />
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {truncatedUrl || "Configure a URL..."}
        </p>
        {config.caption && (
          <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{config.caption}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!bg-accent !w-3 !h-3" />
    </div>
  );
};

export default MediaNode;
