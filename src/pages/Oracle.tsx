import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAddXP } from "@/hooks/useUserStats";
import { useCheckAchievements } from "@/hooks/useAchievements";
import { useAddJourneyEntry, useCreateJourneyTasks } from "@/hooks/useJourney";
import { useRituals } from "@/hooks/useRituals";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, CheckCircle, ChevronRight, AlertTriangle, Shield, Heart, Users, Sparkles } from "lucide-react";

import obiOracle from "@/assets/obi-oracle.jpg";
import eboCategory from "@/assets/ebo-category.jpg";
import iboriCategory from "@/assets/ibori-category.jpg";
import iyamiCategory from "@/assets/iyami-category.jpg";
import egbeOrunCategory from "@/assets/egbe-orun-category.jpg";
import orikiCategory from "@/assets/oriki-category.jpg";

type OracleResult = {
  key: string;
  name: string;
  meaning: string;
  description: string;
  trigger: string;
  image: string;
  icon: typeof AlertTriangle;
  color: string;
  suggestions: Array<{
    type: string;
    title: string;
    description: string;
    category: string;
    image: string;
    icon: typeof Shield;
  }>;
};

const ORACLE_RESULTS: OracleResult[] = [
  {
    key: "oyekun",
    name: "Oyekun",
    meaning: "Nenhum aberto — NÃO",
    description: "A resposta é negativa. Momento de recolhimento, introspecção e cuidado espiritual profundo. Os Orixás pedem cautela e atenção.",
    trigger: "Oyekun",
    image: obiOracle,
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive",
    suggestions: [
      { type: "ebo", title: "Fazer Ebó de Limpeza", description: "Limpeza espiritual urgente para remover bloqueios", category: "ebo", image: eboCategory, icon: Shield },
      { type: "ibori", title: "Cuidar do Ori", description: "Fortalecer e proteger seu Ori com Ibori", category: "ibori", image: iboriCategory, icon: Heart },
      { type: "iyami", title: "Verificar Iyami", description: "Checar se há influência das Mães Ancestrais", category: "geral", image: iyamiCategory, icon: AlertTriangle },
    ],
  },
  {
    key: "okaran",
    name: "Okaran",
    meaning: "1 aberto — TALVEZ",
    description: "Pode ser, mas com ressalvas. Cuidado com caminhos incertos. Faça oferendas e peça orientação antes de prosseguir.",
    trigger: "Okaran",
    image: obiOracle,
    icon: Shield,
    color: "bg-accent/15 text-accent-foreground",
    suggestions: [
      { type: "ebo", title: "Ebó Leve", description: "Oferenda simples para abrir caminhos", category: "ebo", image: eboCategory, icon: Shield },
      { type: "ibori", title: "Fortalecer o Ori", description: "Ibori para clareza nas decisões", category: "ibori", image: iboriCategory, icon: Heart },
    ],
  },
  {
    key: "ejife",
    name: "Ejife",
    meaning: "2 abertos — SIM",
    description: "Confirmação absoluta! Os Orixás aprovam e abençoam. Caminho aberto, siga em frente com fé e gratidão.",
    trigger: "Ejife",
    image: obiOracle,
    icon: CheckCircle,
    color: "bg-primary/10 text-primary",
    suggestions: [
      { type: "oriki", title: "Oriki de Agradecimento", description: "Reze um Oriki em gratidão aos Orixás", category: "oriki", image: orikiCategory, icon: Sparkles },
    ],
  },
  {
    key: "etagun",
    name: "Etagun",
    meaning: "3 abertos — SIM FORTE",
    description: "Sim, com força! Os ancestrais estão ao seu lado. Momento de agir com coragem e determinação. Vitória garantida.",
    trigger: "Etagun",
    image: obiOracle,
    icon: Sparkles,
    color: "bg-primary/10 text-primary",
    suggestions: [
      { type: "oriki", title: "Oriki de Louvor", description: "Louve os Orixás pela força recebida", category: "oriki", image: orikiCategory, icon: Sparkles },
      { type: "egbe_orun", title: "Oferenda ao Egbe Orun", description: "Agradeça aos ancestrais com oferenda", category: "geral", image: egbeOrunCategory, icon: Users },
    ],
  },
  {
    key: "alafia",
    name: "Alafia",
    meaning: "Todos abertos — PAZ (confirme)",
    description: "Paz total! Mas Alafia pede confirmação. Pode significar paz verdadeira ou indiferença. Jogue mais uma vez para ter certeza.",
    trigger: "Alafia",
    image: obiOracle,
    icon: Heart,
    color: "bg-accent/15 text-accent-foreground",
    suggestions: [
      { type: "ibori", title: "Ibori de Proteção", description: "Mantenha a paz fortalecendo seu Ori", category: "ibori", image: iboriCategory, icon: Heart },
    ],
  },
];

