
-- Function to list all profiles with email (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  email text,
  religion text,
  is_premium boolean,
  care_day integer,
  guru_id text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.user_id,
    p.display_name,
    u.email,
    p.religion,
    p.is_premium,
    p.care_day,
    p.guru_id,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$$;

-- Function to get admin stats (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE (
  total_users bigint,
  premium_users bigint,
  free_users bigint,
  total_consultations bigint,
  consultations_today bigint,
  total_rituals bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles) AS total_users,
    (SELECT count(*) FROM public.profiles WHERE is_premium = true) AS premium_users,
    (SELECT count(*) FROM public.profiles WHERE is_premium = false) AS free_users,
    (SELECT count(*) FROM public.user_journey) AS total_consultations,
    (SELECT count(*) FROM public.user_journey WHERE created_at::date = CURRENT_DATE) AS consultations_today,
    (SELECT count(*) FROM public.rituals) AS total_rituals
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$$;
