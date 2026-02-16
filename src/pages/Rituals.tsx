import { useRituals } from "@/hooks/useRituals";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { key: "oriki", label: "Orikis", emoji: "🪘" },
  { key: "ibori", label: "Ibori", emoji: "🕯️" },
  { key: "ebo", label: "Ebós", emoji: "🌿" },
  { key: "geral", label: "Geral", emoji: "📖" },
];

const RitualsPage = () => {
  const { data: rituals, isLoading } = useRituals();

  return (
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-lg mx-auto pt-8">
        <h1 className="text-3xl font-display font-bold mb-2">Rituais Sagrados</h1>
        <p className="text-muted-foreground mb-6">Estude os textos ancestrais e práticas sagradas</p>

        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <span
              key={cat.key}
              className="shrink-0 bg-card border border-border rounded-full px-4 py-2 text-sm font-semibold"
            >
              {cat.emoji} {cat.label}
            </span>
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
                className="block bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all hover:shadow-sacred/10 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent rounded-xl p-2.5">
                      <BookOpen className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base">{ritual.title}</h3>
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
    </div>
  );
};

export default RitualsPage;
