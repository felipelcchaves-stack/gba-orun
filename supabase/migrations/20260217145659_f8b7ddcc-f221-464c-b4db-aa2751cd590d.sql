INSERT INTO public.guidance_bubbles (point_key, message, is_active)
VALUES
  ('oracle_step_ire_subtype', 'Cada Irê tem sua particularidade. Escolha com calma o tipo que mais se encaixa no que você sentiu durante a consulta.', true),
  ('oracle_step_ibi_subtype', 'Identifique o tipo de Ibi para sabermos exatamente qual cuidado espiritual tomar. Não se preocupe, cada caminho tem sua solução.', true)
ON CONFLICT (point_key) DO NOTHING;