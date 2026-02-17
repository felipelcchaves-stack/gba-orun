import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserKnowledge {
  knows_obi: boolean;
  knows_ebo: boolean;
  knows_ori: boolean;
  knows_iyami: boolean;
  knows_egbe_orun: boolean;
  ifa_status: string | null;
}

export const useOnboardingStatus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.onboarding_completed ?? false;
    },
    enabled: !!user,
  });
};

export const useSaveOnboarding = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      display_name?: string;
      religion?: string;
      gender?: string;
      knowledge: UserKnowledge;
    }) => {
      if (!user) throw new Error("Not logged in");

      // 1. Upsert user_knowledge
      const { error: knowledgeError } = await supabase
        .from("user_knowledge" as any)
        .upsert({
          user_id: user.id,
          knows_obi: params.knowledge.knows_obi,
          knows_ebo: params.knowledge.knows_ebo,
          knows_ori: params.knowledge.knows_ori,
          knows_iyami: params.knowledge.knows_iyami,
          knows_egbe_orun: params.knowledge.knows_egbe_orun,
          ifa_status: params.knowledge.ifa_status,
          onboarding_completed: true,
        } as any, { onConflict: "user_id" });
      if (knowledgeError) throw knowledgeError;

      // 2. Update profile
      const profileUpdates: Record<string, any> = { onboarding_completed: true };
      if (params.display_name) profileUpdates.display_name = params.display_name;
      if (params.religion) profileUpdates.religion = params.religion;
      if (params.gender) profileUpdates.gender = params.gender;
      profileUpdates.ifa_status = params.knowledge.ifa_status;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates as any)
        .eq("user_id", user.id);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
