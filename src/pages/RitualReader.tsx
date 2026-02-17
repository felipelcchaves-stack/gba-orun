import { useRitual } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PremiumLockModal from "@/components/PremiumLockModal";
import AudioPlayer from "@/components/AudioPlayer";
import { useState, useEffect, useRef } from "react";

const RitualReader = () => {
  const { id } = useParams<{ id: string }>();
  const { data: ritual, isLoading } = useRitual(id!);
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const addXP = useAddXP();
  const [showModal, setShowModal] = useState(false);
  const xpAdded = useRef(false);

  useEffect(() => {
    if (ritual && user && !xpAdded.current && !(ritual.is_premium && !isPremium)) {
      xpAdded.current = true;
      addXP.mutate({ xp: 20, field: "rituals_read" });
    }
  }, [ritual, user, isPremium]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-6 bg-background">
        <div className="max-w-2xl mx-auto pt-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-2xl mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Ritual não encontrado.</p>
      </div>
    );
  }

  const isLocked = ritual.is_premium && !isPremium;

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="px-6 pt-10">
        <div className="max-w-2xl mx-auto">
          <Link to="/rituais" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
          </Link>

          <div className="flex items-start gap-5 mb-8">
            {/* Circular image */}
            {ritual.image_url ? (
              <img src={ritual.image_url} alt={ritual.title} className="w-20 h-20 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted shrink-0" />
            )}
            <div>
              <h1 className="text-3xl font-display font-medium leading-tight">
                {ritual.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground capitalize">{ritual.category}</span>
                {ritual.is_premium && (
                  <span className="text-xs bg-accent/15 text-accent-foreground px-2.5 py-0.5 rounded-full font-medium">Premium</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <div className="max-w-2xl mx-auto">
          {isLocked ? (
            <div className="text-center py-16">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1.5} />
              <h3 className="font-display font-medium text-xl mb-2">Conteúdo Exclusivo</h3>
              <p className="text-muted-foreground text-sm mb-8">
                Este ritual é exclusivo para membros premium.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-foreground text-background px-8 py-3 rounded-full font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Desbloquear Acesso
              </button>
            </div>
          ) : (
            <>
              {(ritual as any).audio_url && (
                <div className="mb-8">
                  <AudioPlayer url={(ritual as any).audio_url} title="Ouvir este ritual" />
                </div>
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
