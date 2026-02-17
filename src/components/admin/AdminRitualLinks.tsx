import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, Save, Loader2 } from "lucide-react";
import { useRitualLinks, useSaveRitualLink } from "@/hooks/useRitualLinks";
import RitualCombobox from "@/components/RitualCombobox";

const APP_POINTS = [
  { key: "oracle_step_obi", label: "Oráculo - Resultado do Obi", desc: "Tela de escolha do resultado (Oyekun, Ejife, etc.)" },
  { key: "oracle_step_ire_ibi", label: "Oráculo - Irê ou Ibi", desc: "Escolha entre caminho positivo ou negativo" },
  { key: "oracle_step_ebo", label: "Oráculo - Ebó", desc: "Etapa para verificar se o Ebó foi apurado" },
  { key: "oracle_step_ori", label: "Oráculo - Ori", desc: "Etapa de cuidado com o Ori" },
  { key: "oracle_step_iyami_egbe", label: "Oráculo - Iyami e Egbe", desc: "Verificação de Iyami e Egbe Orun" },
  { key: "oracle_step_diagnosis", label: "Oráculo - Diagnóstico", desc: "Tela final com resumo e tarefas" },
  { key: "home_spiritual_care", label: "Home - Cuidado Espiritual", desc: "Card de cuidado espiritual na tela inicial" },
  { key: "home_energy_dashboard", label: "Home - Dashboard de Energias", desc: "Painel de energias espirituais" },
];

const AdminRitualLinks = () => {
  const { data: links, isLoading } = useRitualLinks();
  const saveLink = useSaveRitualLink();
  const [localValues, setLocalValues] = useState<Record<string, string | null>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (links) {
      const map: Record<string, string | null> = {};
      links.forEach(l => { map[l.app_point] = l.ritual_id; });
      setLocalValues(map);
    }
  }, [links]);

  const handleSave = async (appPoint: string) => {
    setSavingKey(appPoint);
    try {
      await saveLink.mutateAsync({ app_point: appPoint, ritual_id: localValues[appPoint] ?? null });
      toast.success("Link salvo!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setSavingKey(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Links de Ajuda</h1>
        <p className="text-sm text-muted-foreground mt-1">Vincule rituais/rezas a pontos estratégicos do app</p>
      </div>

      <div className="grid gap-4">
        {APP_POINTS.map(p => {
          const currentValue = localValues[p.key] ?? null;
          const dbValue = links?.find(l => l.app_point === p.key)?.ritual_id ?? null;
          const hasChanged = currentValue !== dbValue;

          return (
            <div key={p.key} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm">{p.label}</h3>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <RitualCombobox
                    value={currentValue}
                    onChange={(val) => setLocalValues(prev => ({ ...prev, [p.key]: val }))}
                    placeholder="Selecionar ritual..."
                  />
                </div>
                {hasChanged && (
                  <button
                    onClick={() => handleSave(p.key)}
                    disabled={savingKey === p.key}
                    className="shrink-0 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingKey === p.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Salvar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRitualLinks;
