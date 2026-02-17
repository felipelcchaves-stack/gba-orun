import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StartNode from "./nodes/StartNode";
import MessageNode from "./nodes/MessageNode";
import YesNoNode from "./nodes/YesNoNode";
import MultipleChoiceNode from "./nodes/MultipleChoiceNode";
import ObiNode from "./nodes/ObiNode";
import IreIbiNode from "./nodes/IreIbiNode";
import OpenQuestionNode from "./nodes/OpenQuestionNode";
import DiagnosisNode from "./nodes/DiagnosisNode";
import NodePalette from "./NodePalette";
import NodeConfigPanel from "./NodeConfigPanel";

import {
  useFlowNodes,
  useFlowEdges,
  useSaveFlowCanvas,
  type OracleFlowNode,
  type OracleFlowEdge,
} from "@/hooks/useOracleFlows";
import { toast } from "sonner";
import { Save } from "lucide-react";

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  yes_no: YesNoNode,
  multiple_choice: MultipleChoiceNode,
  obi: ObiNode,
  ire_ibi: IreIbiNode,
  open_question: OpenQuestionNode,
  diagnosis: DiagnosisNode,
};

interface FlowBuilderProps {
  flowId: string;
}

const VARIABLE_PREFIXES: Record<string, string> = {
  obi: "resultado_obi",
  ire_ibi: "tipo_ire_ibi",
  yes_no: "pergunta",
  multiple_choice: "escolha",
  open_question: "resposta",
  diagnosis: "diagnostico",
};

function generateVariableName(type: string, existingNodes: Node[]): string {
  const prefix = VARIABLE_PREFIXES[type];
  if (!prefix) return "";
  // Unique names like resultado_obi, resultado_obi_2, etc.
  const existingNames = existingNodes
    .map((n) => (n.data as any)?.config?.variable_name)
    .filter(Boolean);
  if (type === "obi" || type === "ire_ibi") {
    // These are typically unique, but handle duplicates
    if (!existingNames.includes(prefix)) return prefix;
  }
  let counter = 1;
  let candidate = type === "obi" || type === "ire_ibi" ? `${prefix}_${counter + 1}` : `${prefix}_${counter}`;
  if (type === "obi" || type === "ire_ibi") {
    // first one is just the prefix
    if (!existingNames.includes(prefix)) return prefix;
  } else {
    candidate = `${prefix}_${counter}`;
  }
  while (existingNames.includes(candidate)) {
    counter++;
    candidate = `${prefix}_${counter}`;
  }
  return candidate;
}

const FlowBuilderInner = ({ flowId }: FlowBuilderProps) => {
  const { data: dbNodes } = useFlowNodes(flowId);
  const { data: dbEdges } = useFlowEdges(flowId);
  const saveCanvas = useSaveFlowCanvas();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (dbNodes && dbEdges && !loaded) {
      const rfNodes: Node[] = dbNodes.map((n) => ({
        id: n.id,
        type: n.node_type,
        position: { x: n.position_x, y: n.position_y },
        data: { label: n.label, config: n.config },
      }));
      const rfEdges: Edge[] = dbEdges.map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        sourceHandle: e.source_handle || undefined,
        label: e.label || undefined,
        animated: true,
      }));
      setNodes(rfNodes);
      setEdges(rfEdges);
      setLoaded(true);
    }
  }, [dbNodes, dbEdges, loaded]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const variableName = generateVariableName(type, nodes);
      const newNode: Node = {
        id: `temp_${Date.now()}`,
        type,
        position,
        data: { label: type === "start" ? "Início" : type === "diagnosis" ? "Diagnóstico" : "", config: variableName ? { variable_name: variableName } : {} },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  // Allow clicking ALL node types for configuration
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = (nodeId: string, updates: { label?: string; config?: Record<string, any> }) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: updates.label ?? (n.data as any).label, config: updates.config ?? (n.data as any).config } }
          : n
      )
    );
    setSelectedNode(null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const handleSave = async () => {
    const nodesPayload: Omit<OracleFlowNode, "id">[] = nodes.map((n) => ({
      flow_id: flowId,
      node_type: n.type || "message",
      label: (n.data as any)?.label || "",
      config: { ...((n.data as any)?.config || {}), _tempId: n.id },
      position_x: n.position.x,
      position_y: n.position.y,
    }));

    const edgesPayload: Omit<OracleFlowEdge, "id">[] = edges.map((e) => ({
      flow_id: flowId,
      source_node_id: e.source,
      target_node_id: e.target,
      source_handle: e.sourceHandle || "default",
      label: (e.label as string) || "",
    }));

    try {
      const { nodeIdMap } = await saveCanvas.mutateAsync({ flowId, nodes: nodesPayload, edges: edgesPayload });

      // Update local node IDs to match new DB IDs
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          id: nodeIdMap[n.id] || n.id,
        }))
      );

      // Update local edge source/target to match new DB IDs
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          source: nodeIdMap[e.source] || e.source,
          target: nodeIdMap[e.target] || e.target,
        }))
      );

      toast.success("Fluxo salvo com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex gap-4 h-[70vh]">
      <NodePalette />
      <div className="flex-1 rounded-xl border border-border overflow-hidden relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
        <button
          onClick={handleSave}
          disabled={saveCanvas.isPending}
          className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saveCanvas.isPending ? "Salvando..." : "Salvar Fluxo"}
        </button>
      </div>
      {selectedNode && (
        <NodeConfigPanel
          nodeId={selectedNode.id}
          nodeType={selectedNode.type || "message"}
          config={(selectedNode.data as any)?.config || {}}
          label={(selectedNode.data as any)?.label || ""}
          onUpdate={updateNodeData}
          onClose={() => setSelectedNode(null)}
          onDelete={deleteNode}
          availableVariables={nodes
            .filter((n) => n.id !== selectedNode.id && (n.data as any)?.config?.variable_name)
            .map((n) => ({
              name: (n.data as any).config.variable_name as string,
              nodeType: n.type || "message",
            }))}
        />
      )}
    </div>
  );
};

const FlowBuilder = ({ flowId }: FlowBuilderProps) => (
  <ReactFlowProvider>
    <FlowBuilderInner flowId={flowId} />
  </ReactFlowProvider>
);

export default FlowBuilder;
