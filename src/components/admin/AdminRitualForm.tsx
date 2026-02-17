import { useState, useEffect } from "react";
import { Ritual } from "@/hooks/useRituals";
import { X } from "lucide-react";

import { ALL_CATEGORY_KEYS, getCategoryLabel } from "@/lib/categories";
const CATEGORIES = ALL_CATEGORY_KEYS;

const TASK_TYPES = [
  { key: "ebo", label: "Ebó" },
  { key: "ibori", label: "Ibori" },
  { key: "oracao_ori", label: "Oração de Ori" },
  { key: "oracao_iyami", label: "Oração de Iyami" },
  { key: "oracao_manha", label: "Oração da Manhã" },
  { key: "oracao_noite", label: "Oração da Noite" },
  { key: "cantiga", label: "Cantiga" },
  { key: "egbe_orun", label: "Egbe Orun" },
  { key: "oriki", label: "Oriki" },
  { key: "iyami", label: "Iyami" },
];

function parseTaskTypes(trigger: string | null): string[] {
  if (!trigger) return [];
  return trigger.split(",").filter(s => s.startsWith("task:")).map(s => s.replace("task:", ""));
}

function buildTriggerOracle(baseTrigger: string, taskTypes: string[]): string {
  const nonTaskParts = baseTrigger.split(",").filter(s => !s.startsWith("task:") && s.trim());
  const taskParts = taskTypes.map(t => `task:${t}`);
  return [...nonTaskParts, ...taskParts].join(",");
}

interface AdminRitualFormProps {
  editing: Ritual | null;
  onSave: (payload: any) => void;
  onCancel: () => void;
  defaultCategory?: string;
}

const AdminRitualForm = ({ editing, onSave, onCancel, defaultCategory }: AdminRitualFormProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("geral");
  const [contentFull, setContentFull] = useState("");
  const [triggerOracle, setTriggerOracle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setCategory(editing.category);
      setContentFull(editing.content_full);
      const raw = editing.trigger_oracle || "";
      setTriggerOracle(raw.split(",").filter(s => !s.startsWith("task:")).join(","));
      setSelectedTaskTypes(parseTaskTypes(editing.trigger_oracle));
      setImageUrl(editing.image_url || "");
      setAudioUrl((editing as any).audio_url || "");
      setIsPremium(editing.is_premium ?? false);
    } else {
      setTitle(""); setCategory(defaultCategory || "geral"); setContentFull(""); setTriggerOracle(""); setImageUrl(""); setAudioUrl(""); setIsPremium(false); setSelectedTaskTypes([]);
    }
  }, [editing, defaultCategory]);

  const toggleTaskType = (key: string) => {
    setSelectedTaskTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      category,
      content_full: contentFull,
      trigger_oracle: buildTriggerOracle(triggerOracle, selectedTaskTypes) || null,
      image_url: imageUrl || null,
      audio_url: audioUrl || null,
      is_premium: isPremium,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-background rounded-2xl p-6 w-full max-w-2xl my-8 border border-border">
        <h2 className="text-2xl font-display font-bold mb-4">{editing ? "Editar Ritual" : defaultCategory?.startsWith("oracao") ? "Nova Oração" : "Novo Ritual"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="w-5 h-5 rounded accent-accent" />
                <span className="text-sm font-semibold">🔒 Premium</span>
              </label>
            </div>
          </div>

          {/* Task Types multi-select chips */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tipos de Tarefa Associados</label>
            <p className="text-xs text-muted-foreground mb-2">Selecione para quais tarefas do oráculo este ritual será sugerido automaticamente.</p>
            <div className="flex flex-wrap gap-2">
              {TASK_TYPES.map(tt => {
                const isSelected = selectedTaskTypes.includes(tt.key);
                return (
                  <button
                    key={tt.key}
                    type="button"
                    onClick={() => toggleTaskType(tt.key)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {tt.label}
                    {isSelected && <X className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Trigger Oráculo (opcional)</label>
            <input type="text" value={triggerOracle} onChange={e => setTriggerOracle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: Ejife, Alafia..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">URL da Imagem (opcional)</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">URL do Áudio (opcional)</label>
            <input type="url" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Conteúdo Completo (Markdown)</label>
            <textarea value={contentFull} onChange={e => setContentFull(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none min-h-[300px] font-mono text-sm resize-y" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold">
              {editing ? "Salvar Alterações" : "Criar Ritual"}
            </button>
            <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-border font-semibold">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRitualForm;
