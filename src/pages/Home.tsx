import { Link } from "react-router-dom";
import { Compass, BookOpen, GraduationCap, Flame, Map, Heart, Bookmark, Sunrise, Moon, Music } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useRituals } from "@/hooks/useRituals";
import { useAppSettings } from "@/hooks/useAppSettings";
import { getCategoryLabel } from "@/lib/categories";
import SpiritualCareCard from "@/components/home/SpiritualCareCard";
import SpiritualEnergyDashboard from "@/components/home/SpiritualEnergyDashboard";
import SpiritualEvolutionChart from "@/components/home/SpiritualEvolutionChart";
import { useCareReminder } from "@/hooks/useCareReminder";

import heroBanner from "@/assets/hero-banner.jpg";
import obiOracle from "@/assets/obi-oracle.jpg";
import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";
import egbeOrunCategory from "@/assets/egbe-orun-category.jpg";
import iyamiCategory from "@/assets/iyami-category.jpg";
import dailyRoutine from "@/assets/daily-routine.jpg";
import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";

const QUICK_ACCESS = [
  { to: "/oraculo", icon: Compass, label: "Obi", image: obiOracle },
  { to: "/rituais", icon: BookOpen, label: "Rituais", image: ritualPlaceholder1 },
  { to: "/rituais?cat=ibori", icon: Heart, label: "Ibori", image: iboriCategory },
  { to: "/rituais?cat=oriki", icon: BookOpen, label: "Oriki", image: orikiCategory },
  { to: "/rituais?cat=ebo", icon: Flame, label: "Ebó", image: eboCategory },
  { to: "/rituais?cat=oracao_manha", icon: Sunrise, label: "Orações", image: dailyRoutine },
  { to: "/rituais?cat=cantiga", icon: Music, label: "Cantigas", image: egbeOrunCategory },
  { to: "/jornada", icon: Map, label: "Jornada", image: dailyRoutine },
];

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory, iboriCategory, orikiCategory, dailyRoutine];

const HomePage = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const { data: rituals } = useRituals();
  const { data: settings } = useAppSettings();

  // Fire care reminder on home load
  useCareReminder();

  const displayName = user?.user_metadata?.display_name || "Visitante";
  const featured = rituals?.slice(0, 6) ?? [];

  // Show morning or night prayers based on time of day
  const hour = new Date().getHours();
  const prayerCategory = hour < 12 ? "oracao_manha" : "oracao_noite";
  const prayerLabel = hour < 12 ? "Orações da Manhã" : "Orações da Noite";
  const prayerIcon = hour < 12 ? Sunrise : Moon;
  const dailyPrayers = rituals?.filter((r: any) => r.category === prayerCategory).slice(0, 3) ?? [];
  const dailyRituals = rituals?.slice(0, 4) ?? [];

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header greeting */}
      <div className="px-6 pt-10 pb-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs tracking-wide">Bem-vindo de volta</p>
            <h1 className="text-3xl font-display font-bold mt-0.5">Olá, {displayName}</h1>
          </div>
          {stats && stats.streak_days > 0 && (
            <div className="flex items-center gap-1.5 bg-accent/15 rounded-full px-3 py-1.5">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold">{stats.streak_days}</span>
            </div>
          )}
        </div>
      </div>

      {/* Spiritual Care Card */}
      <div className="px-6 mb-5">
        <div className="max-w-lg mx-auto">
          <SpiritualCareCard />
        </div>
      </div>

      {/* Spiritual Energy Dashboard */}
      {user && (
        <div className="px-6 mb-5">
          <div className="max-w-lg mx-auto space-y-4">
            <SpiritualEnergyDashboard />
            <SpiritualEvolutionChart />
          </div>
        </div>
      )}

      {/* Quick access */}
      <div className="px-6 mt-5 mb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {QUICK_ACCESS.map(item => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className="shrink-0 w-[72px] flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-card bg-card group-hover:shadow-soft transition-all group-active:scale-95">
                  <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-6 mb-6">
        <div className="max-w-lg mx-auto">
          <Link to="/jornada" className="block">
            <div className="relative overflow-hidden rounded-2xl bg-secondary h-[160px] flex">
              <div className="flex-1 p-5 flex flex-col justify-center z-10">
                <p className="text-secondary-foreground/70 text-[10px] uppercase tracking-[0.15em] mb-1.5 font-medium">Jornada Espiritual</p>
                <h2 className="font-display text-lg font-bold text-secondary-foreground leading-snug mb-3">
                  Monte sua rotina com o que os Orixás pedem
                </h2>
                <span className="text-xs font-medium text-secondary-foreground/80">Começar →</span>
              </div>
              <div className="w-[140px] shrink-0 relative">
                <img src={heroBanner} alt="Jornada" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/60 to-transparent" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Daily Prayers section */}
      {dailyPrayers.length > 0 && (
        <div className="px-6 mb-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => { const PIcon = prayerIcon; return <PIcon className="h-4 w-4 text-accent" strokeWidth={1.5} />; })()}
                <h3 className="font-display font-bold text-lg">{prayerLabel}</h3>
              </div>
              <Link to={`/rituais?cat=${prayerCategory}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todas</Link>
            </div>
            <div className="space-y-1">
              {dailyPrayers.map((ritual: any, i: number) => (
                <Link
                  key={ritual.id}
                  to={`/rituais/${ritual.id}`}
                  className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0"
                >
                  <img
                    src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                    alt={ritual.title}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{getCategoryLabel(ritual.category)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Destaques */}
      {featured.length > 0 && (
        <div className="px-6 mb-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg">Destaques</h3>
              <Link to="/rituais" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todos</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {featured.map((ritual: any, i: number) => (
                <Link
                  key={ritual.id}
                  to={`/rituais/${ritual.id}`}
                  className="shrink-0 w-[160px] bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all active:scale-[0.98]"
                >
                  <img
                    src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                    alt={ritual.title}
                    className="w-full h-[120px] object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">{getCategoryLabel(ritual.category)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rituais do Dia */}
      {dailyRituals.length > 0 && (
        <div className="px-6">
          <div className="max-w-lg mx-auto">
            <h3 className="font-display font-bold text-lg mb-3">Rituais do Dia</h3>
            <div className="space-y-1">
              {dailyRituals.map((ritual: any, i: number) => (
                <Link
                  key={ritual.id}
                  to={`/rituais/${ritual.id}`}
                  className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0"
                >
                  <img
                    src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                    alt={ritual.title}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{getCategoryLabel(ritual.category)}</p>
                  </div>
                  <Bookmark className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
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
