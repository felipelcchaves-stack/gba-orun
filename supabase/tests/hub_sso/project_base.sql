-- Gba-Orun: the role objects the hub_sso migrations depend on, copied from
-- supabase/migrations/20260216233410_*.sql, plus two helpers used by test.sql.
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE SCHEMA tests;
GRANT USAGE ON SCHEMA tests TO anon, authenticated, service_role;
CREATE FUNCTION tests.make_admin(_uid UUID) RETURNS void LANGUAGE sql AS $$
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
$$;
CREATE FUNCTION tests.make_member(_uid UUID) RETURNS void LANGUAGE sql AS $$
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'user')
$$;
-- The admin check the RLS policies use, as seen by the current request.
CREATE FUNCTION tests.admin_check() RETURNS boolean LANGUAGE sql AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO anon, authenticated, service_role;
