import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

const CATEGORIES = [
  { key: "", label: "Todos" },
  { key: "oriki", label: "Orikis" },
  { key: "ibori", label: "Ibori" },
  { key: "ebo", label: "Ebós" },
  { key: "geral", label: "Geral" },
];

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
    <div className="min-h-screen pb-24 px-6 bg-background">
      <div className="max-w-lg mx-auto pt-10">
        <h1 className="text-3xl font-display font-medium mb-1">Rituais Sagrados</h1>
        <p className="text-muted-foreground text-sm mb-8">Estude os textos ancestrais e práticas sagradas</p>

        {/* Category chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-5 shadow-card animate-pulse h-24" />
            ))}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="space-y-4">
            {rituals.map(ritual => (
              <Link
                key={ritual.id}
                to={`/rituais/${ritual.id}`}
                onClick={(e) => handleRitualClick(ritual, e)}
                className="flex items-center gap-4 py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* Image */}
                {ritual.image_url ? (
                  <img src={ritual.image_url} alt={ritual.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-medium text-base truncate">{ritual.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize mt-0.5">{ritual.category}</p>
                  {ritual.is_premium && !isPremium && (
                    <span className="inline-flex items-center gap-1 text-xs text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full mt-1.5 font-medium">
                      <Lock className="h-3 w-3" /> Premium
                    </span>
                  )}
                </div>
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
