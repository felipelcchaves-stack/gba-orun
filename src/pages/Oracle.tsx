import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import OracleProgressBar from "@/components/oracle/OracleProgressBar";
import StepObiResult from "@/components/oracle/StepObiResult";
import StepIreIbi from "@/components/oracle/StepIreIbi";
import StepEbo from "@/components/oracle/StepEbo";
import StepOri from "@/components/oracle/StepOri";
import StepIyamiEgbe from "@/components/oracle/StepIyamiEgbe";
import StepDiagnosis, { type WizardState } from "@/components/oracle/StepDiagnosis";

const OraclePage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<Partial<WizardState>>({});

  const reset = () => {
    setStep(1);
    setState({});
  };

  const goBack = () => {
    if (step === 1) return;
    setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="max-w-lg mx-auto pt-10 px-6">
        {step > 1 && step < 6 && (
          <button onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
          </button>
        )}

        {step === 6 && (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Nova consulta
          </button>
        )}

        {step > 1 && <OracleProgressBar currentStep={step} />}

        <div className="animate-fade-up">
          {step === 1 && (
            <>
              <StepObiResult onSelect={(key) => {
                setState(s => ({ ...s, result: key }));
                setStep(2);
              }} />
              {!user && (
                <p className="text-center text-xs text-muted-foreground mt-6">
                  <Link to="/auth" className="text-primary underline">Faça login</Link> para salvar consultas e ganhar XP.
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <StepIreIbi
              obiResult={state.result!}
              onSelect={(value) => {
                setState(s => ({ ...s, ireOrIbi: value }));
                setStep(3);
              }}
            />
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
