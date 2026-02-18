import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import OfflineBanner from "@/components/OfflineBanner";
import Home from "./pages/Home";
import Oracle from "./pages/Oracle";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import Rituals from "./pages/Rituals";
import RitualReader from "./pages/RitualReader";
import Journey from "./pages/Journey";
import Learn from "./pages/Learn";
import Profile from "./pages/Profile";
import Oferta from "./pages/Oferta";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Install from "./pages/Install";
import Promotions from "./pages/Promotions";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initPixelWithId, initGoogleAds } from "@/lib/pixel";
import { useAppSettings } from "@/hooks/useAppSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60, // 1h
      staleTime: 1000 * 30, // 30s
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
  },
});

// Clean up old persisted cache
try { localStorage.removeItem("gba-orun-cache"); } catch {}

const AppContent = () => {
  const { data: settings } = useAppSettings();

  useEffect(() => {
    if (!settings) return;
    if (settings.meta_pixel_id) initPixelWithId(settings.meta_pixel_id);
    if (settings.google_ads_id) initGoogleAds(settings.google_ads_id);
  }, [settings]);

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/oferta" element={<Oferta />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/onboarding" element={<ProtectedRoute skipOnboardingCheck><OnboardingWizard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/oraculo" element={<ProtectedRoute><Oracle /></ProtectedRoute>} />
        <Route path="/rituais" element={<ProtectedRoute><Rituals /></ProtectedRoute>} />
        <Route path="/rituais/:id" element={<ProtectedRoute><RitualReader /></ProtectedRoute>} />
        <Route path="/jornada" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
        <Route path="/comunidade" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/aprender" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/promocoes" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/instalar" element={<ProtectedRoute><Install /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
