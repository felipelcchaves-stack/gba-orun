import { useRituals } from "@/hooks/useRituals";
import { useOfferings, type Offering } from "@/hooks/useOfferings";
import { usePremium } from "@/hooks/usePremium";
import { Link } from "react-router-dom";
import { Lock, BookOpen, Volume2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";
import OfferingCard from "@/components/learn/OfferingCard";
import OfferingDetailModal from "@/components/learn/OfferingDetailModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FILTER_CATEGORIES, CATEGORY_BANNERS, getCategoryLabel } from "@/lib/categories";

import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";
import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory, iboriCategory, orikiCategory];

const CategoryChips = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {FILTER_CATEGORIES.map(m => (
      <button
        key={m.key}
        onClick={() => onChange(m.key)}
        className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all ${
          value === m.key
            ? "bg-foreground text-background"
            : "bg-transparent border border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        {m.label}
      </button>
    ))}
  </div>
);

const LearnPage = () => {
  const [ritualFilter, setRitualFilter] = useState("");
  const [offeringFilter, setOfferingFilter] = useState("");
  const { data: rituals, isLoading: loadingRituals } = useRituals(ritualFilter || undefined);
  const { data: offerings, isLoading: loadingOfferings } = useOfferings(offeringFilter || undefined);
  const { isPremium } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);

  const handleRitualClick = (ritual: any, e: React.MouseEvent) => {
    if (ritual.is_premium && !isPremium) {
      e.preventDefault();
      setShowPremiumModal(true);
    }
  };

  const handleOfferingClick = (offering: Offering) => {
    if (offering.is_premium && !isPremium) {
      setShowPremiumModal(true);
    } else {
      setSelectedOffering(offering);
    }
  };

  const ListSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl shadow-card animate-pulse" />)}
    </div>
  );

  const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div className="text-center py-20">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        <h1 className="text-3xl font-display font-bold mb-1">Aprender</h1>
        <p className="text-muted-foreground text-sm mb-6">Sabedoria ancestral ao seu alcance</p>

        <Tabs defaultValue="rituais">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="rituais" className="flex-1">Rituais</TabsTrigger>
            <TabsTrigger value="oferendas" className="flex-1">Oferendas</TabsTrigger>
          </TabsList>

          {/* ===== ABA RITUAIS ===== */}
          <TabsContent value="rituais">
            <CategoryChips value={ritualFilter} onChange={setRitualFilter} />
            <div className="mt-4">
              {ritualFilter === "" ? (
                <div className="space-y-3">
                  {CATEGORY_BANNERS.map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setRitualFilter(b.key)}
                      className="w-full flex items-center rounded-2xl overflow-hidden bg-card shadow-card h-[90px] text-left transition-transform active:scale-[0.98]"
                    >
                      <div className="flex-1 min-w-0 px-4">
                        <h3 className="font-display font-bold text-sm truncate">{b.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{b.desc}</p>
                      </div>
                      <img src={b.image} alt={b.label} className="w-[100px] h-full object-cover shrink-0" />
                    </button>
                  ))}
                </div>
              ) : loadingRituals ? <ListSkeleton /> : rituals && rituals.length > 0 ? (
                <div className="space-y-1">
                  {rituals.map((ritual: any, i: number) => (
                    <Link
                      key={ritual.id}
                      to={`/rituais/${ritual.id}`}
                      onClick={(e) => handleRitualClick(ritual, e)}
                      className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0"
                    >
                      <img
                        src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                        alt={ritual.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-sm truncate">{ritual.title}</h3>
                        <span className="text-xs text-muted-foreground mt-0.5 block">{getCategoryLabel(ritual.category)}</span>
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
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={BookOpen} text="Nenhum conteúdo disponível." />
              )}
            </div>
          </TabsContent>

          {/* ===== ABA OFERENDAS ===== */}
          <TabsContent value="oferendas">
            <CategoryChips value={offeringFilter} onChange={setOfferingFilter} />
            <div className="mt-4">
              {offeringFilter === "" ? (
                <div className="space-y-3">
                  {CATEGORY_BANNERS.map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setOfferingFilter(b.key)}
                      className="w-full flex items-center rounded-2xl overflow-hidden bg-card shadow-card h-[90px] text-left transition-transform active:scale-[0.98]"
                    >
                      <div className="flex-1 min-w-0 px-4">
                        <h3 className="font-display font-bold text-sm truncate">{b.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{b.desc}</p>
                      </div>
                      <img src={b.image} alt={b.label} className="w-[100px] h-full object-cover shrink-0" />
                    </button>
                  ))}
                </div>
              ) : loadingOfferings ? <ListSkeleton /> : offerings && offerings.length > 0 ? (
                <div className="space-y-1">
                  {offerings.map((offering, i) => (
                    <OfferingCard
                      key={offering.id}
                      offering={offering}
                      index={i}
                      isPremium={isPremium}
                      onClick={() => handleOfferingClick(offering)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={UtensilsCrossed} text="Nenhuma oferenda disponível." />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PremiumLockModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      <OfferingDetailModal
        offering={selectedOffering}
        open={!!selectedOffering}
        onClose={() => setSelectedOffering(null)}
      />
    </div>
  );
};

export default LearnPage;
