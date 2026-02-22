import { ReactNode, useRef, useEffect, useState } from "react";
import { Flame, Home, Compass, BookOpen, GraduationCap, Map, Lock, Check, Sparkles, ChevronRight } from "lucide-react";

interface PhoneMockupProps {
  children: ReactNode;
  title?: string;
  delay?: number;
  size?: "default" | "large";
}

const PhoneMockup = ({ children, title, delay = 0, size = "default" }: PhoneMockupProps) => {
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

  const isLarge = size === "large";
  const frameW = isLarge ? "w-[260px] sm:w-[280px]" : "w-[220px] sm:w-[240px]";
  const screenW = isLarge ? "w-[244px] sm:w-[264px]" : "w-[200px] sm:w-[220px]";
  const screenH = isLarge ? "h-[470px] sm:h-[510px]" : "h-[380px] sm:h-[420px]";

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-3 shrink-0 ${frameW}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {/* Phone frame */}
      <div className="relative bg-foreground rounded-[2rem] p-2 shadow-xl">
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-2 pointer-events-none">
          <span className="text-[8px] font-semibold text-background/80">9:41</span>
          <div className="flex items-center gap-1">
            {/* Signal bars */}
            <div className="flex items-end gap-[1px]">
              {[3, 4, 5, 6].map((h) => (
                <div key={h} className="rounded-[0.5px] bg-background/70" style={{ width: 2, height: h }} />
              ))}
            </div>
            {/* Battery */}
            <div className="w-[14px] h-[7px] border border-background/60 rounded-[1.5px] ml-1 relative">
              <div className="absolute inset-[1px] rounded-[0.5px] bg-background/70" />
              <div className="absolute -right-[2px] top-[1.5px] w-[1.5px] h-[3px] bg-background/60 rounded-r-sm" />
            </div>
          </div>
        </div>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground rounded-b-xl z-10" />
        {/* Screen */}
        <div className={`relative ${screenW} ${screenH} rounded-[1.5rem] overflow-hidden bg-background`}>
          {children}
          {/* Home indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[40%] h-1 rounded-full bg-foreground/20" />
        </div>
      </div>
      {title && (
        <p className="text-sm font-display font-bold text-foreground text-center">{title}</p>
      )}
    </div>
  );
};

// ── Realistic mockup content components ──

export const HomeMockupContent = () => (
  <div className="p-3 pt-7 h-full flex flex-col bg-background text-foreground overflow-hidden">
    {/* Greeting */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[8px] text-muted-foreground">Bem-vindo de volta</p>
        <h3 className="text-sm font-display font-bold">Olá, Visitante!</h3>
      </div>
      <div className="flex items-center gap-1 bg-accent/15 rounded-full px-2 py-1">
        <Flame className="h-3 w-3 text-accent" />
        <span className="text-[9px] font-bold">3</span>
      </div>
    </div>

    {/* Journey banner */}
    <div className="rounded-xl overflow-hidden mb-3 relative h-[52px]" style={{ background: "linear-gradient(135deg, hsl(20 30% 18%), hsl(20 25% 28%))" }}>
      <div className="p-2.5 relative z-10">
        <p className="text-[7px] text-white/60 uppercase tracking-wider mb-0.5">Jornada Espiritual</p>
        <p className="text-[9px] text-white font-bold leading-tight">Seja guiado pelo Oluwo<br/>em sua jornada</p>
      </div>
    </div>

    {/* Featured cards */}
    <p className="text-[9px] font-bold mb-1.5">Destaques</p>
    <div className="flex gap-2 overflow-hidden">
      {[
        { title: "Ebo de Limpeza", cat: "Ebo", gradient: "linear-gradient(135deg, hsl(45 80% 50%), hsl(35 70% 45%))" },
        { title: "Oriki de Oxum", cat: "Oriki", gradient: "linear-gradient(135deg, hsl(140 40% 35%), hsl(160 45% 30%))" },
        { title: "Ibori Sagrado", cat: "Ibori", gradient: "linear-gradient(135deg, hsl(280 40% 40%), hsl(260 35% 35%))" },
      ].map((item) => (
        <div key={item.title} className="shrink-0 w-[72px] rounded-lg overflow-hidden bg-card shadow-sm">
          <div className="h-[48px]" style={{ background: item.gradient }} />
          <div className="p-1.5">
            <p className="text-[8px] font-bold truncate">{item.title}</p>
            <p className="text-[6px] text-muted-foreground">{item.cat}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom nav mockup */}
    <div className="mt-auto pt-2 border-t border-border flex items-center justify-around pb-1">
      {[
        { icon: Home, label: "Início", active: true },
        { icon: Compass, label: "Oráculo" },
        { icon: BookOpen, label: "Rituais" },
        { icon: GraduationCap, label: "Aprender" },
        { icon: Map, label: "Jornada" },
      ].map((nav) => (
        <div key={nav.label} className="flex flex-col items-center gap-0.5">
          <nav.icon className={`h-3 w-3 ${nav.active ? "text-accent" : "text-muted-foreground/50"}`} strokeWidth={1.5} />
          <span className={`text-[5px] ${nav.active ? "text-accent font-bold" : "text-muted-foreground/50"}`}>{nav.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export const OracleMockupContent = () => (
  <div className="p-3 pt-7 h-full flex flex-col bg-background text-foreground overflow-hidden">
    <div className="text-center mb-3">
      <h3 className="text-xs font-display font-bold">Como posso te ajudar hoje?</h3>
      <p className="text-[8px] text-muted-foreground mt-0.5">Escolha uma consulta</p>
    </div>
    <div className="space-y-2">
      {[
        { title: "Consulta do Obi", desc: "Jogue os 4 búzios sagrados", color: "hsl(45 80% 50%)", iconBg: "bg-accent/20" },
        { title: "Ebós e Oferendas", desc: "Descubra o ritual ideal", color: "hsl(140 40% 35%)", iconBg: "bg-primary/10" },
        { title: "Proteção Espiritual", desc: "Rituais de Iyami Osoronga", color: "hsl(280 40% 40%)", iconBg: "bg-secondary/20" },
      ].map((flow) => (
        <div key={flow.title} className="flex items-center gap-2.5 bg-card rounded-xl p-2.5 shadow-sm">
          <div className={`w-8 h-8 rounded-lg ${flow.iconBg} flex items-center justify-center shrink-0`}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: flow.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold truncate">{flow.title}</p>
            <p className="text-[7px] text-muted-foreground">{flow.desc}</p>
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        </div>
      ))}
    </div>
    <div className="mt-auto">
      <div className="w-full py-2 rounded-xl text-center text-[9px] font-bold text-accent-foreground" style={{ background: "linear-gradient(135deg, hsl(45 80% 50%), hsl(35 70% 45%))" }}>
        Iniciar Consulta
      </div>
    </div>
  </div>
);

export const RitualsMockupContent = () => (
  <div className="p-3 pt-7 h-full bg-background text-foreground overflow-hidden">
    <p className="text-[8px] text-muted-foreground mb-0.5">Conteúdos Sagrados</p>
    <h3 className="text-xs font-display font-bold mb-2.5">Rituais</h3>
    <div className="space-y-2">
      {[
        { title: "Ebo de Limpeza Espiritual", cat: "Ebo", gradient: "linear-gradient(135deg, hsl(45 80% 50%), hsl(35 70% 45%))", locked: false },
        { title: "Oriki de Ogun", cat: "Oriki", gradient: "linear-gradient(135deg, hsl(140 40% 35%), hsl(160 45% 30%))", locked: false },
        { title: "Ibori — Alimentar o Ori", cat: "Ibori", gradient: "linear-gradient(135deg, hsl(200 50% 40%), hsl(210 45% 35%))", locked: false },
        { title: "Ritual de Proteção Iyami", cat: "Iyami", gradient: "linear-gradient(135deg, hsl(280 40% 40%), hsl(260 35% 35%))", locked: true },
      ].map((ritual) => (
        <div key={ritual.title} className="flex items-center gap-2 bg-card rounded-xl p-2 shadow-sm">
          <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden" style={{ background: ritual.gradient }} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold truncate">{ritual.title}</p>
            <span className="text-[7px] text-muted-foreground">{ritual.cat}</span>
          </div>
          {ritual.locked && (
            <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
              <Lock className="h-2.5 w-2.5 text-accent" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const JourneyMockupContent = () => (
  <div className="p-3 pt-7 h-full flex flex-col bg-background text-foreground overflow-hidden">
    {/* XP Bar */}
    <div className="mb-2">
      <div className="flex items-center justify-between text-[7px] font-semibold mb-0.5">
        <span className="text-primary">Nível 2</span>
        <span className="text-muted-foreground">50/100 XP</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full w-1/2 rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--secondary)), hsl(var(--accent)))" }} />
      </div>
    </div>

    {/* Hero card */}
    <div className="rounded-xl p-3 mb-2.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(20 30% 18%), hsl(20 25% 28%))" }}>
      <p className="text-[7px] text-white/60 uppercase tracking-wider mb-1">Jornada de Hoje</p>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-white/20" />
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-accent" strokeDasharray="94" strokeDashoffset="37" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">60%</span>
        </div>
        <div>
          <p className="text-[9px] text-white font-bold">3 de 5 tarefas</p>
          <p className="text-[7px] text-white/60">Seu Ori agradece cada passo</p>
        </div>
      </div>
    </div>

    {/* Tasks */}
    <p className="text-[9px] font-bold mb-1.5">Tarefas do Dia</p>
    <div className="space-y-1.5">
      {[
        { title: "Oração ao Ori", done: true },
        { title: "Oferenda a Oxum", done: true },
        { title: "Banho de ervas", done: false },
      ].map((task) => (
        <div key={task.title} className="flex items-center gap-2 p-2 rounded-lg bg-card shadow-sm">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${task.done ? "bg-accent" : "border-2 border-muted-foreground/30"}`}>
            {task.done && <Check className="h-2.5 w-2.5 text-accent-foreground" />}
          </div>
          <p className={`text-[9px] ${task.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>{task.title}</p>
        </div>
      ))}
    </div>
  </div>
);

export const LearnMockupContent = () => (
  <div className="p-3 pt-7 h-full bg-background text-foreground overflow-hidden">
    <p className="text-[8px] text-muted-foreground mb-0.5">Aprender</p>
    <h3 className="text-xs font-display font-bold mb-2.5">Categorias</h3>
    <div className="grid grid-cols-2 gap-1.5">
      {[
        { name: "Ebo", count: 12, gradient: "linear-gradient(135deg, hsl(45 80% 50%), hsl(35 70% 45%))" },
        { name: "Oriki", count: 8, gradient: "linear-gradient(135deg, hsl(140 40% 35%), hsl(160 45% 30%))" },
        { name: "Ibori", count: 5, gradient: "linear-gradient(135deg, hsl(200 50% 40%), hsl(210 45% 35%))" },
        { name: "Egbe Orun", count: 4, gradient: "linear-gradient(135deg, hsl(25 60% 40%), hsl(20 50% 35%))" },
        { name: "Iyami", count: 6, gradient: "linear-gradient(135deg, hsl(280 40% 40%), hsl(260 35% 35%))" },
        { name: "Ori", count: 3, gradient: "linear-gradient(135deg, hsl(340 50% 45%), hsl(350 45% 40%))" },
      ].map((cat) => (
        <div key={cat.name} className="rounded-lg overflow-hidden relative" style={{ background: cat.gradient, aspectRatio: "4/3" }}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <p className="text-[9px] font-bold text-white">{cat.name}</p>
            <p className="text-[6px] text-white/70">{cat.count} conteúdos</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PhoneMockup;
