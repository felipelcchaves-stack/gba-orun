import { usePosts, useCreatePost } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommunityPost from "@/components/community/CommunityPost";

const CommunityPage = () => {
  const { user } = useAuth();
  const { data: posts = [], isLoading } = usePosts();
  const createPost = useCreatePost();
  const [newPost, setNewPost] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6 gap-4 bg-background">
        <MessageCircle className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-muted-foreground text-center text-sm">Faça login para participar da comunidade.</p>
        <Link to="/auth" className="text-primary font-medium text-sm underline">Entrar</Link>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!newPost.trim()) return;
    createPost.mutate(newPost.trim());
    setNewPost("");
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold">Comunidade</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Troque experiências com outros alunos</p>
        </div>

        {/* New post */}
        <div className="bg-card rounded-2xl shadow-card p-4 mb-6">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Compartilhe algo com a comunidade..."
            className="min-h-[80px] text-sm resize-none rounded-xl border-border/50"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmit}
              disabled={!newPost.trim() || createPost.isPending}
              size="sm"
              className="rounded-full gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum post ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <CommunityPost key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
