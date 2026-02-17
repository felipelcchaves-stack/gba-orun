import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  approved: boolean;
}

const AdminReviews = () => {
  const qc = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_reviews" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Review[];
    },
  });

  const toggleApproval = async (review: Review) => {
    const { error } = await supabase
      .from("user_reviews" as any)
      .update({ approved: !review.approved } as any)
      .eq("id", review.id);
    if (error) { toast.error(error.message); return; }
    toast.success(review.approved ? "Avaliação ocultada" : "Avaliação aprovada");
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
    qc.invalidateQueries({ queryKey: ["public_reviews"] });
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Excluir esta avaliação permanentemente?")) return;
    const { error } = await supabase
      .from("user_reviews" as any)
      .delete()
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Avaliação excluída");
    qc.invalidateQueries({ queryKey: ["admin_reviews"] });
    qc.invalidateQueries({ queryKey: ["public_reviews"] });
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Avaliações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {reviews?.length || 0} avaliações • {reviews?.filter(r => r.rating === 5 && r.approved).length || 0} com 5 estrelas na landing page
        </p>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-card rounded-2xl p-4 border ${r.approved ? "border-border" : "border-destructive/30 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-sm text-foreground">{r.display_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    {!r.approved && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Oculta</span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">"{r.review_text}"</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleApproval(r)} className="p-2 rounded-lg hover:bg-muted" title={r.approved ? "Ocultar" : "Aprovar"}>
                    {r.approved ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                  </button>
                  <button onClick={() => deleteReview(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Nenhuma avaliação ainda.</p>
      )}
    </div>
  );
};

export default AdminReviews;
