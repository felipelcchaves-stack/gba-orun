import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";

type DeviceStatus = "loading" | "ok" | "mismatch" | "error";

export const useDeviceGuard = (userId: string | undefined, isAdmin: boolean) => {
  const [status, setStatus] = useState<DeviceStatus>("loading");

  useEffect(() => {
    if (!userId) { setStatus("loading"); return; }
    if (isAdmin) { setStatus("ok"); return; }

    const check = async () => {
      const fingerprint = getDeviceFingerprint();

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("device_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) { setStatus("error"); return; }

      const savedDevice = (profile as any)?.device_id as string | null;

      if (!savedDevice) {
        // First login — register device
        await supabase
          .from("profiles")
          .update({ device_id: fingerprint, device_changed_at: new Date().toISOString() } as any)
          .eq("user_id", userId);
        setStatus("ok");
      } else if (savedDevice === fingerprint) {
        setStatus("ok");
      } else {
        setStatus("mismatch");
      }
    };

    check();
  }, [userId, isAdmin]);

  const confirmDeviceChange = async () => {
    if (!userId) return;
    const fingerprint = getDeviceFingerprint();
    const { error } = await supabase
      .from("profiles")
      .update({ device_id: fingerprint, device_changed_at: new Date().toISOString() } as any)
      .eq("user_id", userId);
    if (!error) setStatus("ok");
  };

  return { status, confirmDeviceChange };
};
