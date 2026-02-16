
-- Add is_premium column to rituals
ALTER TABLE public.rituals ADD COLUMN is_premium boolean NOT NULL DEFAULT false;

-- Add is_premium and guru_id to profiles
ALTER TABLE public.profiles ADD COLUMN is_premium boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN guru_id text;

-- Create oracle_meanings table
CREATE TABLE public.oracle_meanings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.oracle_meanings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Oracle meanings are publicly readable"
ON public.oracle_meanings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage oracle meanings"
ON public.oracle_meanings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed oracle meanings
INSERT INTO public.oracle_meanings (name, description, action) VALUES
  ('Alafia', 'Paz! Todos os búzios abertos. Mas confirme com outra jogada.', 'Jogue novamente para confirmar.'),
  ('Etawa', 'Dúvida. Apenas 1 búzio aberto. Jogue de novo!', 'Repita a consulta com foco.'),
  ('Ejife', 'Perfeito! 2 búzios abertos. Orixá sorriu para você.', 'Caminho aberto. Prossiga com fé.'),
  ('Okanran', 'Aviso! 3 búzios abertos. Problema à vista.', 'Faça oferendas e peça proteção.'),
  ('Oyekun', 'Bloqueio Total. Nenhum búzio aberto. Chame as Mães.', 'Procure orientação espiritual urgente.');
