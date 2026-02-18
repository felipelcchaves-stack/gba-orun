
-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'BookOpen',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed existing categories
INSERT INTO public.categories (key, label, description, icon_name, display_order) VALUES
  ('oriki', 'Orikis', 'Louvações aos Orixás', 'Sparkles', 1),
  ('ibori', 'Ibori', 'Cuidados com o Ori', 'Heart', 2),
  ('ebo', 'Ebó', 'Oferendas e limpezas', 'Shield', 3),
  ('oracao_manha', 'Orações da Manhã', 'Orações para iniciar o dia', 'Sunrise', 4),
  ('oracao_noite', 'Orações da Noite', 'Orações antes de dormir', 'Moon', 5),
  ('oracao_ori', 'Orações de Ori', 'Orações específicas para o Ori', 'Sun', 6),
  ('oracao_iyami', 'Orações de Iyami', 'Orações para apaziguar Iyami', 'AlertTriangle', 7),
  ('cantiga', 'Cantigas', 'Cantigas sagradas', 'Music', 8),
  ('egbe_orun', 'Egbe Orun', 'Ancestralidade e comunidade', 'Users', 9),
  ('iyami', 'Iyami', 'Rituais de Iyami Osoronga', 'AlertTriangle', 10),
  ('geral', 'Fundamentos', 'Conteúdo geral', 'BookOpen', 11);
