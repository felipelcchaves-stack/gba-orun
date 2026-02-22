import { ReactNode, useRef, useEffect, useState } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  title?: string;
  delay?: number;
}

const PhoneMockup = ({ children, title, delay = 0 }: PhoneMockupProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-3 shrink-0 w-[220px] sm:w-[240px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {/* Phone frame */}
      <div className="relative bg-foreground rounded-[2rem] p-2 shadow-xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground rounded-b-xl z-10" />
        {/* Screen */}
        <div className="relative w-[200px] sm:w-[220px] h-[380px] sm:h-[420px] rounded-[1.5rem] overflow-hidden bg-background">
          {children}
        </div>
      </div>
      {title && (
        <p className="text-sm font-display font-bold text-foreground text-center">{title}</p>
      )}
    </div>
  );
};

// ── Static mockup content components ──

export const OracleMockupContent = () => (
  <div className="p-4 pt-8 h-full flex flex-col">
    <p className="text-[10px] text-muted-foreground mb-1">Oráculo do Obi</p>
    <h3 className="text-sm font-display font-bold text-foreground mb-3">Como posso te ajudar?</h3>
    <div className="grid grid-cols-2 gap-2 mb-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-square rounded-xl bg-accent/20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-accent/40" />
        </div>
      ))}
    </div>
    <div className="mt-auto">
      <div className="w-full h-10 rounded-xl bg-primary/80" />
    </div>
  </div>
);

export const RitualsMockupContent = () => (
  <div className="p-4 pt-8 h-full">
    <p className="text-[10px] text-muted-foreground mb-1">Rituais</p>
    <h3 className="text-sm font-display font-bold text-foreground mb-3">Conteúdos Sagrados</h3>
    <div className="space-y-2">
      {["Ebo", "Oriki", "Ibori", "Iyami"].map((cat) => (
        <div key={cat} className="flex items-center gap-2 p-2 rounded-xl bg-card shadow-soft">
          <div className="w-10 h-10 rounded-lg bg-accent/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{cat}</p>
            <p className="text-[10px] text-muted-foreground">Conteúdo disponível</p>
          </div>
          <div className="w-4 h-4 rounded-full bg-accent/30 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export const JourneyMockupContent = () => (
  <div className="p-4 pt-8 h-full">
    <p className="text-[10px] text-muted-foreground mb-1">Jornada Espiritual</p>
    <h3 className="text-sm font-display font-bold text-foreground mb-2">Hoje</h3>
    {/* Progress circle */}
    <div className="flex justify-center mb-3">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-muted" />
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-accent" strokeDasharray="94" strokeDashoffset="37" strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">60%</span>
      </div>
    </div>
    <div className="space-y-1.5">
      {["Oração ao Ori", "Oferenda", "Banho de ervas"].map((t, i) => (
        <div key={t} className="flex items-center gap-2 p-2 rounded-lg bg-card">
          <div className={`w-4 h-4 rounded-full ${i < 2 ? "bg-accent" : "bg-muted"}`} />
          <p className={`text-[11px] ${i < 2 ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>{t}</p>
        </div>
      ))}
    </div>
  </div>
);

export const LearnMockupContent = () => (
  <div className="p-4 pt-8 h-full">
    <p className="text-[10px] text-muted-foreground mb-1">Aprender</p>
    <h3 className="text-sm font-display font-bold text-foreground mb-3">Categorias</h3>
    <div className="grid grid-cols-2 gap-2">
      {["Ebo", "Oriki", "Ibori", "Egbe Orun", "Iyami", "Ori"].map((cat) => (
        <div key={cat} className="aspect-[4/3] rounded-xl bg-accent/10 flex items-end p-2">
          <p className="text-[10px] font-bold text-foreground">{cat}</p>
        </div>
      ))}
    </div>
  </div>
);

export default PhoneMockup;
