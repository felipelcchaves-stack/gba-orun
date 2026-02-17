import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import BottomNav from "@/components/BottomNav";
import Home from "./pages/Home";
import Oracle from "./pages/Oracle";
import Rituals from "./pages/Rituals";
import RitualReader from "./pages/RitualReader";
import Journey from "./pages/Journey";
import Learn from "./pages/Learn";
import Profile from "./pages/Profile";
import Oferta from "./pages/Oferta";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initPixel } from "@/lib/pixel";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    initPixel();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oraculo" element={<Oracle />} />
        <Route path="/rituais" element={<Rituals />} />
        <Route path="/rituais/:id" element={<RitualReader />} />
        <Route path="/jornada" element={<Journey />} />
        <Route path="/aprender" element={<Learn />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/oferta" element={<Oferta />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/auth" element={<Auth />} />
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
