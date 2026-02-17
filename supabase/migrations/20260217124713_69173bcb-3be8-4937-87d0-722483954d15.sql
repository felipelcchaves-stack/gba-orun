ALTER TABLE public.promotions
  ADD COLUMN target_knowledge_gaps text[] NOT NULL DEFAULT '{}',
  ADD COLUMN force_show_all boolean NOT NULL DEFAULT false;