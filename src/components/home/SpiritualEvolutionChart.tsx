import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useSpiritualAnalysis } from "@/hooks/useSpiritualAnalysis";

const LINES = [
  { key: "ebo", label: "Ebó", color: "hsl(25, 60%, 35%)" },
  { key: "ori", label: "Ori", color: "hsl(45, 90%, 52%)" },
  { key: "iyami", label: "Iyami", color: "hsl(300, 100%, 25%)" },
  { key: "egbe", label: "Egbé", color: "hsl(120, 40%, 38%)" },
];

const SpiritualEvolutionChart = () => {
  const { data, isLoading } = useSpiritualAnalysis();
  const [open, setOpen] = useState(false);

  if (isLoading || !data) return null;

  // Hide chart when user has no journey data
  const hasNoData = data.energies.every((e) => e.total === 0);
  if (hasNoData) return null;

  return (
    <Card className="border-0 shadow-card">
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Evolução Semanal
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
          <div className="h-[220px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="semana"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                {LINES.map((l) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    name={l.label}
                    stroke={l.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: l.color }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {LINES.map((l) => (
              <div key={l.key} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SpiritualEvolutionChart;
