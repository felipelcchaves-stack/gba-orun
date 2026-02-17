import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSaveOnboarding, UserKnowledge } from "@/hooks/useOnboarding";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Sparkles, BookOpen, Brain, Shield, Users, Compass, Check, X } from "lucide-react";

const KNOWLEDGE_QUESTIONS = [
  { key: "knows_obi" as const, icon: Compass, label: "Você sabe jogar Obi (Obí Abatá)?", desc: "Lançar os 4 pedaços de noz de cola para consultar o Orixá." },
  { key: "knows_ebo" as const, icon: BookOpen, label: "Você sabe preparar e oferecer Ebó?", desc: "Oferendas rituais para resolver problemas espirituais." },
  { key: "knows_ori" as const, icon: Brain, label: "Você sabe cuidar do seu Ori (Ibori)?", desc: "Alimentar e fortalecer sua cabeça espiritual." },
  { key: "knows_iyami" as const, icon: Shield, label: "Você conhece o culto a Iyami Osoronga?", desc: "As Grandes Mães ancestrais e seu poder." },
  { key: "knows_egbe_orun" as const, icon: Users, label: "Você sabe sobre Egbe Orun?", desc: "Sua comunidade espiritual no plano celestial." },
];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const saveOnboarding = useSaveOnboarding();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [religion, setReligion] = useState(profile?.religion || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [knowledge, setKnowledge] = useState<UserKnowledge>({
    knows_obi: false, knows_ebo: false, knows_ori: false, knows_iyami: false, knows_egbe_orun: false,
  });

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswer = (key: keyof UserKnowledge, value: boolean) => {
    setKnowledge(prev => ({ ...prev, [key]: value }));
  };

  const lacunas = Object.values(knowledge).filter(v => !v).length;

  const handleFinish = async () => {
    try {
      await saveOnboarding.mutateAsync({
        display_name: displayName || undefined,
        religion: religion || undefined,
        gender: gender || undefined,
        knowledge,
      });
      toast.success("Bem-vindo à sua jornada espiritual! 🌟");
      navigate("/", { replace: true });
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Progress value={progress} className="h-2" />

        {step === 0 && (
          <Card className="border-2 border-accent/30">
            <CardContent className="p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="text-4xl">🦎</div>
                <h1 className="text-xl font-display font-bold text-foreground">Olá! Vamos conhecer você melhor.</h1>
                <p className="text-sm text-muted-foreground">O Agemo vai te guiar nessa jornada.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Nome de exibição</label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Como quer ser chamado?" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Tradição/Religião</label>
                  <Select value={religion} onValueChange={setReligion}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candomble">Candomblé</SelectItem>
                      <SelectItem value="umbanda">Umbanda</SelectItem>
                      <SelectItem value="ifa">Ifá</SelectItem>
                      <SelectItem value="outra">Outra</SelectItem>
                      <SelectItem value="prefiro_nao_dizer">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Gênero</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="nao_binario">Não-binário</SelectItem>
                      <SelectItem value="prefiro_nao_dizer">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => setStep(1)} className="w-full bg-primary text-primary-foreground font-semibold rounded-xl h-12">
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-display font-bold text-foreground">O que você já sabe?</h2>
              <p className="text-sm text-muted-foreground">Isso nos ajuda a personalizar sua experiência.</p>
            </div>

            {KNOWLEDGE_QUESTIONS.map(q => {
              const Icon = q.icon;
              const answered = knowledge[q.key];
              return (
                <Card key={q.key} className={`border-2 transition-colors ${answered ? "border-leaf/40 bg-leaf/5" : "border-border"}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted"><Icon className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{q.label}</p>
                        <p className="text-xs text-muted-foreground">{q.desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={knowledge[q.key] ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 rounded-xl ${knowledge[q.key] ? "bg-leaf text-leaf-foreground" : ""}`}
                        onClick={() => handleAnswer(q.key, true)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Sim
                      </Button>
                      <Button
                        variant={!knowledge[q.key] ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 rounded-xl ${!knowledge[q.key] ? "bg-accent text-accent-foreground" : ""}`}
                        onClick={() => handleAnswer(q.key, false)}
                      >
                        <X className="h-4 w-4 mr-1" /> Ainda não
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Button onClick={() => setStep(2)} className="w-full bg-primary text-primary-foreground font-semibold rounded-xl h-12">
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <Card className="border-2 border-accent/30">
            <CardContent className="p-6 space-y-5 text-center">
              <div className="text-5xl">
                {lacunas === 0 ? "🌟" : "🌱"}
              </div>
              <Sparkles className="h-8 w-8 text-accent mx-auto" />
              <h2 className="text-xl font-display font-bold text-foreground">
                {lacunas === 0
                  ? "Você já tem uma boa base!"
                  : "Ótimo! Vamos te guiar em cada passo."}
              </h2>
              <p className="text-sm text-muted-foreground">
                {lacunas === 0
                  ? "Vamos aprofundar seus conhecimentos juntos."
                  : "Seus Orixás vão adorar ver você evoluindo! 🙏"}
              </p>

              <Button
                onClick={handleFinish}
                disabled={saveOnboarding.isPending}
                className="w-full bg-accent text-accent-foreground font-bold rounded-xl h-14 text-lg"
              >
                {saveOnboarding.isPending ? "Salvando..." : "Começar Jornada 🚀"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
