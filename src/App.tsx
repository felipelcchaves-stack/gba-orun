import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import OfflineBanner from "@/components/OfflineBanner";
import { lazy, Suspense, useEffect } from "react";

// Route-level code splitting: each page becomes its own chunk, only fetched
// when visited. Admin in particular pulls in @xyflow/react (the flow
// builder), which was otherwise shipped to every visitor's initial bundle.
const Home = lazy(() => import("./pages/Home"));
const Oracle = lazy(() => import("./pages/Oracle"));
const OnboardingWizard = lazy(() => import("@/components/onboarding/OnboardingWizard"));
const Rituals = lazy(() => import("./pages/Rituals"));
const RitualReader = lazy(() => import("./pages/RitualReader"));
const Journey = lazy(() => import("./pages/Journey"));
const Learn = lazy(() => import("./pages/Learn"));
const Profile = lazy(() => import("./pages/Profile"));
const Oferta = lazy(() => import("./pages/Oferta"));
const Demo = lazy(() => import("./pages/Demo"));
const Community = lazy(() => import("./pages/Community"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Install = lazy(() => import("./pages/Install"));
const Promotions = lazy(() => import("./pages/Promotions"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { initPixelWithId, initGoogleAds } from "@/lib/pixel";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useDynamicSEO } from "@/hooks/useDynamicSEO";
import { captureUtms } from "@/lib/utm";

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
  useDynamicSEO();

  useEffect(() => {
    captureUtms();
  }, []);

  useEffect(() => {
    if (!settings) return;
    if (settings.meta_pixel_id) initPixelWithId(settings.meta_pixel_id);
    if (settings.google_ads_id) initGoogleAds(settings.google_ads_id);
  }, [settings]);

  return (
    <>
      <OfflineBanner />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/oferta" element={<Oferta />} />
          <Route path="/demo/*" element={<Demo />} />
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
      </Suspense>
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
