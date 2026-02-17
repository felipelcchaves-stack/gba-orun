import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useFlowNodes, useFlowEdges, type OracleFlowNode } from "@/hooks/useOracleFlows";
import FlowStepRenderer from "./FlowStepRenderer";
import OracleProgressBar from "./OracleProgressBar";

interface DynamicFlowRunnerProps {
  flowId: string;
}

const DynamicFlowRunner = ({ flowId }: DynamicFlowRunnerProps) => {
  const { data: nodes } = useFlowNodes(flowId);
  const { data: edges } = useFlowEdges(flowId);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (nodes && edges && nodes.length > 0 && !currentNodeId) {
      const startNode = nodes.find((n) => n.node_type === "start");
      if (startNode) {
        // Auto-skip: follow the default edge out of Start
        const outEdge = edges.find(
          (e) => e.source_node_id === startNode.id && (e.source_handle === "default" || e.source_handle === "")
        );
        if (outEdge) {
          setCurrentNodeId(outEdge.target_node_id);
        } else {
          setCurrentNodeId(startNode.id); // fallback
        }
      } else {
        setCurrentNodeId(nodes[0].id);
      }
    }
  }, [nodes, edges, currentNodeId]);

  const currentNode = useMemo(
    () => nodes?.find((n) => n.id === currentNodeId) || null,
    [nodes, currentNodeId]
  );

  const isDiagnosis = currentNode?.node_type === "diagnosis";

  const totalNodes = nodes?.length || 1;
  const visitedCount = history.length + 1;

  const handleNext = (handleId: string, answer?: string) => {
    if (!edges || !currentNodeId) return;

    if (answer && currentNode) {
      setAnswers((prev) => ({ ...prev, [currentNodeId]: answer }));
    }

    const edge = edges.find(
      (e) => e.source_node_id === currentNodeId && e.source_handle === handleId
    );

    if (edge) {
      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(edge.target_node_id);
    } else {
      const defaultEdge = edges.find(
        (e) => e.source_node_id === currentNodeId && (e.source_handle === "default" || e.source_handle === "")
      );
      if (defaultEdge) {
        setHistory((prev) => [...prev, currentNodeId]);
        setCurrentNodeId(defaultEdge.target_node_id);
      }
    }
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentNodeId(prev);
  };

  const reset = () => {
    setCurrentNodeId(null);
    setHistory([]);
    setAnswers({});
  };

  if (!nodes || !edges || !currentNode) {
    return <p className="text-muted-foreground text-center py-12">Carregando fluxo...</p>;
  }

  return (
    <div>
      {history.length > 0 && !isDiagnosis && (
        <button onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
        </button>
      )}
      {isDiagnosis && (
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Nova consulta
        </button>
      )}

      {!isDiagnosis && history.length > 0 && (
        <OracleProgressBar currentStep={visitedCount} totalSteps={totalNodes} />
      )}

      <div className="animate-fade-up">
        <FlowStepRenderer
          node={currentNode}
          onNext={handleNext}
          answers={answers}
          allNodes={nodes}
        />
      </div>
    </div>
  );
};

export default DynamicFlowRunner;
