ALTER TABLE public.ire_ibi_types
  ADD COLUMN guidance_message text NOT NULL DEFAULT '',
  ADD COLUMN guidance_audio_url text,
  ADD COLUMN ritual_id uuid REFERENCES public.rituals(id) ON DELETE SET NULL,
  ADD COLUMN offering_id uuid REFERENCES public.offerings(id) ON DELETE SET NULL;