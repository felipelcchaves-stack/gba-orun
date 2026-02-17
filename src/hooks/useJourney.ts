import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";

export const useJourney = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["journey", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_journey")
        .select("*, rituals(title, category, image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useAddJourneyEntry = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ oracle_result, suggested_ritual_id, context, notes }: { 
      oracle_result: string; 
      suggested_ritual_id?: string;
      context?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not logged in");
      const { data, error } = await supabase.from("user_journey").insert({
        user_id: user.id,
        oracle_result,
        suggested_ritual_id: suggested_ritual_id || null,
        context: context || "rotina_diaria",
        notes: notes || null,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey"] }),
  });
};

export const useCompleteJourney = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_journey").update({
        completed: true,
        completed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey"] }),
  });
};

// Journey Tasks hooks
export const useJourneyTasks = (journeyId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["journey-tasks", journeyId],
    queryFn: async () => {
      if (!user || !journeyId) return [];
      const { data, error } = await supabase
        .from("journey_tasks" as any)
        .select("*, rituals(title, category, image_url)")
        .eq("journey_id", journeyId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!journeyId,
  });
};

export const useCreateJourneyTasks = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: Array<{
      journey_id: string;
      task_type: string;
      task_title: string;
      ritual_id?: string;
      offering_id?: string;
      guidance_message?: string;
      guidance_audio_url?: string | null;
    }>) => {
      if (!user) throw new Error("Not logged in");
      const rows = tasks.map(t => ({
        ...t,
        user_id: user.id,
        ritual_id: t.ritual_id || null,
        offering_id: t.offering_id || null,
      }));
      const { error } = await supabase.from("journey_tasks" as any).insert(rows);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey-tasks"] }),
  });
};

export const useCompleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("journey_tasks" as any).update({
        completed: true,
        completed_at: new Date().toISOString(),
      }).eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey-tasks"] }),
  });
};

// Fetch all journey entries + tasks for a given month
export const useJourneyByMonth = (year: number, month: number) => {
  const { user } = useAuth();
  const monthDate = new Date(year, month);
  const start = startOfMonth(monthDate).toISOString();
  const end = endOfMonth(monthDate).toISOString();

  const entriesQuery = useQuery({
    queryKey: ["journey-month", user?.id, year, month],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_journey")
        .select("*, rituals(title, category, image_url)")
        .eq("user_id", user.id)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const tasksQuery = useQuery({
    queryKey: ["journey-month-tasks", user?.id, year, month],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("journey_tasks" as any)
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", start)
        .lte("created_at", end);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return { entries: entriesQuery.data ?? [], tasks: tasksQuery.data ?? [], isLoading: entriesQuery.isLoading || tasksQuery.isLoading };
};