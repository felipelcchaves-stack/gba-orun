import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Flame, Zap, BookOpen, Compass } from "lucide-react";
import XPBar from "@/components/XPBar";
import StreakCounter from "@/components/StreakCounter";

const ProfilePage = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const { data: unlocked } = useAchievements();

  const unlockedKeys = new Set(unlocked?.map((a: any) => a.achievement_key) ?? []);

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-muted-foreground">Faça login para ver seu perfil.</p>
        <Link to="/auth" className="text-primary font-semibold underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-lg mx-auto pt-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>

        {/* Profile header */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Meu Perfil</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {stats && <XPBar xp={stats.xp_total} />}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <Compass className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{stats?.oracle_throws ?? 0}</p>
            <p className="text-xs text-muted-foreground">Consultas</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-1 text-secondary" />
            <p className="text-2xl font-bold">{stats?.rituals_read ?? 0}</p>
            <p className="text-xs text-muted-foreground">Rituais</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <Flame className="h-6 w-6 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">{stats?.streak_days ?? 0}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>

        {/* Achievements */}
        <h2 className="font-display text-xl font-bold mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const unlk = unlockedKeys.has(ach.key);
            return (
              <div
                key={ach.key}
                className={`rounded-2xl p-4 border transition-all ${
                  unlk
                    ? "bg-accent/10 border-accent shadow-sm"
                    : "bg-muted/50 border-border opacity-50"
                }`}
              >
                <span className="text-2xl">{ach.icon}</span>
                <h3 className="font-display font-bold text-sm mt-1">{ach.name}</h3>
                <p className="text-xs text-muted-foreground">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
