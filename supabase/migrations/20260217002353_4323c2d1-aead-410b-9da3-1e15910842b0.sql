
-- Add notes and context columns to user_journey
ALTER TABLE public.user_journey
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS context text;

-- Create journey_tasks table
CREATE TABLE public.journey_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.user_journey(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  task_type text NOT NULL,
  task_title text NOT NULL,
  ritual_id uuid REFERENCES public.rituals(id) ON DELETE SET NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journey_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own tasks"
ON public.journey_tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
ON public.journey_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON public.journey_tasks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON public.journey_tasks
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_journey_tasks_journey_id ON public.journey_tasks(journey_id);
CREATE INDEX idx_journey_tasks_user_id ON public.journey_tasks(user_id);
