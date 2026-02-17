import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, BookOpen, Volume2 } from "lucide-react";
import { useState } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

const MODULES = [
  { key: "", label: "Todos" },
  { key: "oriki", label: "Orikis" },
  { key: "ibori", label: "Ibori" },
  { key: "ebo", label: "Ebós" },
  { key: "geral", label: "Fundamentos" },
];

const LearnPage = () => {
  const [module, setModule] = useState("");
  const { data: rituals, isLoading } = useRituals(module || undefined);
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (ritual: any, e: React.MouseEvent) => {
    if (ritual.is_premium && !isPremium) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-6 bg-background">
      <div className="max-w-lg mx-auto pt-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Início
        </Link>
        <h1 className="text-3xl font-display font-medium mb-1">Aprender</h1>
        <p className="text-muted-foreground text-sm mb-8">Estude a sabedoria ancestral</p>

        {/* Module chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {MODULES.map(m => (
            <button
              key={m.key}
              onClick={() => setModule(m.key)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                module === m.key
                  ? "bg-foreground text-background"
                  : "bg-transparent border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="space-y-4">
            {rituals.map((ritual: any) => (
              <Link
                key={ritual.id}
                to={`/rituais/${ritual.id}`}
                onClick={(e) => handleClick(ritual, e)}
                className="flex items-center gap-4 py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors"
              >
                {ritual.image_url ? (
                  <img src={ritual.image_url} alt={ritual.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-medium text-base truncate">{ritual.title}</h3>
                  <span className="text-sm text-muted-foreground capitalize mt-0.5 block">{ritual.category}</span>
                  <div className="flex items-center gap-3 mt-1.5">
                    {ritual.is_premium && !isPremium && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent-foreground bg-accent/15 px-2 py-0.5 rounded-full font-medium">
                        <Lock className="h-3 w-3" /> Premium
                      </span>
                    )}
                    {ritual.audio_url && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Volume2 className="h-3 w-3" /> Áudio
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">Nenhum conteúdo disponível.</p>
          </div>
        )}
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LearnPage;
