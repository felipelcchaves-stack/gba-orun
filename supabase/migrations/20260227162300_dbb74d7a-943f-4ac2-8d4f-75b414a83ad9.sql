
CREATE OR REPLACE FUNCTION public.admin_get_subscription_history_v2(p_granularity text DEFAULT 'monthly')
 RETURNS TABLE(month date, new_users bigint, active_subscribers bigint, courtesy_users bigint, overdue_users bigint, cancelled_users bigint, revenue_estimate numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH params AS (
    SELECT
      CASE p_granularity
        WHEN 'daily' THEN (now() - interval '90 days')::date
        ELSE COALESCE((SELECT min(created_at)::date FROM public.profiles), now()::date)
      END AS start_date,
      CASE p_granularity
        WHEN 'daily' THEN '1 day'::interval
        WHEN 'yearly' THEN '1 year'::interval
        ELSE '1 month'::interval
      END AS step,
      CASE p_granularity
        WHEN 'daily' THEN 'day'
        WHEN 'yearly' THEN 'year'
        ELSE 'month'
      END AS trunc_unit
  ),
  series AS (
    SELECT generate_series(
      date_trunc((SELECT trunc_unit FROM params), (SELECT start_date FROM params))::date,
      date_trunc((SELECT trunc_unit FROM params), now())::date,
      (SELECT step FROM params)
    )::date AS m
  )
  SELECT
    s.m AS month,
    (SELECT count(*) FROM public.profiles p
     WHERE date_trunc((SELECT trunc_unit FROM params), p.created_at)::date = s.m
    ) AS new_users,
    (SELECT count(*) FROM public.profiles p
     WHERE p.subscription_status = 'active'
       AND p.is_courtesy = false
       AND p.subscription_started_at IS NOT NULL
       AND date_trunc((SELECT trunc_unit FROM params), p.subscription_started_at)::date <= s.m
    ) AS active_subscribers,
    (SELECT count(*) FROM public.profiles p
     WHERE p.is_courtesy = true
       AND date_trunc((SELECT trunc_unit FROM params), p.created_at)::date <= s.m
    ) AS courtesy_users,
    (SELECT count(*) FROM public.profiles p
     WHERE p.subscription_status = 'overdue'
       AND p.is_courtesy = false
       AND p.subscription_started_at IS NOT NULL
       AND date_trunc((SELECT trunc_unit FROM params), p.subscription_started_at)::date <= s.m
    ) AS overdue_users,
    (SELECT count(*) FROM public.profiles p
     WHERE p.subscription_status = 'cancelled'
       AND p.subscription_started_at IS NOT NULL
       AND date_trunc((SELECT trunc_unit FROM params), p.subscription_started_at)::date <= s.m
    ) AS cancelled_users,
    COALESCE(
      (SELECT sum(COALESCE(sp.net_price, sp.price) / CASE sp.billing_period WHEN 'yearly' THEN 12 WHEN 'quarterly' THEN 3 ELSE 1 END)
       FROM public.profiles p
       JOIN public.subscription_plans sp ON sp.id = p.subscription_plan_id
       WHERE p.subscription_status = 'active'
         AND p.is_courtesy = false
         AND p.subscription_started_at IS NOT NULL
         AND date_trunc((SELECT trunc_unit FROM params), p.subscription_started_at)::date <= s.m
      ), 0
    ) AS revenue_estimate
  FROM series s
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY s.m;
$function$;
