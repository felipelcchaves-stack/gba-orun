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
import MediaNode from "./nodes/MediaNode";
import TimerNode from "./nodes/TimerNode";
import ConditionalNode from "./nodes/ConditionalNode";
import NodePalette from "./NodePalette";
import NodeConfigPanel from "./NodeConfigPanel";
import AutoSaveIndicator from "./AutoSaveIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import {
  useFlowNodes,
  useFlowEdges,
  useSaveFlowCanvas,
  type OracleFlowNode,
  type OracleFlowEdge,
} from "@/hooks/useOracleFlows";
import { useFlowAutoSave } from "@/hooks/useFlowAutoSave";
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
  media: MediaNode,
  timer: TimerNode,
  conditional: ConditionalNode,
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
  timer: "timer",
  conditional: "condicional",
};

function generateVariableName(type: string, existingNodes: Node[]): string {
  const prefix = VARIABLE_PREFIXES[type];
  if (!prefix) return "";
  const existingNames = existingNodes
    .map((n) => (n.data as any)?.config?.variable_name)
    .filter(Boolean);
  if (type === "obi" || type === "ire_ibi") {
    if (!existingNames.includes(prefix)) return prefix;
  }
  let counter = 1;
  let candidate = type === "obi" || type === "ire_ibi" ? `${prefix}_${counter + 1}` : `${prefix}_${counter}`;
  if (type === "obi" || type === "ire_ibi") {
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
  const isMobile = useIsMobile();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loaded, setLoaded] = useState(false);

  // --- Save handler (extracted for reuse by auto-save) ---
  const handleSave = useCallback(async () => {
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

    const { nodeIdMap } = await saveCanvas.mutateAsync({ flowId, nodes: nodesPayload, edges: edgesPayload });

    setNodes((nds) =>
      nds.map((n) => ({ ...n, id: nodeIdMap[n.id] || n.id }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        source: nodeIdMap[e.source] || e.source,
        target: nodeIdMap[e.target] || e.target,
      }))
    );
  }, [nodes, edges, flowId, saveCanvas, setNodes, setEdges]);

  // --- Auto-save hook ---
  const {
    isDirty,
    hasDraft,
    status: autoSaveStatus,
    lastSavedAt,
    restoreDraft,
    dismissDraft,
    markClean,
  } = useFlowAutoSave({
    flowId,
    nodes,
    edges,
    loaded,
    onSave: handleSave,
    isSaving: saveCanvas.isPending,
  });

  // Load from DB
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

  const handleManualSave = async () => {
    try {
      await handleSave();
      markClean();
      toast.success("Fluxo salvo com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Restore draft handler
  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setNodes(draft.nodes);
      setEdges(draft.edges);
    }
  };

  const configPanelContent = selectedNode ? (
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
  ) : null;

  return (
    <>
      {/* Draft restoration dialog */}
      <AlertDialog open={hasDraft && loaded}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rascunho encontrado</AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos um rascunho não salvo deste fluxo. Deseja restaurá-lo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dismissDraft}>Descartar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>Restaurar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex gap-2 sm:gap-4 flex-1 min-h-0">
        {!isMobile && <NodePalette />}
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
          {isMobile && <NodePalette floating />}

          {/* Top-right controls: indicator + save button */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-3">
            <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />
            <button
              onClick={handleManualSave}
              disabled={saveCanvas.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saveCanvas.isPending ? "Salvando..." : "Salvar Fluxo"}
            </button>
          </div>
        </div>
        {isMobile ? (
          <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto p-4">
              {configPanelContent}
            </SheetContent>
          </Sheet>
        ) : (
          configPanelContent
        )}
      </div>
    </>
  );
};

const FlowBuilder = ({ flowId }: FlowBuilderProps) => (
  <ReactFlowProvider>
    <FlowBuilderInner flowId={flowId} />
  </ReactFlowProvider>
);

export default FlowBuilder;
