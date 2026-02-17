import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllGuidanceBubbles } from "@/hooks/useGuidance";
import { useAppSettings, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import GuidanceBubble from "@/components/GuidanceBubble";

const GUIDANCE_POINTS = [
  { key: "oracle_step_intention", label: "Oráculo: Intenção" },
  { key: "oracle_step_obi", label: "Oráculo: Resultado do Obi" },
  
  { key: "oracle_step_ire_subtype", label: "Oráculo: Subtipos de Irê" },
  { key: "oracle_step_ibi_subtype", label: "Oráculo: Subtipos de Ibi" },
  { key: "oracle_step_ebo", label: "Oráculo: Ebó" },
  { key: "oracle_step_ori", label: "Oráculo: Ori" },
  { key: "oracle_step_iyami", label: "Oráculo: Iyami / Egbe" },
  { key: "oracle_step_diagnosis", label: "Oráculo: Diagnóstico" },
  { key: "ritual_reader", label: "Leitor de Ritual" },
  { key: "journey_task_card", label: "Card da Jornada" },
];

interface RowState {
  message: string;
  audio_url: string;
  is_active: boolean;
  exists: boolean;
  id?: string;
}

const AdminGuidance = () => {
  const { data: bubbles, isLoading } = useAllGuidanceBubbles();
  const { data: settings } = useAppSettings();
  const updateSetting = useUpdateAppSetting();
  const qc = useQueryClient();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.guidance_avatar_url) setAvatarUrl(settings.guidance_avatar_url);
  }, [settings]);

  useEffect(() => {
    if (!bubbles) return;
    const map: Record<string, RowState> = {};
    GUIDANCE_POINTS.forEach(p => {
      const existing = bubbles.find((b: any) => b.point_key === p.key);
      map[p.key] = existing
        ? { message: existing.message, audio_url: existing.audio_url || "", is_active: existing.is_active, exists: true, id: existing.id }
        : { message: "", audio_url: "", is_active: true, exists: false };
    });
    setRows(map);
  }, [bubbles]);

  const saveAvatar = async () => {
    try {
      // upsert into app_settings
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key: "guidance_avatar_url", value: avatarUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["app_settings"] });
      toast.success("Avatar salvo!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveRow = async (pointKey: string) => {
    const row = rows[pointKey];
    if (!row) return;
    try {
      if (row.exists && row.id) {
        const { error } = await supabase
          .from("guidance_bubbles")
          .update({ message: row.message, audio_url: row.audio_url || null, is_active: row.is_active })
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("guidance_bubbles")
          .insert({ point_key: pointKey, message: row.message, audio_url: row.audio_url || null, is_active: row.is_active });
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ["guidance_bubbles_all"] });
      qc.invalidateQueries({ queryKey: ["guidance_bubble", pointKey] });
      toast.success("Orientação salva!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const updateRow = (key: string, partial: Partial<RowState>) => {
    setRows(prev => ({ ...prev, [key]: { ...prev[key], ...partial } }));
  };

  if (isLoading) return <p className="text-muted-foreground py-8 text-center">Carregando...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Orientações do Mestre</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure os balões de orientação em cada etapa</p>
      </div>

      {/* Avatar do Mestre */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
        <Label className="font-bold">Avatar do Orientador (URL da imagem)</Label>
        <div className="flex gap-2">
          <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className="flex-1" />
          <button onClick={saveAvatar} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0">
            <Save className="h-4 w-4" /> Salvar
          </button>
        </div>
        {avatarUrl && (
          <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-400" />
        )}
      </div>

      {/* Orientações por ponto */}
      <div className="space-y-4">
        {GUIDANCE_POINTS.map(p => {
          const row = rows[p.key];
          if (!row) return null;
          return (
            <div key={p.key} className="bg-card rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm">{p.label}</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPreviewKey(previewKey === p.key ? null : p.key)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    {previewKey === p.key ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {previewKey === p.key ? "Fechar" : "Preview"}
                  </button>
                  <Switch checked={row.is_active} onCheckedChange={v => updateRow(p.key, { is_active: v })} />
                </div>
              </div>

              <textarea
                value={row.message}
                onChange={e => updateRow(p.key, { message: e.target.value })}
                placeholder="Texto de orientação do mestre..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none resize-y"
              />

              <Input
                value={row.audio_url}
                onChange={e => updateRow(p.key, { audio_url: e.target.value })}
                placeholder="URL do áudio (opcional)"
              />

              <button onClick={() => saveRow(p.key)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
                <Save className="h-4 w-4" /> Salvar
              </button>

              {previewKey === p.key && row.message && (
                <div className="pt-2 border-t border-border">
                  <GuidanceBubble pointKey={p.key} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminGuidance;
