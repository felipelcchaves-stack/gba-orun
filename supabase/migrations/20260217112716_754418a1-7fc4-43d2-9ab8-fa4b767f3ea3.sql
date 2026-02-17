
-- 1. Tabela de promoções
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  checkout_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotions are publicly readable"
  ON public.promotions FOR SELECT USING (true);

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Tabela de cliques em promoções
CREATE TABLE public.promotion_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promotion_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own clicks"
  ON public.promotion_clicks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clicks"
  ON public.promotion_clicks FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. RPC para resetar jornada do usuário
CREATE OR REPLACE FUNCTION public.reset_user_journey(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM public.journey_tasks WHERE user_id = p_user_id;
  DELETE FROM public.user_journey WHERE user_id = p_user_id;
  DELETE FROM public.user_achievements WHERE user_id = p_user_id;
  DELETE FROM public.user_stats WHERE user_id = p_user_id;
END;
$$;

-- 4. Drop e recriar admin_get_stats com novas colunas
DROP FUNCTION IF EXISTS public.admin_get_stats();

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE(
  total_users bigint,
  premium_users bigint,
  free_users bigint,
  total_consultations bigint,
  consultations_today bigint,
  total_rituals bigint,
  total_posts bigint,
  total_replies bigint,
  active_subscribers bigint,
  overdue_users bigint,
  total_promo_clicks bigint,
  promo_clicks_today bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.profiles WHERE is_premium = true),
    (SELECT count(*) FROM public.profiles WHERE is_premium = false),
    (SELECT count(*) FROM public.user_journey),
    (SELECT count(*) FROM public.user_journey WHERE created_at::date = CURRENT_DATE),
    (SELECT count(*) FROM public.rituals),
    (SELECT count(*) FROM public.community_posts),
    (SELECT count(*) FROM public.community_replies),
    (SELECT count(*) FROM public.profiles WHERE subscription_status = 'active'),
    (SELECT count(*) FROM public.profiles WHERE subscription_status = 'overdue'),
    (SELECT count(*) FROM public.promotion_clicks),
    (SELECT count(*) FROM public.promotion_clicks WHERE clicked_at::date = CURRENT_DATE)
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$$;
