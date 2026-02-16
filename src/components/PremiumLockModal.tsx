import { Lock, ExternalLink } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/pixel";

interface PremiumLockModalProps {
  open: boolean;
  onClose: () => void;
  checkoutUrl?: string;
}

const CHECKOUT_URL = "https://pay.hotmart.com/SEU_PRODUTO"; // TODO: substituir pela URL real do checkout Guru

const PremiumLockModal = ({ open, onClose, checkoutUrl }: PremiumLockModalProps) => {
  if (!open) return null;

  const handleCheckout = () => {
    trackInitiateCheckout();
    window.open(checkoutUrl || CHECKOUT_URL, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background rounded-3xl p-8 max-w-sm w-full border border-border text-center animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-accent/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5">
          <Lock className="h-10 w-10 text-accent" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Conteúdo Premium 🔒</h2>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Este ritual faz parte do acervo exclusivo. Desbloqueie todos os rituais, Orikis, Ebós e muito mais!
        </p>
        <ul className="text-left text-sm space-y-2 mb-6">
          <li className="flex items-center gap-2">✅ Receitas completas de Ebo</li>
          <li className="flex items-center gap-2">✅ Todos os Orikis dos Orixás</li>
          <li className="flex items-center gap-2">✅ Rituais de Ibori e proteção</li>
          <li className="flex items-center gap-2">✅ Proteção contra Iyami</li>
        </ul>
        <button
          onClick={handleCheckout}
          className="w-full py-4 rounded-2xl gradient-gold text-accent-foreground font-bold text-lg shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Desbloquear Agora <ExternalLink className="h-5 w-5" />
        </button>
        <button onClick={onClose} className="mt-3 text-sm text-muted-foreground hover:text-foreground">
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PremiumLockModal;
