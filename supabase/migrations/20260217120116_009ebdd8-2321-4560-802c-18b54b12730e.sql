
ALTER TABLE public.oracle_task_templates
  ADD COLUMN guidance_message TEXT DEFAULT '',
  ADD COLUMN guidance_audio_url TEXT;

ALTER TABLE public.journey_tasks
  ADD COLUMN guidance_message TEXT DEFAULT '',
  ADD COLUMN guidance_audio_url TEXT;
