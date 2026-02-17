
-- Tabela de oferendas
CREATE TABLE public.offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  ingredients text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'geral',
  is_premium boolean NOT NULL DEFAULT false,
  audio_url text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offerings are publicly readable"
  ON public.offerings FOR SELECT USING (true);

CREATE POLICY "Admins can manage offerings"
  ON public.offerings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Coluna em oracle_task_templates
ALTER TABLE public.oracle_task_templates
  ADD COLUMN offering_id uuid REFERENCES public.offerings(id) ON DELETE SET NULL;

-- Coluna em journey_tasks
ALTER TABLE public.journey_tasks
  ADD COLUMN offering_id uuid REFERENCES public.offerings(id) ON DELETE SET NULL;
