import { Link } from "react-router-dom";
import { Compass, BookOpen, GraduationCap, Flame, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useRituals } from "@/hooks/useRituals";
import { useAppSettings } from "@/hooks/useAppSettings";

const CATEGORIES = [
  { key: "ebo", label: "Ebó", gradient: "from-emerald-800/80 to-emerald-900/90" },
  { key: "ibori", label: "Ibori", gradient: "from-amber-700/80 to-amber-900/90" },
  { key: "oriki", label: "Oriki", gradient: "from-rose-800/80 to-rose-900/90" },
  { key: "geral", label: "Egbe Orun", gradient: "from-violet-800/80 to-violet-900/90" },
];

const HomePage = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const { data: rituals } = useRituals();
  const { data: settings } = useAppSettings();

  const displayName = user?.user_metadata?.display_name || "Visitante";
  const featured = rituals?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header greeting */}
      <div className="px-6 pt-10 pb-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-light tracking-wide">Bem-vindo de volta</p>
            <h1 className="text-3xl font-display font-medium mt-0.5">Olá, {displayName}</h1>
          </div>
          {stats && stats.streak_days > 0 && (
            <div className="flex items-center gap-1.5 bg-accent/15 rounded-full px-3 py-1.5">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold">{stats.streak_days}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick access cards */}
      <div className="px-6 mt-6 mb-8">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-4">
          <Link to="/oraculo" className="bg-card rounded-2xl p-5 shadow-card text-center hover:shadow-soft transition-all active:scale-[0.97]">
            <Compass className="h-7 w-7 mx-auto mb-2.5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-display font-medium">Obi</span>
          </Link>
          <Link to="/rituais" className="bg-card rounded-2xl p-5 shadow-card text-center hover:shadow-soft transition-all active:scale-[0.97]">
            <BookOpen className="h-7 w-7 mx-auto mb-2.5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-display font-medium">Rituais</span>
          </Link>
          <Link to="/aprender" className="bg-card rounded-2xl p-5 shadow-card text-center hover:shadow-soft transition-all active:scale-[0.97]">
            <GraduationCap className="h-7 w-7 mx-auto mb-2.5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-display font-medium">Aprender</span>
          </Link>
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-6 mb-8">
        <div className="max-w-lg mx-auto">
          <div className="relative overflow-hidden rounded-3xl min-h-[200px] flex flex-col justify-end">
            {/* Background image or gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 p-7">
              <p className="text-white/70 text-xs uppercase tracking-[0.2em] mb-2">Jornada Espiritual</p>
              <h2 className="font-display text-2xl font-medium text-white leading-snug italic mb-4">
                Monte sua rotina com o que os Orixás pedem de você
              </h2>
              <Link
                to="/jornada"
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 text-white hover:bg-white/30 transition-colors"
              >
                Começar <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mb-8">
        <div className="max-w-lg mx-auto">
          <h3 className="font-display font-medium text-xl mb-4">Categorias</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                to={`/rituais?cat=${cat.key}`}
                className="shrink-0 relative overflow-hidden rounded-2xl min-w-[130px] h-[100px] flex items-end hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
                <span className="relative z-10 p-4 text-white font-display font-medium text-sm">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured rituals */}
      {featured.length > 0 && (
        <div className="px-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-medium text-xl">Destaques</h3>
              <Link to="/rituais" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ver todos</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {featured.map((ritual: any) => (
                <Link
                  key={ritual.id}
                  to={`/rituais/${ritual.id}`}
                  className="shrink-0 w-[200px] bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all active:scale-[0.98]"
                >
                  {ritual.image_url ? (
                    <img src={ritual.image_url} alt={ritual.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-display font-medium text-sm truncate">{ritual.title}</h4>
                    <span className="text-xs text-muted-foreground capitalize mt-0.5 block">{ritual.category}</span>
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
