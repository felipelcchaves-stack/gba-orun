import { useState, useCallback } from "react";
import cowrieShell from "@/assets/cowrie-shell.png";

const ORACLE_RESULTS: Record<number, { name: string; meaning: string; description: string }> = {
  0: { name: "Oyekun", meaning: "Nenhum aberto", description: "Não. A resposta é negativa. Momento de recolhimento, introspecção e cuidado espiritual. Os Orixás pedem cautela." },
  1: { name: "Okaran", meaning: "1 aberto", description: "Pode ser, mas com ressalvas. Cuidado com caminhos incertos. Faça oferendas e peça orientação antes de prosseguir." },
  2: { name: "Ejife", meaning: "2 abertos", description: "Sim! Confirmação absoluta. Os Orixás aprovam e abençoam. Caminho aberto, siga em frente com fé e gratidão." },
  3: { name: "Etagun", meaning: "3 abertos", description: "Sim, com força! Os ancestrais estão ao seu lado. Momento de agir com coragem e determinação. Vitória garantida." },
  4: { name: "Alafia", meaning: "Todos abertos", description: "Paz total! Mas confirme novamente. Alafia pode significar paz ou indiferença. Jogue mais uma vez para ter certeza." },
};

const OraclePage = () => {
  const [shells, setShells] = useState<boolean[]>([false, false, false, false]);
  const [thrown, setThrown] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<typeof ORACLE_RESULTS[0] | null>(null);

  const throwShells = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setResult(null);

    // Animate for a moment then reveal
    const interval = setInterval(() => {
      setShells(prev => prev.map(() => Math.random() > 0.5));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalShells = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5];
      setShells(finalShells);
      setThrown(true);
      setAnimating(false);

      const openCount = finalShells.filter(Boolean).length;
      setResult(ORACLE_RESULTS[openCount]);
    }, 1500);
  }, [animating]);

  const reset = () => {
    setShells([false, false, false, false]);
    setThrown(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-lg mx-auto pt-8">
        <h1 className="text-3xl font-display font-bold text-center mb-2">Oráculo dos Búzios</h1>
        <p className="text-center text-muted-foreground mb-8">Concentre-se na sua pergunta e jogue os búzios</p>

        {/* Shells grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-xs mx-auto">
          {shells.map((isOpen, i) => (
            <div
              key={i}
              className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                isOpen
                  ? "bg-accent border-accent shadow-gold"
                  : "bg-card border-border shadow-sm"
              } ${animating ? "animate-shell-wobble" : ""}`}
            >
              <img
                src={cowrieShell}
                alt="Búzio"
                className={`w-16 h-16 object-contain transition-transform duration-500 ${
                  isOpen ? "rotate-0 drop-shadow-lg" : "rotate-180 opacity-60"
                }`}
              />
              <span className={`absolute bottom-2 text-xs font-semibold ${isOpen ? "text-accent-foreground" : "text-muted-foreground"}`}>
                {isOpen ? "Aberto" : "Fechado"}
              </span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={thrown ? reset : throwShells}
          disabled={animating}
          className={`w-full py-4 rounded-2xl text-lg font-bold font-display transition-all active:scale-[0.98] ${
            thrown
              ? "bg-card border-2 border-border text-foreground"
              : "gradient-sacred text-primary-foreground shadow-sacred animate-pulse-gold"
          } disabled:opacity-50`}
        >
          {animating ? "Consultando..." : thrown ? "Jogar Novamente" : "Jogar Obi"}
        </button>

        {/* Result */}
        {result && !animating && (
          <div className="mt-6 bg-card rounded-2xl p-6 border border-border animate-fade-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                {result.name}
              </span>
              <span className="text-sm text-muted-foreground">{result.meaning}</span>
            </div>
            <p className="text-foreground leading-relaxed">{result.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OraclePage;
