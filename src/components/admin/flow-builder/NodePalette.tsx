import { Play, MessageCircle, HelpCircle, List, Sparkles, ArrowUpDown, PenLine, ClipboardCheck } from "lucide-react";

const NODE_TYPES = [
  { type: "start", label: "Início", icon: Play, color: "text-primary" },
  { type: "message", label: "Mensagem", icon: MessageCircle, color: "text-primary" },
  { type: "yes_no", label: "Sim / Não", icon: HelpCircle, color: "text-amber-500" },
  { type: "multiple_choice", label: "Escolha Múltipla", icon: List, color: "text-blue-500" },
  { type: "obi", label: "Lançamento Obi", icon: Sparkles, color: "text-accent" },
  { type: "ire_ibi", label: "Irê / Ibi", icon: ArrowUpDown, color: "text-purple-500" },
  { type: "open_question", label: "Pergunta Aberta", icon: PenLine, color: "text-teal-500" },
  { type: "diagnosis", label: "Diagnóstico", icon: ClipboardCheck, color: "text-secondary-foreground" },
];

const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-1">
      <h3 className="text-xs font-bold text-foreground mb-2">Blocos</h3>
      {NODE_TYPES.map(({ type, label, icon: Icon, color }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab hover:bg-muted transition-colors text-sm"
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-foreground font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default NodePalette;
