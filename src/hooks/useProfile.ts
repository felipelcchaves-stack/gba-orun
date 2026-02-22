import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDemo } from "@/contexts/DemoContext";
import { demoProfile } from "@/lib/demoData";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  religion: string | null;
  care_day: number | null;
  is_premium: boolean;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  ifa_status: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ["profile", isDemo ? "demo" : user?.id],
    queryFn: async () => {
      if (isDemo) return demoProfile as Profile;
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data as Profile | null;
    },
    enabled: isDemo || !!user,
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { display_name?: string; religion?: string; care_day?: number | null; gender?: string | null; birth_date?: string | null; ifa_status?: string | null }) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("profiles")
        .update(updates as any)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar perfil."),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Senha alterada com sucesso!"),
    onError: (e: any) => toast.error(e.message || "Erro ao alterar senha."),
  });
};
