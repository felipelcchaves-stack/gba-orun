
ALTER TABLE public.oracle_configs
  ADD COLUMN guidance_message TEXT NOT NULL DEFAULT '',
  ADD COLUMN guidance_audio_url TEXT;
