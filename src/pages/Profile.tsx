import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Flame, Zap, BookOpen, Compass } from "lucide-react";
import XPBar from "@/components/XPBar";

const ProfilePage = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const { data: unlocked } = useAchievements();

  const unlockedKeys = new Set(unlocked?.map((a: any) => a.achievement_key) ?? []);

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6 gap-4 bg-background">
        <p className="text-muted-foreground text-sm">Faça login para ver seu perfil.</p>
        <Link to="/auth" className="text-primary font-medium text-sm underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-6 bg-background">
      <div className="max-w-lg mx-auto pt-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Início
        </Link>

        {/* Profile header */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-medium">Meu Perfil</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {stats && <XPBar xp={stats.xp_total} />}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <Compass className="h-5 w-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
            <p className="text-2xl font-semibold">{stats?.oracle_throws ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Consultas</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1.5 text-primary" strokeWidth={1.5} />
            <p className="text-2xl font-semibold">{stats?.rituals_read ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rituais</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card text-center">
            <Flame className="h-5 w-5 mx-auto mb-1.5 text-accent" strokeWidth={1.5} />
            <p className="text-2xl font-semibold">{stats?.streak_days ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Streak</p>
          </div>
        </div>

        {/* Achievements */}
        <h2 className="font-display text-xl font-medium mb-4">Conquistas</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const unlk = unlockedKeys.has(ach.key);
            return (
              <div
                key={ach.key}
                className={`rounded-2xl p-4 transition-all ${
                  unlk
                    ? "bg-card shadow-card"
                    : "bg-muted/30 opacity-50"
                }`}
              >
                <span className="text-2xl">{ach.icon}</span>
                <h3 className="font-display font-medium text-sm mt-1.5">{ach.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
