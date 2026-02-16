import { useRitual } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PremiumLockModal from "@/components/PremiumLockModal";
import { useState } from "react";

const RitualReader = () => {
  const { id } = useParams<{ id: string }>();
  const { data: ritual, isLoading } = useRitual(id!);
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-5">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Ritual não encontrado.</p>
      </div>
    );
  }

  const isLocked = ritual.is_premium && !isPremium;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-sacred text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <div className="max-w-2xl mx-auto">
          <Link to="/rituais" className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 mb-4">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            {ritual.title}
            {ritual.is_premium && (
              <span className="text-sm bg-primary-foreground/20 px-3 py-1 rounded-full">Premium</span>
            )}
          </h1>
          <span className="inline-block mt-2 bg-primary-foreground/20 px-3 py-1 rounded-full text-sm capitalize">
            {ritual.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="max-w-2xl mx-auto bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm">
          {isLocked ? (
            <div className="text-center py-12">
              <Lock className="h-16 w-16 mx-auto text-accent mb-4" />
              <h3 className="font-display font-bold text-xl mb-2">Conteúdo Exclusivo</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Este ritual é exclusivo para membros premium.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="gradient-gold text-accent-foreground px-8 py-3 rounded-2xl font-bold shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Desbloquear Acesso
              </button>
            </div>
          ) : (
            <>
              {ritual.image_url && (
                <img
                  src={ritual.image_url}
                  alt={ritual.title}
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
              )}
              <div className="prose-ritual">
                <ReactMarkdown>{ritual.content_full}</ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default RitualReader;
