import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Bookmark, Sunrise, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useRituals } from "@/hooks/useRituals";
import { useAppSettings } from "@/hooks/useAppSettings";
import { getCategoryLabel } from "@/lib/categories";
import SpiritualCareCard from "@/components/home/SpiritualCareCard";
import SpiritualEnergyDashboard from "@/components/home/SpiritualEnergyDashboard";
import SpiritualEvolutionChart from "@/components/home/SpiritualEvolutionChart";
import PromoBanner from "@/components/home/PromoBanner";
import SubscriptionBanner from "@/components/home/SubscriptionBanner";
import { useCareReminder } from "@/hooks/useCareReminder";
import { useReviewPrompt } from "@/hooks/useReviewPrompt";
import ReviewModal from "@/components/ReviewModal";

import heroBanner from "@/assets/hero-banner.jpg";


import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";
import dailyRoutine from "@/assets/daily-routine.jpg";
import ritualPlaceholder1 from "@/assets/ritual-placeholder-1.jpg";
import ritualPlaceholder2 from "@/assets/ritual-placeholder-2.jpg";

const FALLBACK_IMAGES = [ritualPlaceholder1, ritualPlaceholder2, eboCategory, iboriCategory, orikiCategory, dailyRoutine];

const HomePage = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: stats } = useUserStats();
  const { data: rituals } = useRituals();
  const { data: settings } = useAppSettings();

  // Fire care reminder on home load
  useCareReminder();
  const { shouldShow: showReview, dismiss: dismissReview } = useReviewPrompt();
  const [reviewOpen, setReviewOpen] = useState(showReview);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || "";
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
            <h1 className="text-3xl font-display font-bold mt-0.5">Olá{displayName ? `, ${displayName}` : "!"}</h1>
          </div>
          {stats && stats.streak_days > 0 &&
          <div className="flex items-center gap-1.5 bg-accent/15 rounded-full px-3 py-1.5">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold">{stats.streak_days}</span>
            </div>
          }
        </div>
      </div>

      {/* Subscription Banner */}
      <div className="px-6 mb-5">
        <div className="max-w-lg mx-auto">
          <SubscriptionBanner />
        </div>
      </div>

      {/* Spiritual Care Card */}
      <div className="px-6 mb-5">
        <div className="max-w-lg mx-auto">
          <SpiritualCareCard />
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-6 mb-5">
        <div className="max-w-lg mx-auto">
          <PromoBanner />
        </div>
      </div>

      {user &&
      <div className="px-6 mb-5">
          <div className="max-w-lg mx-auto space-y-4">
            <SpiritualEnergyDashboard />
            <SpiritualEvolutionChart />
          </div>
        </div>
      }


      {/* Hero banner */}
      <div className="px-6 mb-6">
        <div className="max-w-lg mx-auto">
          <Link to="/jornada" className="block">
            <div className="relative overflow-hidden rounded-2xl bg-black h-[160px] flex">
              <div className="flex-1 p-5 flex flex-col justify-center z-10">
                <p className="text-white/70 text-[10px] uppercase tracking-[0.15em] mb-1.5 font-medium">Jornada Espiritual</p>
                <h2 className="font-display text-lg font-bold text-white leading-snug mb-3">Seja guiado pelo Oluwo Ifatokun em sua jornada espiritual
                </h2>
                <span className="text-xs font-medium text-white/80">Começar →</span>
              </div>
              <div className="w-[140px] shrink-0 relative">
                <img src={heroBanner} alt="Jornada" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Daily Prayers section */}
      {dailyPrayers.length > 0 &&
      <div className="px-6 mb-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => {const PIcon = prayerIcon;return <PIcon className="h-4 w-4 text-accent" strokeWidth={1.5} />;})()}
                <h3 className="font-display font-bold text-lg">{prayerLabel}</h3>
              </div>
              <Link to={`/rituais?cat=${prayerCategory}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todas</Link>
            </div>
            <div className="space-y-1">
              {dailyPrayers.map((ritual: any, i: number) =>
            <Link
              key={ritual.id}
              to={`/rituais/${ritual.id}`}
              className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0">

                  <img
                src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={ritual.title}
                className="w-12 h-12 rounded-full object-cover shrink-0" />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{getCategoryLabel(ritual.category)}</p>
                  </div>
                </Link>
            )}
            </div>
          </div>
        </div>
      }

      {/* Destaques */}
      {featured.length > 0 &&
      <div className="px-6 mb-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg">Destaques</h3>
              <Link to="/rituais" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todos</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {featured.map((ritual: any, i: number) =>
            <Link
              key={ritual.id}
              to={`/rituais/${ritual.id}`}
              className="shrink-0 w-[160px] bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all active:scale-[0.98]">

                  <img
                src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={ritual.title}
                className="w-full h-[120px] object-cover" />

                  <div className="p-3">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">{getCategoryLabel(ritual.category)}</span>
                  </div>
                </Link>
            )}
            </div>
          </div>
        </div>
      }

      {/* Rituais do Dia */}
      {dailyRituals.length > 0 &&
      <div className="px-6">
          <div className="max-w-lg mx-auto">
            <h3 className="font-display font-bold text-lg mb-3">Rituais do Dia</h3>
            <div className="space-y-1">
              {dailyRituals.map((ritual: any, i: number) =>
            <Link
              key={ritual.id}
              to={`/rituais/${ritual.id}`}
              className="flex items-center gap-3.5 py-3 border-b border-border/40 last:border-b-0">

                  <img
                src={ritual.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                alt={ritual.title}
                className="w-14 h-14 rounded-full object-cover shrink-0" />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-sm truncate">{ritual.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{getCategoryLabel(ritual.category)}</p>
                  </div>
                  <Bookmark className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                </Link>
            )}
            </div>
          </div>
        </div>
      }

      <ReviewModal
        open={reviewOpen || showReview}
        onClose={() => setReviewOpen(false)}
        onDismiss={dismissReview} />

    </div>);

};

export default HomePage;