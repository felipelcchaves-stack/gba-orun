import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, ChevronRight, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

const CATEGORIES = [
  { key: "", label: "Todos", emoji: "📚" },
  { key: "oriki", label: "Orikis", emoji: "🪘" },
  { key: "ibori", label: "Ibori", emoji: "🕯️" },
  { key: "ebo", label: "Ebós", emoji: "🌿" },
  { key: "geral", label: "Geral", emoji: "📖" },
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
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-lg mx-auto pt-8">
        <h1 className="text-3xl font-display font-bold mb-2">Rituais Sagrados</h1>
        <p className="text-muted-foreground mb-6">Estude os textos ancestrais e práticas sagradas</p>

        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selectedCategory === cat.key
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border animate-pulse h-24" />
            ))}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="space-y-3">
            {rituals.map(ritual => (
              <Link
                key={ritual.id}
                to={`/rituais/${ritual.id}`}
                onClick={(e) => handleRitualClick(ritual, e)}
                className="block bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md transition-all active:scale-[0.99] flex"
              >
                {ritual.image_url && (
                  <img src={ritual.image_url} alt={ritual.title} className="w-20 h-20 object-cover shrink-0" />
                )}
                <div className="p-4 flex-1 min-w-0 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {!ritual.image_url && (
                      <div className={`rounded-xl p-2.5 shrink-0 ${ritual.is_premium && !isPremium ? "bg-accent/30" : "bg-secondary/15"}`}>
                        {ritual.is_premium && !isPremium ? (
                          <Lock className="h-5 w-5 text-accent-foreground" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-secondary" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-sm flex items-center gap-2 truncate">
                        {ritual.title}
                        {ritual.is_premium && (
                          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-semibold shrink-0">
                            Premium
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground capitalize">{ritual.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum ritual cadastrado ainda.</p>
          </div>
        )}
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default RitualsPage;
