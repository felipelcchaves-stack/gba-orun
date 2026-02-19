
-- 1. Add is_courtesy column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_courtesy boolean NOT NULL DEFAULT false;

-- 2. Drop old function signature then recreate with is_courtesy
DROP FUNCTION IF EXISTS public.admin_list_profiles();

CREATE FUNCTION public.admin_list_profiles()
 RETURNS TABLE(id uuid, user_id uuid, display_name text, email text, religion text, is_premium boolean, care_day integer, guru_id text, created_at timestamp with time zone, gender text, birth_date date, subscription_status text, subscription_plan_id uuid, subscription_started_at timestamp with time zone, subscription_expires_at timestamp with time zone, guru_subscription_id text, onboarding_completed boolean, knows_obi boolean, knows_ebo boolean, knows_ori boolean, knows_iyami boolean, knows_egbe_orun boolean, device_id text, device_changed_at timestamp with time zone, ifa_status text, is_courtesy boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    COALESCE(uk.knows_egbe_orun, false),
    p.device_id,
    p.device_changed_at,
    COALESCE(uk.ifa_status, p.ifa_status) as ifa_status,
    p.is_courtesy
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_knowledge uk ON uk.user_id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$function$;

-- 3. Update admin_get_stats to exclude courtesy from financial metrics
CREATE OR REPLACE FUNCTION public.admin_get_stats()
 RETURNS TABLE(total_users bigint, premium_users bigint, free_users bigint, total_consultations bigint, consultations_today bigint, total_rituals bigint, total_posts bigint, total_replies bigint, active_subscribers bigint, overdue_users bigint, total_promo_clicks bigint, promo_clicks_today bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.profiles WHERE is_premium = true),
    (SELECT count(*) FROM public.profiles WHERE is_premium = false),
    (SELECT count(*) FROM public.user_journey),
    (SELECT count(*) FROM public.user_journey WHERE created_at::date = CURRENT_DATE),
    (SELECT count(*) FROM public.rituals),
    (SELECT count(*) FROM public.community_posts),
    (SELECT count(*) FROM public.community_replies),
    (SELECT count(*) FROM public.profiles WHERE subscription_status = 'active' AND is_courtesy = false),
    (SELECT count(*) FROM public.profiles WHERE subscription_status = 'overdue' AND is_courtesy = false),
    (SELECT count(*) FROM public.promotion_clicks),
    (SELECT count(*) FROM public.promotion_clicks WHERE clicked_at::date = CURRENT_DATE)
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$function$;
