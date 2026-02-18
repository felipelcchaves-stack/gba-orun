import { Lock, Volume2, UtensilsCrossed } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import type { Offering } from "@/hooks/useOfferings";

import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";
import eboCategory from "@/assets/ebo-category.jpg";

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory];

interface OfferingCardProps {
  offering: Offering;
  index: number;
  isPremium: boolean;
  onClick: () => void;
}

const OfferingCard = ({ offering, index, isPremium, onClick }: OfferingCardProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0 w-full text-left"
    >
      <div className="relative w-16 h-16 shrink-0">
        <img
          src={offering.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
          alt={offering.title}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <UtensilsCrossed className="h-3 w-3 text-accent-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sm truncate">{offering.title}</h3>
        <span className="text-xs text-muted-foreground mt-0.5 block">
          {getCategoryLabel(offering.category)}
        </span>
        <div className="flex items-center gap-3 mt-1">
          {offering.is_premium && !isPremium && (
            <span className="inline-flex items-center gap-1 text-[10px] text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full font-medium">
              <Lock className="h-2.5 w-2.5" /> Premium
            </span>
          )}
          {offering.audio_url && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Volume2 className="h-2.5 w-2.5" /> Áudio
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default OfferingCard;
