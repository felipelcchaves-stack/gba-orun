import { CommunityPost as PostType, useDeletePost, useTogglePin } from "@/hooks/useCommunity";
import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Trash2, Pin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CommunityReplyList from "./CommunityReplyList";
import AuthorBadges from "./AuthorBadges";

interface Props {
  post: PostType;
}

const CommunityPost = ({ post }: Props) => {
  const { isAdmin } = useAdmin();
  const deletePost = useDeletePost();
  const togglePin = useTogglePin();
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div
      className={`bg-card rounded-2xl shadow-card p-4 ${
        post.is_pinned
          ? "border-2 border-yellow-500/60 bg-yellow-50/30 dark:bg-yellow-900/10"
          : ""
      }`}
    >
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 mb-2">
          <Pin className="h-3.5 w-3.5 text-yellow-600 fill-yellow-500" />
          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
            Recado do Oluwo
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          {post.author_avatar && <AvatarImage src={post.author_avatar} alt={post.author_name || ""} />}
          <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
            {(post.author_name || "A")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold truncate">{post.author_name}</span>
            <AuthorBadges badges={post.author_badges} level={post.author_level} />
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <p className="text-sm text-foreground/90 mt-1.5 whitespace-pre-wrap">{post.content}</p>
        </div>
        {isAdmin && (
          <div className="flex flex-col gap-1 shrink-0 self-start">
            <button
              onClick={() => togglePin.mutate({ postId: post.id, pinned: !post.is_pinned })}
              className={`transition-colors ${
                post.is_pinned
                  ? "text-yellow-600 hover:text-yellow-700"
                  : "text-muted-foreground/50 hover:text-yellow-600"
              }`}
              title={post.is_pinned ? "Desfixar post" : "Fixar post"}
            >
              <Pin className={`h-4 w-4 ${post.is_pinned ? "fill-yellow-500" : ""}`} />
            </button>
            <button
              onClick={() => deletePost.mutate(post.id)}
              className="text-destructive/50 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
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
