import { useJourney, useCompleteJourney } from "@/hooks/useJourney";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Compass, BookOpen } from "lucide-react";

const JourneyPage = () => {
  const { user } = useAuth();
  const { data: entries, isLoading } = useJourney();
  const completeJourney = useCompleteJourney();

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-5 gap-4">
        <Compass className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Faça login para acompanhar sua jornada espiritual.</p>
        <Link to="/auth" className="text-primary font-semibold underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-5">
      <div className="max-w-lg mx-auto pt-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
        <h1 className="text-3xl font-display font-bold mb-2">Sua Jornada</h1>
        <p className="text-muted-foreground mb-6">Acompanhe os rituais sugeridos pelo Oráculo</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 shrink-0 ${entry.completed ? "text-primary" : "text-muted-foreground"}`}>
                    {entry.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-semibold">
                        {entry.oracle_result}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {entry.rituals ? (
                      <Link
                        to={`/rituais/${entry.suggested_ritual_id}`}
                        className="font-display font-bold text-sm hover:text-primary flex items-center gap-1"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> {entry.rituals.title}
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum ritual sugerido</p>
                    )}
                    {!entry.completed && entry.suggested_ritual_id && (
                      <button
                        onClick={() => completeJourney.mutate(entry.id)}
                        className="mt-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold hover:bg-primary/20"
                      >
                        Marcar como concluído
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma consulta registrada ainda.</p>
            <Link to="/oraculo" className="text-primary font-semibold underline text-sm mt-2 inline-block">
              Consultar o Oráculo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyPage;
