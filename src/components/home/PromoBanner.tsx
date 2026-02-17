import { Link } from "react-router-dom";
import { Tag, ExternalLink } from "lucide-react";
import { useHomeBannerPromotion, useTrackClick } from "@/hooks/usePromotions";

const PromoBanner = () => {
  const { data: promo, isLoading } = useHomeBannerPromotion();
  const trackClick = useTrackClick();

  if (isLoading || !promo) return null;

  const handleClick = () => {
    trackClick.mutate(promo.id);
  };

  const hasImage = !!promo.banner_url;

  return (
    <a
      href={promo.checkout_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block relative overflow-hidden rounded-2xl bg-accent/10 border border-accent/20 shadow-card hover:shadow-soft transition-all active:scale-[0.98]"
    >
      {hasImage ? (
        <div className="relative h-[140px]">
          <img
            src={promo.banner_url!}
            alt={promo.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <Tag className="h-3 w-3" /> Oferta
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display font-bold text-white text-base leading-snug">{promo.title}</h3>
            {promo.description && (
              <p className="text-white/80 text-xs mt-1 line-clamp-1">{promo.description}</p>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
            <ExternalLink className="h-4 w-4 text-white/70" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Tag className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Oferta</span>
            <h3 className="font-display font-bold text-foreground text-sm leading-snug">{promo.title}</h3>
            {promo.description && (
              <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{promo.description}</p>
            )}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      )}
    </a>
  );
};

export default PromoBanner;
