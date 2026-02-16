import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Lock } from "lucide-react";
import { useState } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

const CATEGORIES = [
  { key: "", label: "Todos", emoji: "📚" },
  { key: "oriki", label: "Orikis", emoji: "🪘" },
  { key: "ibori", label: "Ibori", emoji: "🕯️" },
  { key: "ebo", label: "Ebós", emoji: "🌿" },
  { key: "geral", label: "Geral", emoji: "📖" },
];

const RitualsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: rituals, isLoading } = useRituals(selectedCategory || undefined);
  const { isPremium, isLoggedIn } = usePremium();
  const [showModal, setShowModal] = useState(false);

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
                  ? "gradient-sacred text-primary-foreground"
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
                className="block bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all hover:shadow-sacred/10 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${ritual.is_premium && !isPremium ? "bg-accent/30" : "bg-accent"}`}>
                      {ritual.is_premium && !isPremium ? (
                        <Lock className="h-5 w-5 text-accent-foreground" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-accent-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base flex items-center gap-2">
                        {ritual.title}
                        {ritual.is_premium && (
                          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                            Premium
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground capitalize">{ritual.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum ritual cadastrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">Os rituais aparecerão aqui quando forem adicionados pelo Admin.</p>
          </div>
        )}
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default RitualsPage;
