-- SECURITY FIX (independent of the hub login: safe to apply on its own, before or after the hub_sso
-- migrations). Replaces supabase/proposed/protect_profile_subscription_columns.sql. Idempotent.
--
-- Problem: "Users can update own profile" (20260216233410) lets any signed-in user change EVERY
-- column of their own profiles row through the public API, so a free user could make themselves
-- premium:  supabase.from('profiles').update({ is_premium: true }).eq('user_id', myId)
--
-- Who legitimately writes these columns today (checked in the code, 2026-10-09):
--   * service role (current_user = service_role): guru-webhook (purchase / renewal / cancel),
--     check-expired-subscriptions (cron), admin-manage-users (create users, toggle admin);
--   * the admin screen in the browser (role authenticated + has_role admin, policy "Admins can
--     update any profile"): AdminUsers togglePremium / handleSaveEdit (is_premium, is_courtesy,
--     subscription_status, subscription_expires_at, name fields) and "reset device";
--   * the member on their own row: display_name, religion, gender, care_day, birth_date, ifa_status,
--     onboarding_completed (onboarding), avatar_url, device_id / device_changed_at (device guard),
--     utm_* (first login);
--   * handle_new_user (SECURITY DEFINER, on sign-up): user_id, display_name.
-- Nobody writes guru_id, guru_subscription_id, subscription_plan_id, subscription_started_at,
-- user_id, id or created_at from the browser.
--
-- Fix (same shape as Sistema Oluwo 0019):
-- 1. Column privileges: from the browser (authenticated) only the columns above can be written;
--    anon writes nothing. Columns added later are NOT writable from the browser until a migration
--    grants them (GRANT UPDATE (new_column) ON public.profiles TO authenticated).
-- 2. Trigger: for a browser request that is not an admin, only the member's own columns may change
--    (covers is_premium / is_courtesy / subscription_status / subscription_expires_at, which stay
--    in the column grant because the admin screen writes them from the browser), and a new row
--    cannot start premium. service_role, postgres and SECURITY DEFINER functions are not affected.

-- 1. Column privileges ----------------------------------------------------------------------------
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (
  display_name, religion, care_day, gender, birth_date, ifa_status, onboarding_completed,
  avatar_url, device_id, device_changed_at, utm_source, utm_medium, utm_campaign,
  is_premium, is_courtesy, subscription_status, subscription_expires_at
) ON public.profiles TO authenticated;
GRANT INSERT (
  user_id, display_name, religion, care_day, gender, birth_date, ifa_status, onboarding_completed,
  avatar_url, device_id, device_changed_at, utm_source, utm_medium, utm_campaign
) ON public.profiles TO authenticated;

-- 2. Trigger guard --------------------------------------------------------------------------------
-- NOT security definer on purpose: current_user must be the caller's role (anon / authenticated
-- through the API, service_role in Edge Functions, postgres in the SQL editor and in cron).
CREATE OR REPLACE FUNCTION public.protect_profile_subscription_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  member_editable CONSTANT TEXT[] := ARRAY[
    'display_name', 'religion', 'care_day', 'gender', 'birth_date', 'ifa_status',
    'onboarding_completed', 'avatar_url', 'device_id', 'device_changed_at',
    'utm_source', 'utm_medium', 'utm_campaign'];
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_premium OR NEW.is_courtesy OR NEW.subscription_status IS DISTINCT FROM 'free'
       OR NEW.subscription_plan_id IS NOT NULL OR NEW.subscription_started_at IS NOT NULL
       OR NEW.subscription_expires_at IS NOT NULL OR NEW.guru_id IS NOT NULL
       OR NEW.guru_subscription_id IS NOT NULL THEN
      RAISE EXCEPTION 'Só um administrador pode mudar a assinatura' USING ERRCODE = '42501';
    END IF;
  ELSIF (to_jsonb(NEW) - member_editable) IS DISTINCT FROM (to_jsonb(OLD) - member_editable) THEN
    RAISE EXCEPTION 'Só um administrador pode mudar a assinatura' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS protect_profile_subscription_columns ON public.profiles;
CREATE TRIGGER protect_profile_subscription_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_subscription_columns();
