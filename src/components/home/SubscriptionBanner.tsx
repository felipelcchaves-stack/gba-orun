import { Link } from "react-router-dom";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

const SubscriptionBanner = () => {
  const { subscriptionStatus, isExpiringSoon, daysRemaining, isOverdue, isLoggedIn } = usePremium();

  if (!isLoggedIn) return null;

  // Overdue banner
  if (isOverdue) {
    return (
      <div className="bg-destructive/15 border border-destructive/30 rounded-2xl p-4 flex items-start gap-3">
        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">Acesso suspenso</p>
          <p className="text-xs text-destructive/80 mt-0.5">
            Seu pagamento não foi identificado. Regularize para continuar acessando o conteúdo exclusivo.
          </p>
          <Link
            to="/oferta"
            className="inline-block mt-2 text-xs font-bold text-destructive underline underline-offset-2"
          >
            Renovar Agora →
          </Link>
        </div>
      </div>
    );
  }

  // Cancelled banner
  if (subscriptionStatus === "cancelled") {
    return (
      <div className="bg-accent/15 border border-accent/30 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Assinatura cancelada</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sua assinatura foi cancelada. Assine novamente para recuperar o acesso.
          </p>
          <Link
            to="/oferta"
            className="inline-block mt-2 text-xs font-bold text-accent underline underline-offset-2"
          >
            Ver Planos →
          </Link>
        </div>
      </div>
    );
  }

  // Expiring soon banner
  if (isExpiringSoon && daysRemaining !== null) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
        <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Assinatura expirando</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sua assinatura expira em {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""}. Renove para não perder acesso.
          </p>
          <Link
            to="/oferta"
            className="inline-block mt-2 text-xs font-bold text-accent underline underline-offset-2"
          >
            Renovar →
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionBanner;
