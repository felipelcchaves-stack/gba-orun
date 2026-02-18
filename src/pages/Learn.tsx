import { useRituals, useRitualCategories } from "@/hooks/useRituals";
import { useOfferings, useOfferingCategories, type Offering } from "@/hooks/useOfferings";
import { usePremium } from "@/hooks/usePremium";
import { useCategories, getCategoryImageFromList, getCategoryLabelFromList } from "@/hooks/useCategories";
import { Link } from "react-router-dom";
import { Lock, BookOpen, Volume2, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { useState } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";
import OfferingDetailModal from "@/components/learn/OfferingDetailModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";
import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory, iboriCategory, orikiCategory];

const LearnPage = () => {
  const [ritualFilter, setRitualFilter] = useState("");
  const [offeringFilter, setOfferingFilter] = useState("");
  const { data: rituals, isLoading: loadingRituals } = useRituals(ritualFilter || undefined);
  const { data: offerings, isLoading: loadingOfferings } = useOfferings(offeringFilter || undefined);
  const { data: categories } = useCategories();
  const { data: ritualCatKeys } = useRitualCategories();
  const { data: offeringCatKeys } = useOfferingCategories();
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

  const selectedRitualCat = categories?.find(c => c.key === ritualFilter);
  const selectedOfferingCat = categories?.find(c => c.key === offeringFilter);

  const ListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl shadow-card animate-pulse" />)}
    </div>
  );

  const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div className="text-center py-20">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );

  const CategoryCards = ({ onSelect, validKeys }: { onSelect: (key: string) => void; validKeys?: string[] }) => {
    const filtered = validKeys ? categories?.filter(c => validKeys.includes(c.key)) : categories;
    if (!filtered || filtered.length === 0) return <EmptyState icon={BookOpen} text="Nenhuma categoria com conteúdo disponível." />;
    return (
      <div className="space-y-3">
        {filtered.map(c => (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className="w-full flex items-center rounded-2xl overflow-hidden bg-card shadow-card h-[90px] text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex-1 min-w-0 px-4">
              <h3 className="font-display font-bold text-sm truncate">{c.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>
            </div>
            <img
              src={c.image_url || getCategoryImageFromList(categories, c.key)}
              alt={c.label}
              className="w-[100px] h-full object-cover shrink-0"
            />
          </button>
        ))}
      </div>
    );
  };

  const BackHeader = ({ label, onBack }: { label: string; onBack: () => void }) => (
    <button onClick={onBack} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft className="h-4 w-4" />
      <span className="font-display font-semibold">{label}</span>
    </button>
  );

  const RitualItemCard = ({ ritual, index }: { ritual: any; index: number }) => (
    <Link
      to={`/rituais/${ritual.id}`}
      onClick={(e) => handleRitualClick(ritual, e)}
      className="w-full flex items-center rounded-2xl overflow-hidden bg-card shadow-card h-[80px] text-left transition-transform active:scale-[0.98]"
    >
      <div className="flex-1 min-w-0 px-4">
        <h3 className="font-display font-bold text-sm truncate">{ritual.title}</h3>
        <div className="flex items-center gap-2 mt-1">
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
      <img
        src={ritual.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
        alt={ritual.title}
        className="w-[80px] h-full object-cover shrink-0"
      />
    </Link>
  );

  const OfferingItemCard = ({ offering, index }: { offering: Offering; index: number }) => (
    <button
      onClick={() => handleOfferingClick(offering)}
      className="w-full flex items-center rounded-2xl overflow-hidden bg-card shadow-card h-[80px] text-left transition-transform active:scale-[0.98]"
    >
      <div className="flex-1 min-w-0 px-4">
        <h3 className="font-display font-bold text-sm truncate">{offering.title}</h3>
        <div className="flex items-center gap-2 mt-1">
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
      <img
        src={offering.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
        alt={offering.title}
        className="w-[80px] h-full object-cover shrink-0"
      />
    </button>
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
            {ritualFilter === "" ? (
              <CategoryCards onSelect={setRitualFilter} validKeys={ritualCatKeys} />
            ) : (
              <>
                <BackHeader label={selectedRitualCat?.label || ritualFilter} onBack={() => setRitualFilter("")} />
                {loadingRituals ? <ListSkeleton /> : rituals && rituals.length > 0 ? (
                  <div className="space-y-3">
                    {rituals.map((ritual: any, i: number) => (
                      <RitualItemCard key={ritual.id} ritual={ritual} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={BookOpen} text="Nenhum conteúdo disponível nesta categoria." />
                )}
              </>
            )}
          </TabsContent>

          {/* ===== ABA OFERENDAS ===== */}
          <TabsContent value="oferendas">
            {offeringFilter === "" ? (
              <CategoryCards onSelect={setOfferingFilter} validKeys={offeringCatKeys} />
            ) : (
              <>
                <BackHeader label={selectedOfferingCat?.label || offeringFilter} onBack={() => setOfferingFilter("")} />
                {loadingOfferings ? <ListSkeleton /> : offerings && offerings.length > 0 ? (
                  <div className="space-y-3">
                    {offerings.map((offering, i) => (
                      <OfferingItemCard key={offering.id} offering={offering} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={UtensilsCrossed} text="Nenhuma oferenda disponível nesta categoria." />
                )}
              </>
            )}
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
