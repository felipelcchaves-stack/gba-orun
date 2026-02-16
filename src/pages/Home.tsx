import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";
import { Compass, BookOpen } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-[55vh] overflow-hidden rounded-b-[2rem]">
        <img
          src={heroBg}
          alt="Búzios sagrados"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background" />
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-10 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-2 animate-fade-up drop-shadow-lg">
            Gba-Orun
          </h1>
          <p className="text-primary-foreground/90 text-lg font-body max-w-md animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Oráculo dos Búzios & Sabedoria Ancestral
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 -mt-6 relative z-20 space-y-4 max-w-lg mx-auto">
        <Link
          to="/oraculo"
          className="block w-full gradient-sacred text-primary-foreground rounded-2xl p-5 shadow-sacred transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground/20 rounded-xl p-3">
              <Compass className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-display font-bold">Jogar Obi</h2>
              <p className="text-sm opacity-90">Consulte o oráculo dos búzios</p>
            </div>
          </div>
        </Link>

        <Link
          to="/rituais"
          className="block w-full bg-card text-card-foreground rounded-2xl p-5 border border-border shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="bg-accent rounded-xl p-3">
              <BookOpen className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-display font-bold">Rituais Sagrados</h2>
              <p className="text-sm text-muted-foreground">Orikis, Ibori e mais</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Welcome section */}
      <div className="px-5 mt-8 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-display text-lg font-bold mb-2">Axé! 🙏</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bem-vindo ao Gba-Orun, seu guia digital de sabedoria ancestral yorubá.
            Consulte os búzios, estude os rituais sagrados e aprofunde-se nos Orikis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
