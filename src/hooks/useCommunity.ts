import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  author_name: string | null;
  author_avatar: string | null;
  reply_count: number;
  author_badges: string[];
  author_level: number;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  author_badges: string[];
  author_level: number;
}

// Shared helper: fetch badges & levels for a set of user IDs
async function fetchAuthorMeta(userIds: string[]) {
  const badgeMap: Record<string, string[]> = {};
  const levelMap: Record<string, number> = {};
  if (userIds.length === 0) return { badgeMap, levelMap };

  const [{ data: achievements }, { data: stats }] = await Promise.all([
    supabase.from("user_achievements").select("user_id, achievement_key").in("user_id", userIds),
    supabase.from("user_stats").select("user_id, xp_total").in("user_id", userIds),
  ]);

  if (achievements) {
    for (const a of achievements) {
      if (!badgeMap[a.user_id]) badgeMap[a.user_id] = [];
      badgeMap[a.user_id].push(a.achievement_key);
    }
  }
  if (stats) {
    for (const s of stats) {
      levelMap[s.user_id] = Math.floor((s.xp_total || 0) / 100) + 1;
    }
  }
  return { badgeMap, levelMap };
}

export const usePosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("community_posts_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["community_posts"],
    enabled: !!user,
    queryFn: async (): Promise<CommunityPost[]> => {
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((posts || []).map((p: any) => p.user_id))];
      let profileMap: Record<string, string> = {};
      let avatarMap: Record<string, string | null> = {};

      const profilePromise = userIds.length > 0
        ? supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds)
        : Promise.resolve({ data: null });

      const postIds = (posts || []).map((p: any) => p.id);
      const replyCountPromise = postIds.length > 0
        ? supabase.from("community_replies").select("post_id").in("post_id", postIds)
        : Promise.resolve({ data: null });

      const metaPromise = fetchAuthorMeta(userIds);

      const [{ data: profiles }, { data: replies }, { badgeMap, levelMap }] = await Promise.all([
        profilePromise, replyCountPromise, metaPromise,
      ]);

      if (profiles) {
        for (const p of profiles) {
          profileMap[p.user_id] = p.display_name || "Anônimo";
          avatarMap[p.user_id] = (p as any).avatar_url || null;
        }
      }

      let replyCounts: Record<string, number> = {};
      if (replies) {
        for (const r of replies) {
          replyCounts[r.post_id] = (replyCounts[r.post_id] || 0) + 1;
        }
      }

      return (posts || []).map((p: any) => ({
        ...p,
        author_name: profileMap[p.user_id] || "Anônimo",
        author_avatar: avatarMap[p.user_id] || null,
        reply_count: replyCounts[p.id] || 0,
        author_badges: badgeMap[p.user_id] || [],
        author_level: levelMap[p.user_id] || 1,
      }));
    },
  });
};

export const useReplies = (postId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !postId) return;
    const channel = supabase
      .channel(`replies_${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_replies", filter: `post_id=eq.${postId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["community_replies", postId] });
        queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, postId, queryClient]);

  return useQuery({
    queryKey: ["community_replies", postId],
    enabled: !!user && !!postId,
    queryFn: async (): Promise<CommunityReply[]> => {
      const { data, error } = await supabase
        .from("community_replies")
        .select("*")
        .eq("post_id", postId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];

      const profilePromise = userIds.length > 0
        ? supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds)
        : Promise.resolve({ data: null });

      const metaPromise = fetchAuthorMeta(userIds);

      const [{ data: profiles }, { badgeMap, levelMap }] = await Promise.all([
        profilePromise, metaPromise,
      ]);

      let profileMap: Record<string, string> = {};
      let avatarMap: Record<string, string | null> = {};
      if (profiles) {
        for (const p of profiles) {
          profileMap[p.user_id] = p.display_name || "Anônimo";
          avatarMap[p.user_id] = (p as any).avatar_url || null;
        }
      }

      return (data || []).map((r: any) => ({
        ...r,
        author_name: profileMap[r.user_id] || "Anônimo",
        author_avatar: avatarMap[r.user_id] || null,
        author_badges: badgeMap[r.user_id] || [],
        author_level: levelMap[r.user_id] || 1,
      }));
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("community_posts").insert({ content, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community_posts"] }),
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase.from("community_replies").insert({ post_id: postId, content, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community_replies", vars.postId] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("community_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community_posts"] }),
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, pinned }: { postId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: pinned } as any)
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community_posts"] }),
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replyId, postId }: { replyId: string; postId: string }) => {
      const { error } = await supabase.from("community_replies").delete().eq("id", replyId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community_replies", vars.postId] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    },
  });
};
