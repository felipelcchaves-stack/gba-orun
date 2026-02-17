
-- Step 1: Add columns
ALTER TABLE public.user_knowledge ADD COLUMN IF NOT EXISTS ifa_status text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ifa_status text DEFAULT NULL;

-- Step 2: Drop old functions
DROP FUNCTION IF EXISTS public.admin_list_profiles();
DROP FUNCTION IF EXISTS public.admin_get_knowledge_stats();

-- Step 3: Recreate admin_list_profiles with ifa_status
CREATE FUNCTION public.admin_list_profiles()
 RETURNS TABLE(id uuid, user_id uuid, display_name text, email text, religion text, is_premium boolean, care_day integer, guru_id text, created_at timestamp with time zone, gender text, birth_date date, subscription_status text, subscription_plan_id uuid, subscription_started_at timestamp with time zone, subscription_expires_at timestamp with time zone, guru_subscription_id text, onboarding_completed boolean, knows_obi boolean, knows_ebo boolean, knows_ori boolean, knows_iyami boolean, knows_egbe_orun boolean, device_id text, device_changed_at timestamp with time zone, ifa_status text)
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
    COALESCE(uk.ifa_status, p.ifa_status) as ifa_status
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_knowledge uk ON uk.user_id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$function$;

-- Step 4: Recreate admin_get_knowledge_stats with ifa counters
CREATE FUNCTION public.admin_get_knowledge_stats()
 RETURNS TABLE(total_onboarded bigint, not_knows_obi bigint, not_knows_ebo bigint, not_knows_ori bigint, not_knows_iyami bigint, not_knows_egbe_orun bigint, total_babalawo bigint, total_iyanifa bigint, total_omo_ifa bigint, total_sem_ifa bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    count(*),
    count(*) FILTER (WHERE NOT knows_obi),
    count(*) FILTER (WHERE NOT knows_ebo),
    count(*) FILTER (WHERE NOT knows_ori),
    count(*) FILTER (WHERE NOT knows_iyami),
    count(*) FILTER (WHERE NOT knows_egbe_orun),
    count(*) FILTER (WHERE ifa_status = 'babalawo'),
    count(*) FILTER (WHERE ifa_status = 'iyanifa'),
    count(*) FILTER (WHERE ifa_status = 'omo_ifa'),
    count(*) FILTER (WHERE ifa_status = 'nao' OR ifa_status IS NULL)
  FROM public.user_knowledge
  WHERE onboarding_completed = true
    AND public.has_role(auth.uid(), 'admin'::app_role);
$function$;
