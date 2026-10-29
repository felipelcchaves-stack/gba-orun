-- Gba-Orun: public.profiles as the migrations leave it (columns from src/integrations/supabase/types.ts,
-- RLS policies from 20260216233410, 20260219211358, 20260219212312), for the security fix tests.
CREATE TABLE public.subscription_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT);
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  guru_id TEXT,
  religion TEXT,
  care_day INTEGER,
  avatar_url TEXT,
  gender TEXT,
  birth_date DATE,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  guru_subscription_id TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  device_id TEXT,
  device_changed_at TIMESTAMPTZ,
  ifa_status TEXT,
  is_courtesy BOOLEAN NOT NULL DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view any profile" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- People: F = free member, F2 = member without a profile row yet, A = admin (hub session), P = plan.
INSERT INTO auth.users (id, email, email_confirmed_at) VALUES
  ('00000000-0000-0000-0000-0000000000f1', 'livre@example.com', now()),
  ('00000000-0000-0000-0000-0000000000f2', 'semperfil@example.com', now()),
  ('00000000-0000-0000-0000-0000000000a2', 'admin2@ifatokun.com.br', now());
SELECT tests.make_member('00000000-0000-0000-0000-0000000000f1');
SELECT tests.make_member('00000000-0000-0000-0000-0000000000f2');
SELECT tests.make_admin('00000000-0000-0000-0000-0000000000a2');
INSERT INTO public.profiles (user_id, display_name) VALUES
  ('00000000-0000-0000-0000-0000000000f1', 'Livre'),
  ('00000000-0000-0000-0000-0000000000a2', 'Admin');
INSERT INTO public.subscription_plans (id, name) VALUES ('40000000-0000-0000-0000-000000000001', 'Anual');
