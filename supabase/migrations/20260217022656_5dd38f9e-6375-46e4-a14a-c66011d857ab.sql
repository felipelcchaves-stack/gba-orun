
-- 1. Tabela subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  guru_checkout_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans are publicly readable"
  ON public.subscription_plans FOR SELECT USING (true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Novas colunas em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guru_subscription_id TEXT;

-- 3. Atualizar admin_list_profiles
DROP FUNCTION IF EXISTS public.admin_list_profiles();
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
 RETURNS TABLE(
   id uuid, user_id uuid, display_name text, email text, religion text,
   is_premium boolean, care_day integer, guru_id text, created_at timestamptz,
   gender text, birth_date date,
   subscription_status text, subscription_plan_id uuid,
   subscription_started_at timestamptz, subscription_expires_at timestamptz,
   guru_subscription_id text
 )
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    p.id, p.user_id, p.display_name, u.email, p.religion, p.is_premium,
    p.care_day, p.guru_id, p.created_at, p.gender, p.birth_date,
    p.subscription_status, p.subscription_plan_id,
    p.subscription_started_at, p.subscription_expires_at,
    p.guru_subscription_id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$$;

-- 4. Atualizar admin_get_stats
DROP FUNCTION IF EXISTS public.admin_get_stats();
CREATE OR REPLACE FUNCTION public.admin_get_stats()
 RETURNS TABLE(
   total_users bigint, premium_users bigint, free_users bigint,
   total_consultations bigint, consultations_today bigint,
   total_rituals bigint, total_posts bigint, total_replies bigint,
   active_subscribers bigint, overdue_users bigint
 )
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles) AS total_users,
    (SELECT count(*) FROM public.profiles WHERE is_premium = true) AS premium_users,
    (SELECT count(*) FROM public.profiles WHERE is_premium = false) AS free_users,
    (SELECT count(*) FROM public.user_journey) AS total_consultations,
    (SELECT count(*) FROM public.user_journey WHERE created_at::date = CURRENT_DATE) AS consultations_today,
    (SELECT count(*) FROM public.rituals) AS total_rituals,
    (SELECT count(*) FROM public.community_posts) AS total_posts,
    (SELECT count(*) FROM public.community_replies) AS total_replies,
    (SELECT count(*) FROM public.profiles WHERE subscription_status = 'active') AS active_subscribers,
    (SELECT count(*) FROM public.profiles WHERE subscription_status = 'overdue') AS overdue_users
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- 5. Dados mockados
INSERT INTO public.subscription_plans (name, price, billing_period, guru_checkout_url, description, is_active, display_order)
VALUES
  ('Mensal', 29.90, 'monthly', 'https://pay.guru.com/mensal', 'Acesso completo por 1 mês. Cancele quando quiser.', true, 1),
  ('Trimestral', 69.90, 'quarterly', 'https://pay.guru.com/trimestral', 'Acesso completo por 3 meses. Economize 22%!', true, 2);
