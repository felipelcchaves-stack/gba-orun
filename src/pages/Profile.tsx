import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { useResetJourney } from "@/hooks/useResetJourney";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import XPBar from "@/components/XPBar";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
import ThemeToggle from "@/components/profile/ThemeToggle";
import { usePremium } from "@/hooks/usePremium";
import { Link as RouterLink } from "react-router-dom";
import { Crown, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { data: stats } = useUserStats();
  const { data: unlocked } = useAchievements();
  const { subscriptionStatus, expiresAt, daysRemaining, isExpiringSoon, isOverdue, isPremium } = usePremium();
  const resetJourney = useResetJourney();
  const [showReset, setShowReset] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");

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

        {/* Subscription Status */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" /> Assinatura
          </h2>
          <div className="flex items-center gap-3 mb-3">
            {subscriptionStatus === "active" && isPremium && (
              <Badge className="bg-primary/15 text-primary border-primary/30">Ativo</Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive">Inadimplente</Badge>
            )}
            {subscriptionStatus === "cancelled" && (
              <Badge className="bg-accent/15 text-accent border-accent/30">Cancelado</Badge>
            )}
            {subscriptionStatus === "free" && (
              <Badge variant="secondary">Gratuito</Badge>
            )}
          </div>
          {expiresAt && (
            <p className="text-sm text-muted-foreground mb-1">
              {new Date(expiresAt) > new Date()
                ? `Expira em ${new Date(expiresAt).toLocaleDateString("pt-BR")}`
                : `Expirou em ${new Date(expiresAt).toLocaleDateString("pt-BR")}`}
              {isExpiringSoon && daysRemaining !== null && (
                <span className="text-accent font-medium ml-1">({daysRemaining} dia{daysRemaining !== 1 ? "s" : ""} restante{daysRemaining !== 1 ? "s" : ""})</span>
              )}
            </p>
          )}
          {(isOverdue || subscriptionStatus === "cancelled" || subscriptionStatus === "free") ? (
            <Link to="/oferta">
              <Button className="w-full mt-3 gradient-gold text-accent-foreground font-bold">
                {isOverdue ? "Renovar Agora" : subscriptionStatus === "cancelled" ? "Assinar Novamente" : "Assinar Premium"}
              </Button>
            </Link>
          ) : (
            <Link to="/oferta">
              <Button variant="outline" className="w-full mt-3">Gerenciar Assinatura</Button>
            </Link>
          )}
        </div>

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

        {/* Reset Journey */}
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => setShowReset(true)}
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Recomeçar Jornada
        </Button>

        <Dialog open={showReset} onOpenChange={v => { setShowReset(v); setResetConfirm(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recomeçar Jornada</DialogTitle>
              <DialogDescription>
                Isso apagará todo seu progresso: jornada, tarefas, conquistas e estatísticas. Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Digite <strong>RESETAR</strong> para confirmar:</p>
              <Input value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} placeholder="RESETAR" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReset(false)}>Cancelar</Button>
              <Button
                variant="destructive"
                disabled={resetConfirm !== "RESETAR" || resetJourney.isPending}
                onClick={async () => {
                  try {
                    await resetJourney.mutateAsync();
                    toast.success("Jornada resetada com sucesso!");
                    setShowReset(false);
                    setResetConfirm("");
                  } catch (e: any) { toast.error(e.message); }
                }}
              >
                {resetJourney.isPending ? "Resetando..." : "Confirmar Reset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sign out */}
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
