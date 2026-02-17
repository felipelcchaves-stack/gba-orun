import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import XPBar from "@/components/XPBar";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
import ThemeToggle from "@/components/profile/ThemeToggle";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
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
      <div className="max-w-lg mx-auto pt-10 space-y-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Início
        </Link>

        <h1 className="text-3xl font-display font-bold">Meu Perfil</h1>

        {/* Avatar */}
        <AvatarUpload />

        {/* XP */}
        {stats && (
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <XPBar xp={stats.xp_total} />
          </div>
        )}

        {/* Personal data */}
        <ProfileForm />

        {/* Security */}
        <PasswordForm />

        {/* Theme */}
        <ThemeToggle />

        {/* Achievements */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold mb-4">Conquistas</h2>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const unlk = unlockedKeys.has(ach.key);
              return (
                <div
                  key={ach.key}
                  className={`rounded-xl p-3 transition-all ${unlk ? "bg-muted/50" : "bg-muted/20 opacity-40"}`}
                >
                  <span className="text-xl">{ach.icon}</span>
                  <h3 className="font-display font-medium text-sm mt-1">{ach.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign out */}
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
