import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { DemoProvider } from "@/contexts/DemoContext";
import DemoBanner from "@/components/landing/DemoBanner";
import Home from "./Home";
import Oracle from "./Oracle";
import Rituals from "./Rituals";
import RitualReader from "./RitualReader";
import Learn from "./Learn";
import Journey from "./Journey";
import { Home as HomeIcon, Map, GraduationCap, Compass, Star } from "lucide-react";
import { useActivePlans } from "@/hooks/useSubscriptionPlans";
import { useAppSettings } from "@/hooks/useAppSettings";
import { trackInitiateCheckout, trackCustomEvent } from "@/lib/pixel";
import { appendUtmsToUrl } from "@/lib/utm";

const DemoNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: plans } = useActivePlans();
  const { data: settings } = useAppSettings();

  const checkoutUrl = plans?.[0]?.guru_checkout_url || settings?.checkout_url || "/oferta";

  const links = [
    { to: "/demo", icon: HomeIcon, label: "Início" },
    { to: "/demo/oraculo", icon: Compass, label: "Oráculo" },
    { to: "/demo/rituais", icon: Star, label: "Rituais" },
    { to: "/demo/aprender", icon: GraduationCap, label: "Aprender" },
    { to: "/demo/jornada", icon: Map, label: "Jornada" },
  ];

  const handleSubscribe = () => {
    trackInitiateCheckout();
    const targetUrl = appendUtmsToUrl(checkoutUrl);
    if (targetUrl.startsWith("http")) {
      window.open(targetUrl, "_blank");
    } else {
      navigate(targetUrl);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50">
      <div className="flex items-center justify-around px-1 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/demo" && location.pathname.startsWith(to));
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-all relative ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-foreground" />}
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </button>
          );
        })}
        {/* Subscribe button */}
        <button
          onClick={handleSubscribe}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-accent"
        >
          <div className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center">
            <Star className="h-3 w-3 text-accent-foreground" />
          </div>
          <span className="text-[10px] font-bold leading-tight">Assinar</span>
        </button>
      </div>
    </nav>
  );
};

const DemoPage = () => {
  useEffect(() => {
    trackCustomEvent("DemoStarted");
  }, []);

  return (
    <DemoProvider>
      <DemoBanner />
      <div className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oraculo" element={<Oracle />} />
          <Route path="/rituais" element={<Rituals />} />
          <Route path="/rituais/:id" element={<RitualReader />} />
          <Route path="/aprender" element={<Learn />} />
          <Route path="/jornada" element={<Journey />} />
        </Routes>
      </div>
      <DemoNav />
    </DemoProvider>
  );
};

export default DemoPage;
