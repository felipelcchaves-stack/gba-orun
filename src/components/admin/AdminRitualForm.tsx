import { useState, useEffect } from "react";
import { Ritual } from "@/hooks/useRituals";

const CATEGORIES = ["oriki", "ibori", "ebo", "geral"];

interface AdminRitualFormProps {
  editing: Ritual | null;
  onSave: (payload: any) => void;
  onCancel: () => void;
}

const AdminRitualForm = ({ editing, onSave, onCancel }: AdminRitualFormProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("geral");
  const [contentFull, setContentFull] = useState("");
  const [triggerOracle, setTriggerOracle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setCategory(editing.category);
      setContentFull(editing.content_full);
      setTriggerOracle(editing.trigger_oracle || "");
      setImageUrl(editing.image_url || "");
      setAudioUrl((editing as any).audio_url || "");
      setIsPremium(editing.is_premium ?? false);
    } else {
      setTitle(""); setCategory("geral"); setContentFull(""); setTriggerOracle(""); setImageUrl(""); setAudioUrl(""); setIsPremium(false);
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      category,
      content_full: contentFull,
      trigger_oracle: triggerOracle || null,
      image_url: imageUrl || null,
      audio_url: audioUrl || null,
      is_premium: isPremium,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-background rounded-2xl p-6 w-full max-w-2xl my-8 border border-border">
        <h2 className="text-2xl font-display font-bold mb-4">{editing ? "Editar Ritual" : "Novo Ritual"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="w-5 h-5 rounded accent-accent" />
                <span className="text-sm font-semibold">🔒 Premium</span>
              </label>
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
