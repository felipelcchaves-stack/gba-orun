import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string;
}

const useAdminPosts = () =>
  useQuery({
    queryKey: ["admin-community-posts"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((posts || []).map(p => p.user_id))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        if (profiles) {
          for (const p of profiles) profileMap[p.user_id] = p.display_name || "Anônimo";
        }
      }

      return (posts || []).map(p => ({
        ...p,
        author_name: profileMap[p.user_id] || "Anônimo",
      })) as Post[];
    },
  });

const useAdminReplies = (postId: string | null) =>
  useQuery({
    queryKey: ["admin-community-replies", postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_replies")
        .select("*")
        .eq("post_id", postId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map(r => r.user_id))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        if (profiles) {
          for (const p of profiles) profileMap[p.user_id] = p.display_name || "Anônimo";
        }
      }

      return (data || []).map(r => ({
        ...r,
        author_name: profileMap[r.user_id] || "Anônimo",
      })) as Reply[];
    },
  });

const AdminCommunity = () => {
  const qc = useQueryClient();
  const { data: posts, isLoading } = useAdminPosts();
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { data: replies } = useAdminReplies(expandedPost);

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      // Delete replies first, then post
      await supabase.from("community_replies").delete().eq("post_id", id);
      const { error } = await supabase.from("community_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-community-posts"] });
      toast.success("Post excluído.");
    },
    onError: () => toast.error("Erro ao excluir post."),
  });

  const deleteReply = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_replies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-community-replies", expandedPost] });
      toast.success("Resposta excluída.");
    },
    onError: () => toast.error("Erro ao excluir resposta."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Comunidade</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderação de posts e respostas</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Autor</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-16">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando...</TableCell>
              </TableRow>
            ) : !posts?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum post encontrado.</TableCell>
              </TableRow>
            ) : (
              posts.map(post => (
                <>
                  <TableRow key={post.id}>
                    <TableCell>
                      <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                        {expandedPost === post.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{post.author_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(post.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { if (confirm("Excluir este post e todas as respostas?")) deletePost.mutate(post.id); }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedPost === post.id && (
                    <TableRow key={`${post.id}-replies`}>
                      <TableCell colSpan={5} className="bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Respostas</span>
                        </div>
                        {!replies?.length ? (
                          <p className="text-sm text-muted-foreground">Nenhuma resposta.</p>
                        ) : (
                          <div className="space-y-2">
                            {replies.map(reply => (
                              <div key={reply.id} className="flex items-start justify-between gap-3 bg-background rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium">{reply.author_name}</p>
                                  <p className="text-sm text-muted-foreground mt-0.5">{reply.content}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {format(new Date(reply.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { if (confirm("Excluir esta resposta?")) deleteReply.mutate(reply.id); }}
                                  className="text-destructive hover:text-destructive shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminCommunity;
