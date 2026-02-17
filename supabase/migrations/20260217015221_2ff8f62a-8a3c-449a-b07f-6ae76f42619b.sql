
-- Create community_posts table
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read posts"
  ON public.community_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any post"
  ON public.community_posts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create community_replies table
CREATE TABLE public.community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read replies"
  ON public.community_replies FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own replies"
  ON public.community_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies"
  ON public.community_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any reply"
  ON public.community_replies FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_replies;
