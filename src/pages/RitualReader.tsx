import { useRitual } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import PremiumLockModal from "@/components/PremiumLockModal";
import AudioPlayer from "@/components/AudioPlayer";
import GuidanceBubble from "@/components/GuidanceBubble";
import { useState, useEffect, useRef } from "react";

import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";

const RitualReader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const imageUrl = ritual.image_url || ritualPlaceholder1;

  return (
    <div className="min-h-screen pb-24 bg-card">
      {/* Header */}
      <div className="px-6 pt-10">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
          </button>

          {/* Card header with image */}
          <div className="flex items-center gap-4 mb-8 bg-background rounded-2xl p-4">
            <img src={imageUrl} alt={ritual.title} className="w-16 h-16 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold leading-tight truncate">
                {ritual.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground capitalize">{ritual.category}</span>
                {ritual.is_premium && (
                  <span className="text-[10px] bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full font-medium">Premium</span>
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
              <h3 className="font-display font-bold text-xl mb-2">Conteúdo Exclusivo</h3>
              <p className="text-muted-foreground text-sm mb-8">
                Este ritual é exclusivo para membros premium.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-foreground text-background px-8 py-3 rounded-full font-medium text-sm"
              >
                Desbloquear Acesso
              </button>
            </div>
          ) : (
            <>
              <GuidanceBubble pointKey="ritual_reader" className="mb-6" />
              {(ritual as any).audio_url && (
                <div className="mb-8">
                  <AudioPlayer url={(ritual as any).audio_url} title="Ouvir este ritual" />
                </div>
              )}
              <div className="prose-ritual">
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>{ritual.content_full}</ReactMarkdown>
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
