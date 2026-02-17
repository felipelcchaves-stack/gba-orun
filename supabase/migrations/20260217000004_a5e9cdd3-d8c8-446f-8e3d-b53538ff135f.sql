
-- 1. Add audio_url to rituals
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS audio_url text;

-- 2. Create user_journey table
CREATE TABLE public.user_journey (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  oracle_result text NOT NULL,
  suggested_ritual_id uuid REFERENCES public.rituals(id) ON DELETE SET NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.user_journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journey" ON public.user_journey FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journey" ON public.user_journey FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journey" ON public.user_journey FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create user_achievements table
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_key text NOT NULL,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create user_stats table
CREATE TABLE public.user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  oracle_throws integer NOT NULL DEFAULT 0,
  rituals_read integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_active date NOT NULL DEFAULT CURRENT_DATE,
  xp_total integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create app_settings table
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App settings are publicly readable" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage app settings" ON public.app_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Seed initial app_settings
INSERT INTO public.app_settings (key, value) VALUES
  ('meta_pixel_id', ''),
  ('google_ads_id', ''),
  ('checkout_url', ''),
  ('offer_price', '97'),
  ('offer_original_price', '297'),
  ('offer_headline', 'Descubra o que o Orixá quer de você agora.'),
  ('offer_video_url', ''),
  ('offer_cta_text', 'Quero Começar Agora');
