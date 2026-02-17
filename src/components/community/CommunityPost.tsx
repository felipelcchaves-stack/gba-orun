import { CommunityPost as PostType, useDeletePost } from "@/hooks/useCommunity";
import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CommunityReplyList from "./CommunityReplyList";

interface Props {
  post: PostType;
}

const CommunityPost = ({ post }: Props) => {
  const { isAdmin } = useAdmin();
  const deletePost = useDeletePost();
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
            {(post.author_name || "A")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{post.author_name}</span>
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <p className="text-sm text-foreground/90 mt-1.5 whitespace-pre-wrap">{post.content}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => deletePost.mutate(post.id)}
            className="text-destructive/50 hover:text-destructive transition-colors shrink-0 self-start"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-border/50 pt-2.5">
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.reply_count > 0 ? `${post.reply_count} resposta${post.reply_count > 1 ? "s" : ""}` : "Responder"}
        </button>
      </div>

      {showReplies && <CommunityReplyList postId={post.id} />}
    </div>
  );
};

export default CommunityPost;
