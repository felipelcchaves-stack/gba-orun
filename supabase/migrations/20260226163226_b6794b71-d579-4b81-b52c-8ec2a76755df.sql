
CREATE OR REPLACE FUNCTION public.admin_get_subscription_history()
 RETURNS TABLE(month date, new_users bigint, active_subscribers bigint, courtesy_users bigint, overdue_users bigint, cancelled_users bigint, revenue_estimate numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', COALESCE(
        (SELECT min(created_at) FROM public.profiles),
        now()
      ))::date,
      date_trunc('month', now())::date,
      '1 month'::interval
    )::date AS m
  )
  SELECT
    mo.m AS month,
    (SELECT count(*) FROM public.profiles p
     WHERE date_trunc('month', p.created_at)::date = mo.m
    ) AS new_users,
    (SELECT count(*) FROM public.profiles p
     WHERE p.subscription_status = 'active'
       AND p.is_courtesy = false
       AND p.subscription_started_at IS NOT NULL
       AND date_trunc('month', p.subscription_started_at)::date <= mo.m
    ) AS active_subscribers,
    (SELECT count(*) FROM public.profiles p
     WHERE p.is_courtesy = true
       AND date_trunc('month', p.created_at)::date <= mo.m
    ) AS courtesy_users,
    (SELECT count(*) FROM public.profiles p
     WHERE p.subscription_status = 'overdue'
       AND p.is_courtesy = false
       AND p.subscription_started_at IS NOT NULL
       AND date_trunc('month', p.subscription_started_at)::date <= mo.m
    ) AS overdue_users,
    (SELECT count(*) FROM public.profiles p
     WHERE p.subscription_status = 'cancelled'
       AND p.subscription_started_at IS NOT NULL
       AND date_trunc('month', p.subscription_started_at)::date <= mo.m
    ) AS cancelled_users,
    COALESCE(
      (SELECT sum(sp.price / CASE sp.billing_period WHEN 'yearly' THEN 12 WHEN 'quarterly' THEN 3 ELSE 1 END)
       FROM public.profiles p
       JOIN public.subscription_plans sp ON sp.id = p.subscription_plan_id
       WHERE p.subscription_status = 'active'
         AND p.is_courtesy = false
         AND p.subscription_started_at IS NOT NULL
         AND date_trunc('month', p.subscription_started_at)::date <= mo.m
      ), 0
    ) AS revenue_estimate
  FROM months mo
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY mo.m;
$function$;
