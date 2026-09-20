import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { demoUser } from "@/lib/demoData";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isDemo } = useDemo();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Supabase re-fires onAuthStateChange (e.g. SIGNED_IN again) on redundant
    // events like the tab regaining focus. Only replace `user` when the
    // underlying id actually changed, so effects keyed on [user] don't
    // re-run and cause a visible refresh/loading flash.
    const applySession = (session: any, isInitial = false) => {
      if (!isMounted) return;
      const newUserId = session?.user?.id ?? null;
      if (newUserId !== lastUserIdRef.current) {
        lastUserIdRef.current = newUserId;
        setUser(session?.user ?? null);
      }
      if (isInitial) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => applySession(session)
    );

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session, true));

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isDemo]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signOut };
};
