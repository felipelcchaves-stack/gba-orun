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
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-6 gap-4 bg-background">
        <Compass className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-muted-foreground text-center text-sm">Faça login para acompanhar sua jornada espiritual.</p>
        <Link to="/auth" className="text-primary font-medium text-sm underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-6 bg-background">
      <div className="max-w-lg mx-auto pt-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Início
        </Link>
        <h1 className="text-3xl font-display font-medium mb-1">Sua Jornada</h1>
        <p className="text-muted-foreground text-sm mb-8">Acompanhe os rituais sugeridos pelo Oráculo</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-2xl shadow-card animate-pulse" />)}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-card rounded-2xl p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${entry.completed ? "text-primary" : "text-muted-foreground/40"}`}>
                    {entry.completed ? <CheckCircle className="h-5 w-5" strokeWidth={1.5} /> : <Circle className="h-5 w-5" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full font-medium">
                        {entry.oracle_result}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {entry.rituals ? (
                      <Link
                        to={`/rituais/${entry.suggested_ritual_id}`}
                        className="font-display font-medium text-sm hover:text-primary flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} /> {entry.rituals.title}
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum ritual sugerido</p>
                    )}
                    {!entry.completed && entry.suggested_ritual_id && (
                      <button
                        onClick={() => completeJourney.mutate(entry.id)}
                        className="mt-2.5 text-xs bg-foreground text-background px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity"
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
          <div className="text-center py-20">
            <Compass className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">Nenhuma consulta registrada ainda.</p>
            <Link to="/oraculo" className="text-primary font-medium text-sm underline mt-2 inline-block">
              Consultar o Oráculo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyPage;
