
CREATE TABLE public.app_ritual_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_point text UNIQUE NOT NULL,
  ritual_id uuid REFERENCES public.rituals(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_ritual_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ritual links are readable by authenticated"
ON public.app_ritual_links FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage ritual links"
ON public.app_ritual_links FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
