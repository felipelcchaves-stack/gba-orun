import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAppSettings } from "./useAppSettings";

interface GuidanceBubble {
  point_key: string;
  message: string;
  audio_url: string | null;
  is_active: boolean;
}

export const useGuidanceBubble = (pointKey: string) => {
  const { data: settings } = useAppSettings();
  const avatarUrl = settings?.guidance_avatar_url || "";

  const { data, isLoading } = useQuery({
    queryKey: ["guidance_bubble", pointKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidance_bubbles")
        .select("point_key, message, audio_url, is_active")
        .eq("point_key", pointKey)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as GuidanceBubble | null;
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  return {
    message: data?.message || "",
    audio_url: data?.audio_url || null,
    avatar_url: avatarUrl,
    isLoading,
    hasGuidance: !!data?.message,
  };
};

export const useAllGuidanceBubbles = () => {
  return useQuery({
    queryKey: ["guidance_bubbles_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidance_bubbles")
        .select("*")
        .order("point_key");
      if (error) throw error;
      return data;
    },
  });
};
