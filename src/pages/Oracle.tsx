import { useState, useCallback } from "react";
import cowrieShell from "@/assets/cowrie-shell.png";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useCheckAchievements } from "@/hooks/useAchievements";
import { useAddJourneyEntry } from "@/hooks/useJourney";
import { useRituals } from "@/hooks/useRituals";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const ORACLE_RESULTS: Record<number, { name: string; meaning: string; description: string; trigger: string }> = {
  0: { name: "Oyekun", meaning: "Nenhum aberto", description: "Não. A resposta é negativa. Momento de recolhimento, introspecção e cuidado espiritual. Os Orixás pedem cautela.", trigger: "Oyekun" },
  1: { name: "Okaran", meaning: "1 aberto", description: "Pode ser, mas com ressalvas. Cuidado com caminhos incertos. Faça oferendas e peça orientação antes de prosseguir.", trigger: "Okaran" },
  2: { name: "Ejife", meaning: "2 abertos", description: "Sim! Confirmação absoluta. Os Orixás aprovam e abençoam. Caminho aberto, siga em frente com fé e gratidão.", trigger: "Ejife" },
  3: { name: "Etagun", meaning: "3 abertos", description: "Sim, com força! Os ancestrais estão ao seu lado. Momento de agir com coragem e determinação. Vitória garantida.", trigger: "Etagun" },
  4: { name: "Alafia", meaning: "Todos abertos", description: "Paz total! Mas confirme novamente. Alafia pode significar paz ou indiferença. Jogue mais uma vez para ter certeza.", trigger: "Alafia" },
};

const OraclePage = () => {
  const [shells, setShells] = useState<boolean[]>([false, false, false, false]);
  const [thrown, setThrown] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<typeof ORACLE_RESULTS[0] | null>(null);
  const { user } = useAuth();
  const addXP = useAddXP();
  const checkAchievements = useCheckAchievements();
  const addJourneyEntry = useAddJourneyEntry();
  const { data: rituals } = useRituals();

  const throwShells = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setResult(null);

    const interval = setInterval(() => {
      setShells(prev => prev.map(() => Math.random() > 0.5));
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      const finalShells = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5];
      setShells(finalShells);
      setThrown(true);
      setAnimating(false);

      const openCount = finalShells.filter(Boolean).length;
      const oracleResult = ORACLE_RESULTS[openCount];
      setResult(oracleResult);

      // Gamification + Journey
      if (user) {
        addXP.mutate({ xp: 10, field: "oracle_throws" }, {
          onSuccess: () => {
            // Check achievements after stats update
            addXP.data; // trigger re-fetch
          },
        });

        // Find matching ritual
        const matchingRitual = rituals?.find(r => 
          r.trigger_oracle?.toLowerCase() === oracleResult.trigger.toLowerCase()
        );
        
        addJourneyEntry.mutate({
          oracle_result: oracleResult.name,
          suggested_ritual_id: matchingRitual?.id,
        });
      }
    }, 1500);
  }, [animating, user, rituals]);

  const reset = () => {
    setShells([false, false, false, false]);
    setThrown(false);
    setResult(null);
  };

  // Find suggested rituals for current result
  const suggestedRituals = result && rituals
    ? rituals.filter(r => r.trigger_oracle?.toLowerCase() === result.trigger.toLowerCase())
    : [];

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
              className={`relative aspect-square rounded-3xl border-2 flex items-center justify-center transition-all duration-500 ${
                isOpen
                  ? "bg-accent/20 border-accent shadow-gold"
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
              : "bg-secondary text-secondary-foreground shadow-md animate-pulse-gold"
          } disabled:opacity-50`}
        >
          {animating ? "Consultando..." : thrown ? "Jogar Novamente" : "Jogar Obi"}
        </button>

        {/* Result */}
        {result && !animating && (
          <div className="mt-6 space-y-4 animate-fade-up">
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-bold">
                  {result.name}
                </span>
                <span className="text-sm text-muted-foreground">{result.meaning}</span>
              </div>
              <p className="text-foreground leading-relaxed">{result.description}</p>
            </div>

            {/* Suggested rituals */}
            {suggestedRituals.length > 0 && (
              <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
                <h3 className="font-display font-bold text-sm mb-3">Rituais Sugeridos</h3>
                <div className="space-y-2">
                  {suggestedRituals.map(r => (
                    <Link
                      key={r.id}
                      to={`/rituais/${r.id}`}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-secondary shrink-0" />
                      <span className="text-sm font-semibold">{r.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/auth" className="text-secondary underline">Faça login</Link> para salvar suas consultas e ganhar XP.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OraclePage;
