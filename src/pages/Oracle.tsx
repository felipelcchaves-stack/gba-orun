import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOracleFlows } from "@/hooks/useOracleFlows";
import DynamicFlowRunner from "@/components/oracle/DynamicFlowRunner";
import { Link } from "react-router-dom";

const OraclePage = () => {
  const { user } = useAuth();
  const { data: allFlows, isLoading } = useOracleFlows();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const activeFlows = allFlows?.filter(f => f.is_active) || [];

  // If a flow is selected, run it
  if (selectedFlowId) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <div className="max-w-lg mx-auto pt-10 px-6">
          <DynamicFlowRunner flowId={selectedFlowId} />
        </div>
      </div>
    );
  }

  // Auto-start if only 1 active flow
  if (!isLoading && activeFlows.length === 1) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <div className="max-w-lg mx-auto pt-10 px-6">
          <DynamicFlowRunner flowId={activeFlows[0].id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeFlows.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h2 className="text-xl font-display font-bold text-foreground">Nenhum fluxo configurado</h2>
            <p className="text-muted-foreground text-sm">Acesse o painel admin para criar um fluxo de consulta.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-display font-bold text-center mb-2">Como posso te ajudar hoje?</h1>
            <p className="text-center text-muted-foreground text-sm mb-8">Escolha o tipo de consulta</p>

            <div className="space-y-4">
              {activeFlows.map(flow => (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className="w-full flex items-center gap-4 p-5 bg-card rounded-2xl shadow-card hover:shadow-soft transition-all active:scale-[0.98] text-left"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg">{flow.name}</h3>
                    {flow.description && <p className="text-sm text-muted-foreground mt-0.5">{flow.description}</p>}
                  </div>
                </button>
              ))}
            </div>

            {!user && (
              <p className="text-center text-xs text-muted-foreground mt-8">
                <Link to="/auth" className="text-primary underline">Faça login</Link> para salvar consultas e ganhar XP.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OraclePage;
