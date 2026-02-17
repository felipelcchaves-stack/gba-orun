import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import OracleProgressBar from "@/components/oracle/OracleProgressBar";
import StepIntention from "@/components/oracle/StepIntention";
import StepObiResult from "@/components/oracle/StepObiResult";
import StepEbo from "@/components/oracle/StepEbo";
import StepOri from "@/components/oracle/StepOri";
import StepIyamiEgbe from "@/components/oracle/StepIyamiEgbe";
import StepDiagnosis, { type WizardState } from "@/components/oracle/StepDiagnosis";
import { useOracleConfigs } from "@/hooks/useOracleConfig";
import { OBI_RESULTS_FALLBACK } from "@/components/oracle/StepObiResult";

const TOTAL_STEPS = 6;

const OraclePage = () => {
  const { user } = useAuth();
  const { data: dbConfigs } = useOracleConfigs();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<Partial<WizardState>>({});

  const reset = () => {
    setStep(1);
    setState({});
  };

  const goBack = () => {
    if (step <= 1) return;
    setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        {step > 1 && step < TOTAL_STEPS && (
          <button onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
          </button>
        )}

        {step === TOTAL_STEPS && (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Nova consulta
          </button>
        )}

        {step > 1 && <OracleProgressBar currentStep={step - 1} totalSteps={TOTAL_STEPS - 1} />}

        <div className="animate-fade-up">
          {step === 1 && (
            <StepIntention onSelect={(intention) => {
              setState(s => ({ ...s, intention }));
              setStep(2);
            }} />
          )}

          {step === 2 && (
            <>
              <StepObiResult onSelect={(key) => {
                const config = dbConfigs?.find(c => c.result_key === key);
                const fallback = OBI_RESULTS_FALLBACK.find(r => r.key === key);
                const ireOrIbi = (config?.default_ire_ibi || fallback?.default_ire_ibi || "ibi") === "ire" ? "ire" : "ibi";
                setState(s => ({ ...s, result: key, ireOrIbi }));
                setStep(3);
              }} />
              {!user && (
                <p className="text-center text-xs text-muted-foreground mt-6">
                  <Link to="/auth" className="text-primary underline">Faça login</Link> para salvar consultas e ganhar XP.
                </p>
              )}
            </>
          )}

          {step === 3 && (
            <StepEbo
              ireOrIbi={state.ireOrIbi!}
              onAnswer={(apurado, tipo) => {
                setState(s => ({ ...s, eboApurado: apurado, eboTipo: tipo }));
                setStep(4);
              }}
            />
          )}

          {step === 4 && (
            <StepOri
              ireOrIbi={state.ireOrIbi!}
              onAnswer={(precisa, acao) => {
                setState(s => ({ ...s, oriPrecisa: precisa, oriAcao: acao }));
                setStep(5);
              }}
            />
          )}

          {step === 5 && (
            <StepIyamiEgbe
              onAnswer={(iyamiQuer, egbeOrunQuer) => {
                setState(s => ({ ...s, iyamiQuer, egbeOrunQuer }));
                setStep(6);
              }}
            />
          )}

          {step === 6 && (
            <StepDiagnosis state={state as WizardState} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OraclePage;
