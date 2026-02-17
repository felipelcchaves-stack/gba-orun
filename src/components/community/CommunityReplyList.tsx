import { useReplies, useCreateReply, useDeleteReply, CommunityReply } from "@/hooks/useCommunity";
import { useAdmin } from "@/hooks/useAdmin";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  postId: string;
}

const CommunityReplyList = ({ postId }: Props) => {
  const { data: replies = [], isLoading } = useReplies(postId);
  const createReply = useCreateReply();
  const deleteReply = useDeleteReply();
  const { isAdmin } = useAdmin();
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    createReply.mutate({ postId, content: text.trim() });
    setText("");
  };

  return (
    <div className="mt-3 space-y-3">
      {isLoading ? (
        <div className="h-8 bg-muted/50 rounded animate-pulse" />
      ) : (
        replies.map((r: CommunityReply) => (
          <div key={r.id} className="flex gap-2 pl-2">
            <Avatar className="h-6 w-6 mt-0.5">
              {r.author_avatar && <AvatarImage src={r.author_avatar} alt={r.author_name || ""} />}
              <AvatarFallback className="text-[10px] bg-muted">
                {(r.author_name || "A")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium truncate">{r.author_name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: ptBR })}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteReply.mutate({ replyId: r.id, postId })}
                    className="ml-auto text-destructive/60 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-foreground/80 mt-0.5">{r.content}</p>
            </div>
          </div>
        ))
      )}

      <div className="flex gap-2 pt-1">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Responder..."
          className="min-h-[36px] h-9 text-xs resize-none rounded-xl"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSubmit}
          disabled={!text.trim() || createReply.isPending}
          className="shrink-0 h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CommunityReplyList;
