import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackLead } from "@/lib/pixel";
import { sendCAPIEvent } from "@/lib/capi";
import { getUtmParams } from "@/lib/utm";

type AuthMode = "login" | "forgot";

const AuthPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bem-vindo de volta!");

      // Check if first login (onboarding not completed) → track Lead
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("user_id", currentUser.id)
            .maybeSingle();
          if (profile && !profile.onboarding_completed) {
            const eventId = trackLead();
            sendCAPIEvent("Lead", email, { event_id: eventId });
            // Save UTMs to profile
            const utms = getUtmParams();
            if (utms.utm_source || utms.utm_medium || utms.utm_campaign) {
              await supabase.from("profiles").update({
                utm_source: utms.utm_source || null,
                utm_medium: utms.utm_medium || null,
                utm_campaign: utms.utm_campaign || null,
              }).eq("user_id", currentUser.id);
            }
          }
        }
      } catch (leadErr) {
        console.warn("Lead tracking error (non-blocking):", leadErr);
      }

      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pb-[env(safe-area-inset-bottom)]">
      <Link to="/" className="absolute top-6 left-5 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-6 w-6" />
      </Link>

      <div className="w-full max-w-sm animate-fade-in">
        {/* Mascote Agemo */}
        <div className="text-center mb-6">
          <span className="text-5xl">🦎</span>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === "login" ? "Axé! Bem-vindo de volta." : "Vamos recuperar seu acesso."}
          </p>
        </div>

        <h1 className="text-3xl font-display font-bold mb-1 text-center">
          {mode === "login" ? "Entrar" : "Recuperar Senha"}
        </h1>
        <p className="text-muted-foreground mb-8 text-center text-sm">
          {mode === "login" ? "Acesse sua conta" : "Digite seu email para receber o link"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-base"
              required
            />
          </div>

          {/* Senha */}
          {mode === "login" && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl gradient-sacred text-primary-foreground font-bold text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Enviar Link"}
          </button>
        </form>

        {/* Rodapé */}
        <div className="text-center mt-6">
          {mode === "login" ? (
            <button
              onClick={() => setMode("forgot")}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Esqueci minha senha
            </button>
          ) : (
            <button
              onClick={() => setMode("login")}
              className="text-sm text-primary font-semibold underline"
            >
              Voltar ao login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
