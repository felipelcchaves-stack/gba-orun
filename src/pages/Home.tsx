import { Link } from "react-router-dom";
import { Compass, BookOpen, GraduationCap, Flame, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useRituals } from "@/hooks/useRituals";

const CATEGORIES = [
  { key: "ebo", label: "Ebó", emoji: "🌿", color: "bg-primary/15 text-primary" },
  { key: "ibori", label: "Ibori", emoji: "🕯️", color: "bg-secondary/15 text-secondary" },
  { key: "oriki", label: "Oriki", emoji: "🪘", color: "bg-accent/20 text-accent-foreground" },
  { key: "geral", label: "Egbe Orun", emoji: "✨", color: "bg-gold/20 text-gold-foreground" },
];

const HomePage = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const { data: rituals } = useRituals();

  const displayName = user?.user_metadata?.display_name || "Visitante";
  const featured = rituals?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen pb-24">
      {/* Header greeting */}
      <div className="px-5 pt-8 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Axé! 🙏</p>
            <h1 className="text-2xl font-display font-bold">Olá, {displayName}!</h1>
          </div>
          {stats && stats.streak_days > 0 && (
            <div className="flex items-center gap-1.5 bg-accent/20 rounded-full px-3 py-1.5">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold">{stats.streak_days}🔥</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick access cards */}
      <div className="px-5 mb-6">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
          <Link to="/oraculo" className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center hover:shadow-md transition-all active:scale-[0.97]">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/15 flex items-center justify-center mb-2">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-bold">Obi</span>
          </Link>
          <Link to="/rituais" className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center hover:shadow-md transition-all active:scale-[0.97]">
            <div className="w-12 h-12 mx-auto rounded-xl bg-secondary/15 flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-xs font-bold">Rituais</span>
          </Link>
          <Link to="/aprender" className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center hover:shadow-md transition-all active:scale-[0.97]">
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent/20 flex items-center justify-center mb-2">
              <GraduationCap className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xs font-bold">Aprender</span>
          </Link>
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-5 mb-6">
        <div className="max-w-lg mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-earth to-secondary p-6 text-secondary-foreground min-h-[160px] flex flex-col justify-end">
            <div className="absolute top-3 right-3 text-5xl opacity-20">🐚</div>
            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Jornada Espiritual</p>
            <h2 className="font-display text-xl font-bold leading-snug mb-2">
              Monte sua rotina com o que os Orixás pedem de você
            </h2>
            <Link
              to="/jornada"
              className="inline-flex items-center gap-1 text-xs font-bold bg-primary-foreground/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit hover:bg-primary-foreground/30 transition-colors"
            >
              Começar Jornada <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-6">
        <div className="max-w-lg mx-auto">
          <h3 className="font-display font-bold text-lg mb-3">Categorias</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                to={`/rituais?cat=${cat.key}`}
                className="shrink-0 bg-card rounded-2xl p-4 border border-border shadow-sm min-w-[100px] text-center hover:shadow-md transition-all active:scale-[0.97]"
              >
                <span className="text-2xl block mb-1">{cat.emoji}</span>
                <span className="text-xs font-bold">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured rituals */}
      {featured.length > 0 && (
        <div className="px-5">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg">Destaques</h3>
              <Link to="/rituais" className="text-xs text-secondary font-semibold">Ver todos</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {featured.map((ritual: any) => (
                <Link
                  key={ritual.id}
                  to={`/rituais/${ritual.id}`}
                  className="shrink-0 w-[200px] bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  {ritual.image_url ? (
                    <img src={ritual.image_url} alt={ritual.title} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <span className="text-xs text-muted-foreground capitalize">{ritual.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
