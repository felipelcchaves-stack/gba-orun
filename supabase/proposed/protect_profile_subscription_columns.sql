-- PROPOSED FIX — NOT a migration, NOT applied. Review, then move to supabase/migrations/ with a
-- new timestamp if you want it. Found while adding the hub login (deploy/HUB-SSO.md, "Achados").
--
-- Pre-existing problem: the policy "Users can update own profile" (20260216233410) lets any
-- signed-in user UPDATE every column of their own profiles row through the public API, including
-- is_premium / is_courtesy / subscription_* / guru_*. A free user can make themselves premium:
--   supabase.from('profiles').update({ is_premium: true }).eq('user_id', myId)
-- (The admin role itself is safe: user_roles only accepts writes from admins.)
--
-- Fix: those columns can only change through admins (has_role) or server code (service_role:
-- guru-webhook, check-expired-subscriptions, admin-manage-users).

CREATE OR REPLACE FUNCTION public.protect_profile_subscription_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'service_role')
     OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium
     OR NEW.is_courtesy IS DISTINCT FROM OLD.is_courtesy
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_plan_id IS DISTINCT FROM OLD.subscription_plan_id
     OR NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at
     OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at
     OR NEW.guru_id IS DISTINCT FROM OLD.guru_id
     OR NEW.guru_subscription_id IS DISTINCT FROM OLD.guru_subscription_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'subscription fields can only be changed by an administrator'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS protect_profile_subscription_columns ON public.profiles;
CREATE TRIGGER protect_profile_subscription_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_subscription_columns();
