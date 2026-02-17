
INSERT INTO public.app_settings (key, value) VALUES
  ('offer_urgency_text', '🔥 Oferta por tempo limitado!'),
  ('offer_guarantee_days', '7')
ON CONFLICT (key) DO NOTHING;
