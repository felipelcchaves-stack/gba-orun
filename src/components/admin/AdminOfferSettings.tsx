import { useState, useEffect } from "react";
import { useAppSettings, useUpdateAppSetting } from "@/hooks/useAppSettings";
import { toast } from "sonner";
import { Save } from "lucide-react";

const OFFER_FIELDS = [
  { key: "offer_headline", label: "Headline da Oferta", type: "text" },
  { key: "offer_price", label: "Preço da Oferta (R$)", type: "text" },
  { key: "offer_original_price", label: "Preço Original (R$)", type: "text" },
  { key: "offer_cta_text", label: "Texto do Botão", type: "text" },
  { key: "checkout_url", label: "URL de Checkout", type: "url" },
  { key: "offer_video_url", label: "URL do Vídeo (embed)", type: "url" },
  { key: "meta_pixel_id", label: "Meta Pixel ID", type: "text" },
  { key: "google_ads_id", label: "Google Ads ID", type: "text" },
  { key: "offer_urgency_text", label: "Texto de Urgência (topo)", type: "text" },
  { key: "offer_guarantee_days", label: "Dias de Garantia", type: "text" },
];

const SEO_FIELDS = [
  { key: "seo_title", label: "Título do Site", type: "text" },
  { key: "seo_description", label: "Descrição do Site", type: "text" },
  { key: "seo_og_image", label: "URL da Imagem OG", type: "url" },
  { key: "seo_canonical_url", label: "URL Canônica", type: "url" },
  { key: "seo_twitter_card", label: "Twitter Card Type", type: "text" },
];

const ALL_FIELDS = [...OFFER_FIELDS, ...SEO_FIELDS];

const AdminOfferSettings = () => {
  const { data: settings, isLoading } = useAppSettings();
  const updateSetting = useUpdateAppSetting();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      for (const field of ALL_FIELDS) {
        if (values[field.key] !== settings?.[field.key]) {
          await updateSetting.mutateAsync({ key: field.key, value: values[field.key] || "" });
        }
      }
      toast.success("Configurações salvas!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">Configure a landing page e os pixels de rastreamento.</p>

      <h3 className="text-base font-bold border-b border-border pb-2">Oferta & Pixels</h3>
      {OFFER_FIELDS.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-semibold mb-1">{field.label}</label>
          <input
            type={field.type}
            value={values[field.key] || ""}
            onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-sm"
          />
        </div>
      ))}

      <h3 className="text-base font-bold border-b border-border pb-2 mt-8">SEO e Redes Sociais</h3>
      <p className="text-xs text-muted-foreground">Esses dados atualizam as meta tags do site dinamicamente.</p>
      {SEO_FIELDS.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-semibold mb-1">{field.label}</label>
          <input
            type={field.type}
            value={values[field.key] || ""}
            onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none text-sm"
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={updateSetting.isPending}
        className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" /> Salvar Configurações
      </button>
    </div>
  );
};

export default AdminOfferSettings;
