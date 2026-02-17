
-- Create user_reviews table
CREATE TABLE public.user_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  rating integer NOT NULL,
  review_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved boolean NOT NULL DEFAULT true,
  CONSTRAINT user_reviews_user_id_unique UNIQUE (user_id),
  CONSTRAINT user_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Enable RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Public SELECT (for landing page)
CREATE POLICY "Reviews are publicly readable"
ON public.user_reviews FOR SELECT
USING (true);

-- INSERT only for own user
CREATE POLICY "Users can insert own review"
ON public.user_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage reviews"
ON public.user_reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Index for fast 5-star filtering
CREATE INDEX idx_user_reviews_rating ON public.user_reviews (rating) WHERE rating = 5 AND approved = true;
