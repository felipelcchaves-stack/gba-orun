import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAvatarUpload = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not logged in");

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/avatar.${ext}`;

      // Upload (upsert)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url } as any)
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      return avatar_url;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto atualizada!");
    },
    onError: () => toast.error("Erro ao enviar foto."),
  });
};