const OraclePage = () => {
  const [selectedResult, setSelectedResult] = useState<OracleResult | null>(null);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const addXP = useAddXP();
  const checkAchievements = useCheckAchievements();
  const addJourneyEntry = useAddJourneyEntry();
  const createTasks = useCreateJourneyTasks();
  const { data: rituals } = useRituals();

  const handleSelect = async (result: OracleResult) => {
    setSelectedResult(result);
    setSaved(false);

    if (user) {
      addXP.mutate({ xp: 10, field: "oracle_throws" });

      // Find matching ritual
      const matchingRitual = rituals?.find(r =>
        r.trigger_oracle?.toLowerCase() === result.trigger.toLowerCase()
      );

      // Create journey entry
      const entry = await addJourneyEntry.mutateAsync({
        oracle_result: result.name,
        suggested_ritual_id: matchingRitual?.id,
        context: "rotina_diaria",
      });

      // Create suggested tasks
      if (entry) {
        const tasks = result.suggestions.map(s => {
          const matchRitual = rituals?.find(r => r.category === s.category);
          return {
            journey_id: (entry as any).id,
            task_type: s.type,
            task_title: s.title,
            ritual_id: matchRitual?.id,
          };
        });
        await createTasks.mutateAsync(tasks);
      }

      setSaved(true);
    }
  };

  const reset = () => {
    setSelectedResult(null);
    setSaved(false);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        {!selectedResult ? (
          <>
            {/* Selection screen */}
            <h1 className="text-3xl font-display font-bold text-center mb-1">Oráculo do Obi</h1>
            <p className="text-center text-muted-foreground text-sm mb-8">Qual foi o resultado do seu Obi hoje?</p>

            {/* Obi image */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden shadow-soft">
              <img src={obiOracle} alt="Obi" className="w-full h-full object-cover" />
            </div>

            {/* Result buttons */}
            <div className="space-y-3">
              {ORACLE_RESULTS.map(result => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.key}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${result.color}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-base">{result.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.meaning}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  </button>
                );
              })}
            </div>

            {!user && (
              <p className="text-center text-xs text-muted-foreground mt-6">
                <Link to="/auth" className="text-primary underline">Faça login</Link> para salvar consultas e ganhar XP.
              </p>
            )}
          </>
        ) : (
          <>
            {/* Diagnosis screen */}
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Nova consulta
            </button>

            {/* Result card */}
            <div className="bg-card rounded-2xl p-6 shadow-card mb-6 animate-fade-up">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${selectedResult.color}`}>
                  {(() => { const Icon = selectedResult.icon; return <Icon className="h-6 w-6" strokeWidth={1.5} />; })()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl">{selectedResult.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedResult.meaning}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{selectedResult.description}</p>
              {saved && (
                <div className="flex items-center gap-2 mt-4 text-xs text-primary">
                  <CheckCircle className="h-3.5 w-3.5" /> Salvo na sua jornada
                </div>
              )}
            </div>

            {/* Suggested actions */}
            <h3 className="font-display font-bold text-lg mb-3">O que fazer agora</h3>
            <div className="space-y-3">
              {selectedResult.suggestions.map((suggestion, i) => {
                const Icon = suggestion.icon;
                // Find a matching ritual to link to
                const matchRitual = rituals?.find(r => r.category === suggestion.category);

                return (
                  <div key={i} className="animate-fade-up" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
                    {matchRitual ? (
                      <Link
                        to={`/rituais/${matchRitual.id}`}
                        className="flex items-center gap-3.5 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98]"
                      >
                        <img src={suggestion.image} alt={suggestion.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      </Link>
                    ) : (
                      <Link
                        to={`/rituais?cat=${suggestion.category}`}
                        className="flex items-center gap-3.5 p-4 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98]"
                      >
                        <img src={suggestion.image} alt={suggestion.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Link to journey */}
            <Link
              to="/jornada"
              className="block mt-6 text-center bg-foreground text-background py-3 rounded-full font-medium text-sm"
            >
              Ver minha Jornada
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default OraclePage;
