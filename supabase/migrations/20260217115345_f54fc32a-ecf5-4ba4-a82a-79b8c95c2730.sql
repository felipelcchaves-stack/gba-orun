
CREATE TABLE public.guidance_bubbles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_key TEXT NOT NULL UNIQUE,
  message TEXT NOT NULL DEFAULT '',
  audio_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guidance_bubbles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guidance bubbles are publicly readable"
ON public.guidance_bubbles FOR SELECT
USING (true);

CREATE POLICY "Admins can manage guidance bubbles"
ON public.guidance_bubbles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_guidance_bubbles_updated_at
BEFORE UPDATE ON public.guidance_bubbles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
