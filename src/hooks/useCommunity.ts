import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useAdmin } from "./useAdmin";
import { useEffect } from "react";

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  reply_count: number;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
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
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((posts || []).map((p: any) => p.user_id))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        if (profiles) {
          for (const p of profiles) {
            profileMap[p.user_id] = p.display_name || "Anônimo";
          }
        }
      }

      // Get reply counts
      const postIds = (posts || []).map((p: any) => p.id);
      let replyCounts: Record<string, number> = {};
      if (postIds.length > 0) {
        const { data: replies } = await supabase
          .from("community_replies")
          .select("post_id")
          .in("post_id", postIds);
        if (replies) {
          for (const r of replies) {
            replyCounts[r.post_id] = (replyCounts[r.post_id] || 0) + 1;
          }
        }
      }

      return (posts || []).map((p: any) => ({
        ...p,
        author_name: profileMap[p.user_id] || "Anônimo",
        reply_count: replyCounts[p.id] || 0,
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
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        if (profiles) {
          for (const p of profiles) {
            profileMap[p.user_id] = p.display_name || "Anônimo";
          }
        }
      }

      return (data || []).map((r: any) => ({
        ...r,
        author_name: profileMap[r.user_id] || "Anônimo",
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
