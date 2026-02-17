import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NodeConfigPanelProps {
  nodeId: string;
  nodeType: string;
  config: Record<string, any>;
  label: string;
  onUpdate: (nodeId: string, updates: { label?: string; config?: Record<string, any> }) => void;
  onClose: () => void;
}

const NodeConfigPanel = ({ nodeId, nodeType, config, label, onUpdate, onClose }: NodeConfigPanelProps) => {
  const [localLabel, setLocalLabel] = useState(label);
  const [localConfig, setLocalConfig] = useState<Record<string, any>>(config || {});

  useEffect(() => {
    setLocalLabel(label);
    setLocalConfig(config || {});
  }, [nodeId, label, config]);

  const save = () => {
    onUpdate(nodeId, { label: localLabel, config: localConfig });
  };

  const updateField = (key: string, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4 w-72">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Configurar Bloco</h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Título</label>
        <Input value={localLabel} onChange={(e) => setLocalLabel(e.target.value)} className="mt-1" />
      </div>

      {(nodeType === "message") && (
        <>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mensagem</label>
            <textarea
              value={localConfig.message || ""}
              onChange={(e) => updateField("message", e.target.value)}
              className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm min-h-[80px]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">URL do Áudio (opcional)</label>
            <Input value={localConfig.audio_url || ""} onChange={(e) => updateField("audio_url", e.target.value)} className="mt-1" />
          </div>
        </>
      )}

      {(nodeType === "yes_no") && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
          <textarea
            value={localConfig.question || ""}
            onChange={(e) => updateField("question", e.target.value)}
            className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm min-h-[60px]"
          />
        </div>
      )}

      {(nodeType === "open_question") && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
          <textarea
            value={localConfig.question || ""}
            onChange={(e) => updateField("question", e.target.value)}
            className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm min-h-[60px]"
          />
        </div>
      )}

      {(nodeType === "multiple_choice") && (
        <>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Pergunta</label>
            <textarea
              value={localConfig.question || ""}
              onChange={(e) => updateField("question", e.target.value)}
              className="w-full mt-1 rounded-lg border border-border bg-background p-2 text-sm min-h-[60px]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Opções</label>
            <div className="space-y-1 mt-1">
              {(localConfig.options || []).map((opt: string, i: number) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const updated = [...(localConfig.options || [])];
                      updated[i] = e.target.value;
                      updateField("options", updated);
                    }}
                    className="flex-1"
                  />
                  <button
                    onClick={() => {
                      const updated = (localConfig.options || []).filter((_: any, idx: number) => idx !== i);
                      updateField("options", updated);
                    }}
                    className="p-2 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateField("options", [...(localConfig.options || []), `Opção ${(localConfig.options?.length || 0) + 1}`])}
                className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              >
                <Plus className="h-3 w-3" /> Adicionar opção
              </button>
            </div>
          </div>
        </>
      )}

      <button onClick={save} className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
        Salvar
      </button>
    </div>
  );
};

export default NodeConfigPanel;
