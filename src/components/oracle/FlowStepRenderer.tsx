import { useState } from "react";
import { type OracleFlowNode } from "@/hooks/useOracleFlows";
import AudioPlayer from "@/components/AudioPlayer";

interface FlowStepRendererProps {
  node: OracleFlowNode;
  onNext: (handleId: string, answer?: string) => void;
}

const FlowStepRenderer = ({ node, onNext }: FlowStepRendererProps) => {
  const config = node.config || {};
  const [openAnswer, setOpenAnswer] = useState("");

  if (node.node_type === "start") {
    return (
      <div className="text-center space-y-6 animate-fade-up">
        <h2 className="text-2xl font-display font-bold text-foreground">Início da Consulta</h2>
        <button onClick={() => onNext("default")} className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg">
          Começar
        </button>
      </div>
    );
  }

  if (node.node_type === "message") {
    return (
      <div className="space-y-6 animate-fade-up">
        {node.label && <h2 className="text-xl font-display font-bold text-foreground">{node.label}</h2>}
        {config.message && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{config.message}</p>}
        {config.audio_url && <AudioPlayer url={config.audio_url} />}
        <button onClick={() => onNext("default")} className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg">
          Continuar
        </button>
      </div>
    );
  }

  if (node.node_type === "yes_no") {
    return (
      <div className="space-y-6 animate-fade-up">
        <h2 className="text-xl font-display font-bold text-foreground">{config.question || node.label}</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNext("sim", "sim")} className="py-4 rounded-2xl bg-green-600 text-white font-bold text-lg shadow-md hover:bg-green-700 transition">
            Sim
          </button>
          <button onClick={() => onNext("nao", "nao")} className="py-4 rounded-2xl bg-red-500 text-white font-bold text-lg shadow-md hover:bg-red-600 transition">
            Não
          </button>
        </div>
      </div>
    );
  }

  if (node.node_type === "multiple_choice") {
    const options: string[] = config.options || [];
    return (
      <div className="space-y-6 animate-fade-up">
        <h2 className="text-xl font-display font-bold text-foreground">{config.question || node.label}</h2>
        <div className="space-y-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onNext(`option_${i}`, opt)}
              className="w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition text-left px-5"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (node.node_type === "obi") {
    const obiResults = [
      { key: "alafia", label: "Alafiá", emoji: "🕊️" },
      { key: "etawa", label: "Etawa", emoji: "⚖️" },
      { key: "ejife", label: "Ejifé", emoji: "✨" },
      { key: "okaran", label: "Okanrán", emoji: "⚡" },
      { key: "oyekun", label: "Oyekun", emoji: "🌑" },
    ];
    return (
      <div className="space-y-6 animate-fade-up">
        <h2 className="text-xl font-display font-bold text-foreground">Resultado do Obi</h2>
        <p className="text-muted-foreground">Selecione o resultado do lançamento:</p>
        <div className="space-y-3">
          {obiResults.map((r) => (
            <button
              key={r.key}
              onClick={() => onNext(r.key, r.key)}
              className="w-full py-3 rounded-2xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition text-left px-5 flex items-center gap-3"
            >
              <span className="text-xl">{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (node.node_type === "ire_ibi") {
    return (
      <div className="space-y-6 animate-fade-up">
        <h2 className="text-xl font-display font-bold text-foreground">Irê ou Ibi?</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNext("ire", "ire")} className="py-4 rounded-2xl bg-green-600 text-white font-bold text-lg shadow-md hover:bg-green-700 transition">
            Irê (Bom)
          </button>
          <button onClick={() => onNext("ibi", "ibi")} className="py-4 rounded-2xl bg-red-500 text-white font-bold text-lg shadow-md hover:bg-red-600 transition">
            Ibi (Ruim)
          </button>
        </div>
      </div>
    );
  }

  if (node.node_type === "open_question") {
    return (
      <div className="space-y-6 animate-fade-up">
        <h2 className="text-xl font-display font-bold text-foreground">{config.question || node.label}</h2>
        <textarea
          value={openAnswer}
          onChange={(e) => setOpenAnswer(e.target.value)}
          placeholder="Digite sua resposta..."
          className="w-full rounded-2xl border border-border bg-background p-4 text-foreground min-h-[100px]"
        />
        <button
          onClick={() => { if (openAnswer.trim()) onNext("default", openAnswer.trim()); }}
          disabled={!openAnswer.trim()}
          className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    );
  }

  if (node.node_type === "diagnosis") {
    return (
      <div className="space-y-6 animate-fade-up text-center">
        <h2 className="text-2xl font-display font-bold text-foreground">Diagnóstico Completo</h2>
        <p className="text-muted-foreground">Sua consulta foi finalizada. As respostas foram registradas.</p>
      </div>
    );
  }

  return <p className="text-muted-foreground">Tipo de bloco desconhecido: {node.node_type}</p>;
};

export default FlowStepRenderer;
