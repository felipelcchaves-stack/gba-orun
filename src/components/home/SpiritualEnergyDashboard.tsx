import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, AlertCircle, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSpiritualAnalysis } from "@/hooks/useSpiritualAnalysis";

const levelIcon = {
  critico: <AlertTriangle className="h-4 w-4 text-destructive" />,
  atencao: <AlertCircle className="h-4 w-4 text-accent" />,
  equilibrado: <CheckCircle className="h-4 w-4 text-leaf" />,
};

const levelBg = {
  critico: "bg-destructive/10",
  atencao: "bg-accent/10",
  equilibrado: "bg-leaf/10",
};

const SpiritualEnergyDashboard = () => {
  const { data, isLoading } = useSpiritualAnalysis();

  if (isLoading || !data) return null;

  const { energies, mostUrgent } = data;

  // Check if user has no journey data at all (score 0 + total 0 = no data)
  const hasNoData = energies.every((e) => e.total === 0);

  if (hasNoData) {
    return (
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-accent" />
            Equilíbrio Espiritual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Compass className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground mb-1">Você ainda não iniciou sua jornada</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Consulte o Oráculo para ver seu equilíbrio espiritual aqui.</p>
            <Link
              to="/oraculo"
              className="inline-block text-xs font-semibold py-2 px-5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Consultar Oráculo
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Compass className="h-5 w-5 text-accent" />
          Equilíbrio Espiritual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Energy bars */}
        {energies.map((e) => (
          <div key={e.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {levelIcon[e.level]}
                <span className="text-sm font-semibold">{e.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {e.completed}/{e.total} concluídos
              </span>
            </div>
            <div className="relative">
              <Progress
                value={100 - e.score}
                className="h-3 rounded-full bg-muted"
                style={{
                  // @ts-ignore
                  "--progress-color": e.color,
                }}
              />
              <div
                className="absolute inset-0 h-3 rounded-full transition-all"
                style={{
                  width: `${100 - e.score}%`,
                  backgroundColor: e.color,
                  opacity: 0.85,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{e.suggestion}</p>
          </div>
        ))}

        {/* Most urgent suggestion */}
        {mostUrgent && mostUrgent.level !== "equilibrado" && (
          <div className={`rounded-xl p-4 mt-2 ${levelBg[mostUrgent.level]}`}>
            <div className="flex items-start gap-3">
              {levelIcon[mostUrgent.level]}
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {mostUrgent.label} precisa de atenção
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mostUrgent.suggestion}
                </p>
              </div>
            </div>
            <Link
              to="/oraculo"
              className="mt-3 block text-center text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Consultar Oráculo
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpiritualEnergyDashboard;
