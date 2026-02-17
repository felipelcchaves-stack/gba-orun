
CREATE TABLE public.ire_ibi_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ire_ibi_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ire/Ibi types are publicly readable"
  ON public.ire_ibi_types FOR SELECT USING (true);

CREATE POLICY "Admins can manage ire/ibi types"
  ON public.ire_ibi_types FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.ire_ibi_types (category, name, description, display_order) VALUES
  ('ire', 'Irê Aiku', 'Irê de saúde e longevidade', 1),
  ('ire', 'Irê Ajé', 'Irê de prosperidade e riqueza', 2),
  ('ire', 'Irê Omo', 'Irê de filhos e fertilidade', 3),
  ('ire', 'Irê Aya/Oko', 'Irê de casamento e união', 4),
  ('ibi', 'Ibi Iku', 'Ibi de morte ou perigo grave', 1),
  ('ibi', 'Ibi Arun', 'Ibi de doença', 2),
  ('ibi', 'Ibi Ofo', 'Ibi de perda material ou emocional', 3),
  ('ibi', 'Ibi Ejó', 'Ibi de demanda, confusão ou justiça', 4);
