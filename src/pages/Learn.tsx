import { useRituals } from "@/hooks/useRituals";
import { usePremium } from "@/hooks/usePremium";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Lock, BookOpen, Volume2 } from "lucide-react";
import { useState } from "react";
import PremiumLockModal from "@/components/PremiumLockModal";

const MODULES = [
  { key: "", label: "Todos", icon: "📚" },
  { key: "oriki", label: "Orikis", icon: "🪘" },
  { key: "ibori", label: "Ibori", icon: "🕯️" },
  { key: "ebo", label: "Ebós", icon: "🌿" },
  { key: "geral", label: "Fundamentos", icon: "📖" },
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
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-lg mx-auto pt-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-secondary/20 rounded-xl p-3">
            <GraduationCap className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Aprender</h1>
            <p className="text-muted-foreground text-sm">Estude a sabedoria ancestral</p>
          </div>
        </div>

        {/* Module chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {MODULES.map(m => (
            <button
              key={m.key}
              onClick={() => setModule(m.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                module === m.key
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : rituals && rituals.length > 0 ? (
          <div className="grid gap-3">
            {rituals.map((ritual: any) => (
              <Link
                key={ritual.id}
                to={`/rituais/${ritual.id}`}
                onClick={(e) => handleClick(ritual, e)}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md transition-all active:scale-[0.99] flex"
              >
                {ritual.image_url && (
                  <img src={ritual.image_url} alt={ritual.title} className="w-24 h-24 object-cover shrink-0" />
                )}
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-sm truncate">{ritual.title}</h3>
                    {ritual.is_premium && !isPremium && <Lock className="h-3.5 w-3.5 text-accent shrink-0" />}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{ritual.category}</span>
                  {ritual.audio_url && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                      <Volume2 className="h-3 w-3" /> Áudio disponível
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum conteúdo disponível.</p>
          </div>
        )}
      </div>
      <PremiumLockModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LearnPage;
