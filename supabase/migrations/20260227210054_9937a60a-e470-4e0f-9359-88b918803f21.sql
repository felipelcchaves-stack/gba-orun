
CREATE OR REPLACE FUNCTION public.admin_get_monthly_revenue()
 RETURNS TABLE(current_month_revenue numeric, previous_month_revenue numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  WITH current_month AS (
    SELECT
      COALESCE(SUM(COALESCE(sp.net_price, sp.price)), 0) AS revenue
    FROM public.profiles p
    JOIN public.subscription_plans sp ON sp.id = p.subscription_plan_id
    WHERE p.is_courtesy = false
      AND p.subscription_started_at IS NOT NULL
      AND (
        -- New/renewed this month: full price
        (date_trunc('month', p.subscription_started_at) = date_trunc('month', now())
         AND p.subscription_status IN ('active', 'overdue', 'cancelled'))
        OR
        -- Recurring monthly from previous months still active
        (sp.billing_period = 'monthly'
         AND p.subscription_status = 'active'
         AND date_trunc('month', p.subscription_started_at) < date_trunc('month', now()))
      )
  ),
  previous_month AS (
    SELECT
      COALESCE(SUM(COALESCE(sp.net_price, sp.price)), 0) AS revenue
    FROM public.profiles p
    JOIN public.subscription_plans sp ON sp.id = p.subscription_plan_id
    WHERE p.is_courtesy = false
      AND p.subscription_started_at IS NOT NULL
      AND (
        -- Started/renewed in previous month
        (date_trunc('month', p.subscription_started_at) = date_trunc('month', now() - interval '1 month')
         AND p.subscription_status IN ('active', 'overdue', 'cancelled'))
        OR
        -- Recurring monthly active before previous month
        (sp.billing_period = 'monthly'
         AND date_trunc('month', p.subscription_started_at) < date_trunc('month', now() - interval '1 month')
         -- Was active during previous month (started before and not yet expired by end of prev month)
         AND (p.subscription_expires_at IS NULL OR p.subscription_expires_at >= date_trunc('month', now())))
      )
  )
  SELECT cm.revenue, pm.revenue
  FROM current_month cm, previous_month pm
  WHERE has_role(auth.uid(), 'admin'::app_role);
$$;
