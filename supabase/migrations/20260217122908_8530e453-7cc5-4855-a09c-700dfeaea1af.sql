
-- 1. Tabela user_knowledge
CREATE TABLE public.user_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  knows_obi BOOLEAN NOT NULL DEFAULT false,
  knows_ebo BOOLEAN NOT NULL DEFAULT false,
  knows_ori BOOLEAN NOT NULL DEFAULT false,
  knows_iyami BOOLEAN NOT NULL DEFAULT false,
  knows_egbe_orun BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own knowledge" ON public.user_knowledge
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON public.user_knowledge
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge" ON public.user_knowledge
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all knowledge" ON public.user_knowledge
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Campo onboarding_completed em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- 3. Trigger updated_at
CREATE TRIGGER update_user_knowledge_updated_at
  BEFORE UPDATE ON public.user_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. RPC admin_get_knowledge_stats
CREATE OR REPLACE FUNCTION public.admin_get_knowledge_stats()
RETURNS TABLE(
  total_onboarded BIGINT,
  not_knows_obi BIGINT,
  not_knows_ebo BIGINT,
  not_knows_ori BIGINT,
  not_knows_iyami BIGINT,
  not_knows_egbe_orun BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    count(*),
    count(*) FILTER (WHERE NOT knows_obi),
    count(*) FILTER (WHERE NOT knows_ebo),
    count(*) FILTER (WHERE NOT knows_ori),
    count(*) FILTER (WHERE NOT knows_iyami),
    count(*) FILTER (WHERE NOT knows_egbe_orun)
  FROM public.user_knowledge
  WHERE onboarding_completed = true
    AND public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- 5. Drop + Recreate admin_list_profiles com knowledge
DROP FUNCTION IF EXISTS public.admin_list_profiles();

CREATE FUNCTION public.admin_list_profiles()
RETURNS TABLE(
  id uuid, user_id uuid, display_name text, email text, religion text,
  is_premium boolean, care_day integer, guru_id text, created_at timestamptz,
  gender text, birth_date date, subscription_status text, subscription_plan_id uuid,
  subscription_started_at timestamptz, subscription_expires_at timestamptz,
  guru_subscription_id text, onboarding_completed boolean,
  knows_obi boolean, knows_ebo boolean, knows_ori boolean,
  knows_iyami boolean, knows_egbe_orun boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.id, p.user_id, p.display_name, u.email, p.religion, p.is_premium,
    p.care_day, p.guru_id, p.created_at, p.gender, p.birth_date,
    p.subscription_status, p.subscription_plan_id,
    p.subscription_started_at, p.subscription_expires_at,
    p.guru_subscription_id, p.onboarding_completed,
    COALESCE(uk.knows_obi, false),
    COALESCE(uk.knows_ebo, false),
    COALESCE(uk.knows_ori, false),
    COALESCE(uk.knows_iyami, false),
    COALESCE(uk.knows_egbe_orun, false)
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_knowledge uk ON uk.user_id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$$;
