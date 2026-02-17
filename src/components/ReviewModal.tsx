import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
}

const ReviewModal = ({ open, onClose, onDismiss }: ReviewModalProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || "Usuário";
  const textLength = text.trim().length;
  const isValid = rating > 0 && textLength >= 20;

  const handleSubmit = async () => {
    if (!rating) { setRatingError(true); return; }
    if (textLength < 20) return;
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("user_reviews" as any).insert({
        user_id: user.id,
        display_name: displayName,
        rating,
        review_text: text.trim(),
      } as any);
      if (error) throw error;
      toast.success("Obrigado pela sua avaliação! 🙏");
      qc.invalidateQueries({ queryKey: ["user_review_exists"] });
      qc.invalidateQueries({ queryKey: ["public_reviews"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    onDismiss();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDismiss(); }}>
      <DialogContent className="max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Como você avalia o Gba-Orun?</DialogTitle>
          <DialogDescription>Sua opinião nos ajuda a melhorar!</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground font-medium">Seu nome</label>
            <p className="text-sm font-semibold text-foreground mt-1">{displayName}</p>
          </div>

          {/* Stars */}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Nota</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => { setRating(star); setRatingError(false); }}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {ratingError && <p className="text-xs text-destructive mt-1">Selecione uma nota</p>}
          </div>

          {/* Text */}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">
              Sua avaliação <span className="text-muted-foreground/60">(mínimo 20 caracteres)</span>
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Conte como tem sido sua experiência com o Gba-Orun..."
              className="min-h-[100px] rounded-xl"
              maxLength={500}
            />
            <p className={`text-xs mt-1 ${textLength < 20 ? "text-muted-foreground" : "text-primary"}`}>
              {textLength}/500 {textLength < 20 && `(faltam ${20 - textLength})`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1 rounded-xl"
            >
              Agora não
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
