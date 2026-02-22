import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useFlowNodes, useFlowEdges, useOracleFlows, type OracleFlowNode } from "@/hooks/useOracleFlows";
import FlowStepRenderer from "./FlowStepRenderer";
import OracleProgressBar from "./OracleProgressBar";

interface DynamicFlowRunnerProps {
  flowId: string;
  onExit?: () => void;
}

const DynamicFlowRunner = ({ flowId, onExit }: DynamicFlowRunnerProps) => {
  const { data: nodes } = useFlowNodes(flowId);
  const { data: edges } = useFlowEdges(flowId);
  const { data: flows } = useOracleFlows();
  const currentFlow = flows?.find(f => f.id === flowId);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isDeadEnd, setIsDeadEnd] = useState(false);

  useEffect(() => {
    if (nodes && edges && nodes.length > 0 && !currentNodeId) {
      const startNode = nodes.find((n) => n.node_type === "start");
      if (startNode) {
        const outEdge = edges.find(
          (e) => e.source_node_id === startNode.id && (e.source_handle === "default" || e.source_handle === "")
        );
        if (outEdge) {
          setCurrentNodeId(outEdge.target_node_id);
        } else {
          setCurrentNodeId(startNode.id);
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

  const estimateRemainingSteps = useMemo(() => {
    if (!nodes || !edges || !currentNodeId) return 0;
    let count = 0;
    let nodeId: string | null = currentNodeId;
    const visited = new Set<string>();
    while (nodeId && count < 20) {
      if (visited.has(nodeId)) break;
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (!node || node.node_type === "diagnosis") break;
      const defaultEdge = edges.find(
        e => e.source_node_id === nodeId && (e.source_handle === "default" || e.source_handle === "")
      );
      const anyEdge = defaultEdge || edges.find(e => e.source_node_id === nodeId);
      if (anyEdge) {
        nodeId = anyEdge.target_node_id;
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [nodes, edges, currentNodeId]);

  const visitedCount = history.length + 1;
  const totalSteps = visitedCount + estimateRemainingSteps;

  const handleNext = (handleId: string, answer?: string) => {
    if (!edges || !currentNodeId) return;

    if (answer && currentNode) {
      const varName = (currentNode.config as any)?.variable_name || currentNodeId;
      setAnswers((prev) => ({ ...prev, [varName]: answer }));
    }

    const edge = edges.find(
      (e) => e.source_node_id === currentNodeId && e.source_handle === handleId
    );

    if (edge) {
      setIsDeadEnd(false);
      setHistory((prev) => [...prev, currentNodeId]);
      setCurrentNodeId(edge.target_node_id);
    } else {
      const defaultEdge = edges.find(
        (e) => e.source_node_id === currentNodeId && (e.source_handle === "default" || e.source_handle === "")
      );
      if (defaultEdge) {
        setIsDeadEnd(false);
        setHistory((prev) => [...prev, currentNodeId]);
        setCurrentNodeId(defaultEdge.target_node_id);
      } else {
        // Dead end detected
        setIsDeadEnd(true);
      }
    }
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentNodeId(prev);
    setIsDeadEnd(false);
  };

  const reset = () => {
    setCurrentNodeId(null);
    setHistory([]);
    setAnswers({});
    setIsDeadEnd(false);
  };

  if (!nodes || !edges || !currentNode) {
    return <p className="text-muted-foreground text-center py-12">Carregando fluxo...</p>;
  }

  return (
    <div>
      {!isDiagnosis && (
        <button
          onClick={history.length > 0 ? goBack : onExit}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
        </button>
      )}
      {isDiagnosis && (
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Nova consulta
        </button>
      )}

      {!isDiagnosis && (
        <OracleProgressBar currentStep={visitedCount} totalSteps={totalSteps} />
      )}

      <div className="animate-fade-up" key={currentNode.id}>
        <FlowStepRenderer
          node={currentNode}
          onNext={handleNext}
          answers={answers}
          allNodes={nodes}
          flowName={currentFlow?.name}
        />
      </div>

      {isDeadEnd && !isDiagnosis && (
        <div className="mt-6 p-4 rounded-2xl bg-card border border-border text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Este caminho chegou ao fim.</span>
          </div>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl gradient-sacred text-primary-foreground font-bold text-sm"
          >
            Nova Consulta
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicFlowRunner;
