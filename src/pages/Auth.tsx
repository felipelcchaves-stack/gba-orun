import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trackLead } from "@/lib/pixel";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else { toast.success("Bem-vindo de volta!"); navigate("/"); }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) toast.error(error.message);
      else {
        toast.success("Conta criada! Verifique seu email para confirmar.");
        trackLead();
      }
    }
    setLoading(false);
  };

  const titles: Record<AuthMode, string> = {
    login: "Entrar",
    signup: "Criar Conta",
    forgot: "Recuperar Senha",
  };

  const subtitles: Record<AuthMode, string> = {
    login: "Acesse sua conta",
    signup: "Registre-se no Gba-Orun",
    forgot: "Digite seu email para receber o link de recuperação",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-3xl font-display font-bold mb-1">{titles[mode]}</h1>
        <p className="text-muted-foreground mb-8">{subtitles[mode]}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none"
            required
          />
          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none"
              required
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-sacred text-primary-foreground font-bold text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading
              ? "Aguarde..."
              : mode === "login"
              ? "Entrar"
              : mode === "signup"
              ? "Registrar"
              : "Enviar Link"}
          </button>
        </form>

        {mode === "login" && (
          <button
            onClick={() => setMode("forgot")}
            className="block w-full text-center text-sm text-muted-foreground hover:text-primary mt-4 underline"
          >
            Esqueci minha senha
          </button>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "forgot" ? (
            <button onClick={() => setMode("login")} className="text-primary font-semibold underline">
              Voltar ao login
            </button>
          ) : mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-semibold underline">
                Registre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button onClick={() => setMode("login")} className="text-primary font-semibold underline">
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
