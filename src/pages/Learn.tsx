import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link } from "react-router-dom";
import { Lock, BookOpen, Volume2, Bookmark } from "lucide-react";
import { useState } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";
import egbeOrunCategory from "@/assets/egbe-orun-category.jpg";
import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";

const MODULES = [
  { key: "", label: "Todos" },
  { key: "oriki", label: "Orikis" },
  { key: "ibori", label: "Ibori" },
  { key: "ebo", label: "Ebós" },
  { key: "geral", label: "Fundamentos" },
];

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory, iboriCategory, orikiCategory];

const LearnPage = () => {
  const [module, setModule] = useState("");
  const { data: rituals, isLoading } = useRituals(module || undefined);
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (ritual: any, e: React.MouseEvent) => {
    if (ritual.is_premium && !isPremium) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        <h1 className="text-3xl font-display font-bold mb-1">Aprender</h1>
        <p className="text-muted-foreground text-sm mb-6">Estude a sabedoria ancestral</p>

        {/* Module chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {MODULES.map(m => (
            <button
              key={m.key}
              onClick={() => setModule(m.key)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                module === m.key
                  ? "bg-foreground text-background"
                  : "bg-transparent border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="space-y-1">
            {rituals.map((ritual: any, i: number) => (
              <Link
                key={ritual.id}
                to={`/rituais/${ritual.id}`}
                onClick={(e) => handleClick(ritual, e)}
                className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0"
              >
                <img
                  src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                  alt={ritual.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate">{ritual.title}</h3>
                  <span className="text-xs text-muted-foreground capitalize mt-0.5 block">{ritual.category}</span>
                  <div className="flex items-center gap-3 mt-1">
                    {ritual.is_premium && !isPremium && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full font-medium">
                        <Lock className="h-2.5 w-2.5" /> Premium
                      </span>
                    )}
                    {ritual.audio_url && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Volume2 className="h-2.5 w-2.5" /> Áudio
                      </span>
                    )}
                  </div>
                </div>
                <Bookmark className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">Nenhum conteúdo disponível.</p>
          </div>
        )}
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LearnPage;
