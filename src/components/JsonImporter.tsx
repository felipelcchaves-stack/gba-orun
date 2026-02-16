import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const JsonImporter = () => {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    try {
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      const rituals = items.map((item: any) => ({
        title: item.title || "Sem título",
        category: item.category || "geral",
        content_full: item.content_full || item.content || "",
        trigger_oracle: item.trigger_oracle || null,
        image_url: item.image_url || null,
        is_premium: item.is_premium ?? false,
      }));

      const { error } = await supabase.from("rituals").insert(rituals);
      if (error) throw error;

      toast.success(`${rituals.length} ritual(is) importado(s) com sucesso!`);
      setJson("");
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        toast.error("JSON inválido. Verifique a formatação.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
        <Upload className="h-5 w-5" /> Importador JSON
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Cole um array JSON de rituais. Campos: title, category, content_full, trigger_oracle, image_url, is_premium
      </p>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder={`[\n  {\n    "title": "Oriki de Ogun",\n    "category": "oriki",\n    "content_full": "# Ogun\\n\\nTexto completo...",\n    "is_premium": true\n  }\n]`}
        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none min-h-[200px] font-mono text-sm resize-y"
      />
      <button
        onClick={handleImport}
        disabled={!json.trim() || loading}
        className="mt-3 w-full py-3 rounded-xl gradient-sacred text-primary-foreground font-bold disabled:opacity-50"
      >
        {loading ? "Importando..." : "Importar Rituais"}
      </button>
    </div>
  );
};

export default JsonImporter;
