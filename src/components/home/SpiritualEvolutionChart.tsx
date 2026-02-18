import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSpiritualAnalysis } from "@/hooks/useSpiritualAnalysis";

const SpiritualEvolutionChart = () => {
  const { data, isLoading } = useSpiritualAnalysis();
  const [open, setOpen] = useState(false);

  if (isLoading || !data) return null;

  // Only show energies that have data
  const energiesWithData = data.energies.filter((e) => e.total > 0);
  if (energiesWithData.length === 0) return null;

  // Radar data: score inverted (100 = equilibrado, 0 = critico)
  const radarData = energiesWithData.map((e) => ({
    energy: e.label,
    value: 100 - e.score,
    fullMark: 100,
  }));

  return (
    <Card className="border-0 shadow-card">
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Mapa Espiritual
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent>
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="energy"
                  tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickCount={4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value}%`, "Equilíbrio"]}
                />
                <Radar
                  name="Equilíbrio"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Quanto maior a área, mais equilibrado você está
          </p>
          {data.mostUrgent && data.mostUrgent.level !== "equilibrado" && (
            <p className="text-xs text-center mt-2 text-accent font-medium">
              ✨ Que tal cuidar do seu {data.mostUrgent.label} hoje?
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SpiritualEvolutionChart;
