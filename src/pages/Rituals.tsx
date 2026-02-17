import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Lock, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";
import egbeOrunCategory from "@/assets/egbe-orun-category.jpg";
import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";

const CATEGORIES = [
  { key: "", label: "Todos" },
  { key: "oriki", label: "Orikis" },
  { key: "ibori", label: "Ibori" },
  { key: "ebo", label: "Ebós" },
  { key: "geral", label: "Egbe Orun" },
];

const CATEGORY_BANNERS = [
  { key: "ebo", label: "Ebós & Oferendas", desc: "Limpezas e oferendas rituais", image: eboCategory },
  { key: "ibori", label: "Ibori & Ori", desc: "Cuidados com o Ori", image: iboriCategory },
  { key: "oriki", label: "Orikis Sagrados", desc: "Rezas e louvações", image: orikiCategory },
  { key: "geral", label: "Egbe Orun", desc: "Ancestralidade e comunidade", image: egbeOrunCategory },
];

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory, iboriCategory, orikiCategory];

const RitualsPage = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const { data: rituals, isLoading } = useRituals(selectedCategory || undefined);
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const handleRitualClick = (ritual: any, e: React.MouseEvent) => {
    if (ritual.is_premium && !isPremium) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        <h1 className="text-3xl font-display font-bold mb-1">Rituais Sagrados</h1>
        <p className="text-muted-foreground text-sm mb-6">Textos ancestrais e práticas sagradas</p>

        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                selectedCategory === cat.key
                  ? "bg-foreground text-background"
                  : "bg-transparent border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category banners - only on "Todos" */}
        {!selectedCategory && (
          <div className="space-y-3 mb-6">
            {CATEGORY_BANNERS.map(banner => (
              <button
                key={banner.key}
                onClick={() => setSelectedCategory(banner.key)}
                className="w-full flex items-center overflow-hidden rounded-2xl h-[90px] bg-card shadow-card hover:shadow-soft transition-all active:scale-[0.99] text-left"
              >
                <div className="flex-1 p-4">
                  <h3 className="font-display font-bold text-base">{banner.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{banner.desc}</p>
                </div>
                <div className="w-[100px] h-full shrink-0 relative">
                  <img src={banner.image} alt={banner.label} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-5 shadow-card animate-pulse h-20" />
            ))}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="space-y-1">
            {rituals.map((ritual, i) => (
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
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{ritual.category}</p>
                  {ritual.is_premium && !isPremium && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full mt-1 font-medium">
                      <Lock className="h-2.5 w-2.5" /> Premium
                    </span>
                  )}
                </div>
                <Bookmark className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">Nenhum ritual cadastrado ainda.</p>
          </div>
        )}
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default RitualsPage;
