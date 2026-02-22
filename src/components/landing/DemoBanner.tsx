import { useNavigate } from "react-router-dom";
import { useActivePlans } from "@/hooks/useSubscriptionPlans";
import { useAppSettings } from "@/hooks/useAppSettings";
import { trackInitiateCheckout } from "@/lib/pixel";

const DemoBanner = () => {
  const navigate = useNavigate();
  const { data: plans } = useActivePlans();
  const { data: settings } = useAppSettings();

  const checkoutUrl = plans?.[0]?.guru_checkout_url || settings?.checkout_url || "/oferta";

  const handleSubscribe = () => {
    trackInitiateCheckout();
    if (checkoutUrl.startsWith("http")) {
      window.open(checkoutUrl, "_blank");
    } else {
      navigate(checkoutUrl);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-accent text-accent-foreground flex items-center justify-between py-2 px-4 text-xs font-semibold">
      <span className="flex-1 text-center">🔍 Você está no modo demonstração</span>
      <button
        onClick={handleSubscribe}
        className="shrink-0 ml-3 bg-foreground text-background px-4 py-1.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
      >
        Assinar
      </button>
    </div>
  );
};

export default DemoBanner;
