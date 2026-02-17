import { usePromotions, useTrackClick } from "@/hooks/usePromotions";
import { ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const PromotionsPage = () => {
  const { data: promotions, isLoading } = usePromotions(true);
  const trackClick = useTrackClick();

  const handleClick = (promo: any) => {
    trackClick.mutate(promo.id);
    window.open(promo.checkout_url, "_blank");
  };

  return (
    <div className="min-h-screen pb-24 px-6 bg-background">
      <div className="max-w-lg mx-auto pt-10 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Ofertas</h1>
          <p className="text-sm text-muted-foreground mt-1">Promoções exclusivas para você</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !promotions || promotions.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhuma oferta disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-card rounded-2xl overflow-hidden shadow-card border border-border">
                {promo.banner_url && (
                  <img
                    src={promo.banner_url}
                    alt={promo.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg">{promo.title}</h3>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                  )}
                  <Button onClick={() => handleClick(promo)} className="w-full gap-2">
                    <ExternalLink className="h-4 w-4" /> Acessar Oferta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;
