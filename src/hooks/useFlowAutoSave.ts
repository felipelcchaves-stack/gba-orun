import { useCallback, useEffect, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";

interface DraftData {
  nodes: Node[];
  edges: Edge[];
  savedAt: number;
}

interface UseFlowAutoSaveOptions {
  flowId: string;
  nodes: Node[];
  edges: Edge[];
  loaded: boolean;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const DRAFT_KEY = (id: string) => `flow_draft_${id}`;
const DEBOUNCE_MS = 3000;
const COOLDOWN_MS = 5000;

export function useFlowAutoSave({
  flowId,
  nodes,
  edges,
  loaded,
  isSaving,
}: UseFlowAutoSaveOptions) {
  const [isDirty, setIsDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving">("saved");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanSnapshotRef = useRef<string>("");
  const cooldownUntilRef = useRef<number>(0);

  // Update status derived from isDirty + isSaving
  useEffect(() => {
    if (isSaving) setStatus("saving");
    else if (isDirty) setStatus("dirty");
    else setStatus("saved");
  }, [isDirty, isSaving]);

  // Check for existing draft on mount
  useEffect(() => {
    if (!flowId) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY(flowId));
      if (raw) {
        const parsed: DraftData = JSON.parse(raw);
        setHasDraft(true);
        setDraftData(parsed);
      }
    } catch {
      // invalid draft, ignore
    }
  }, [flowId]);

  // Take a clean snapshot once data loads from DB
  useEffect(() => {
    if (loaded && nodes.length > 0) {
      cleanSnapshotRef.current = JSON.stringify({ nodes, edges });
    }
  }, [loaded]); // only on initial load

  // Debounced localStorage save + dirty detection
  useEffect(() => {
    if (!loaded) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Skip dirty detection during cooldown (after markClean)
      if (Date.now() < cooldownUntilRef.current) return;

      const current = JSON.stringify({ nodes, edges });
      const dirty = current !== cleanSnapshotRef.current;
      setIsDirty(dirty);

      if (dirty) {
        try {
          const draft: DraftData = { nodes, edges, savedAt: Date.now() };
          localStorage.setItem(DRAFT_KEY(flowId), JSON.stringify(draft));
        } catch {
          // storage full, ignore
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nodes, edges, loaded, flowId]);

  // beforeunload protection
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const restoreDraft = useCallback(() => {
    setHasDraft(false);
    return draftData;
  }, [draftData]);

  const dismissDraft = useCallback(() => {
    setHasDraft(false);
    setDraftData(null);
    try {
      localStorage.removeItem(DRAFT_KEY(flowId));
    } catch {}
  }, [flowId]);

  const markClean = useCallback(() => {
    // Cancel any pending debounce to prevent phantom draft
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Set cooldown so next debounce cycles are ignored while IDs stabilize
    cooldownUntilRef.current = Date.now() + COOLDOWN_MS;

    cleanSnapshotRef.current = JSON.stringify({ nodes, edges });
    setIsDirty(false);
    setLastSavedAt(new Date());
    try {
      localStorage.removeItem(DRAFT_KEY(flowId));
    } catch {}
  }, [flowId, nodes, edges]);

  return {
    isDirty,
    hasDraft,
    status,
    lastSavedAt,
    restoreDraft,
    dismissDraft,
    markClean,
  };
}
