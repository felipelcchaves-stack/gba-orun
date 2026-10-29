-- After the fix (applied twice): the attack is blocked; members, admins and server code still work.
\set ON_ERROR_STOP 1
CREATE FUNCTION tests.member_update(_sql TEXT) RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RETURN 'ok';
EXCEPTION WHEN insufficient_privilege THEN RETURN 'denied';
END $$;
GRANT EXECUTE ON FUNCTION tests.member_update(TEXT) TO anon, authenticated, service_role;

-- 1. Member: every subscription field is refused, by the trigger or by the column grant.
SET ROLE authenticated;
SELECT tests.as_claims('{"sub": "00000000-0000-0000-0000-0000000000f1", "role": "authenticated"}');
SELECT tests.assert(tests.member_update(format('UPDATE public.profiles SET %s WHERE user_id = auth.uid()', c)) = 'denied', 'member blocked: ' || c)
FROM unnest(ARRAY[
  'is_premium = true', 'is_courtesy = true', 'subscription_status = ''active''',
  'subscription_expires_at = ''2099-01-01''', 'subscription_started_at = now()',
  'subscription_plan_id = ''40000000-0000-0000-0000-000000000001''', 'guru_id = ''g1''',
  'guru_subscription_id = ''s1''', 'user_id = ''00000000-0000-0000-0000-0000000000f2''',
  'created_at = now()', 'display_name = ''x'', is_premium = true']) c;
-- ... and the member's own fields still work (profile, onboarding, avatar, device guard, UTMs).
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET display_name = ''Nova'', religion = ''r'', care_day = 3, gender = ''f'', birth_date = ''2000-01-01'', ifa_status = ''x'', onboarding_completed = true, avatar_url = ''a'', device_id = ''d'', device_changed_at = now(), utm_source = ''s'', utm_medium = ''m'', utm_campaign = ''c'' WHERE user_id = auth.uid()') = 'ok', 'member edits own profile');
-- A member without a row cannot create one already premium, but can create a plain one.
SELECT tests.as_claims('{"sub": "00000000-0000-0000-0000-0000000000f2", "role": "authenticated"}');
SELECT tests.assert(tests.member_update('INSERT INTO public.profiles (user_id, is_premium) VALUES (auth.uid(), true)') = 'denied', 'insert premium blocked');
SELECT tests.assert(tests.member_update('INSERT INTO public.profiles (user_id, subscription_status) VALUES (auth.uid(), ''active'')') = 'denied', 'insert active blocked');
SELECT tests.assert(tests.member_update('INSERT INTO public.profiles (user_id, display_name) VALUES (auth.uid(), ''Novo'')') = 'ok', 'plain insert works');
RESET ROLE;
SET ROLE anon;
SELECT tests.as_claims('{"role": "anon"}');
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET is_premium = true') = 'denied', 'anon blocked');
RESET ROLE;
SELECT tests.assert(NOT (SELECT is_premium OR is_courtesy OR subscription_status <> 'free' OR guru_id IS NOT NULL FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f1'), 'member still free');
SELECT tests.assert((SELECT display_name = 'Nova' AND onboarding_completed FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f1'), 'own edits saved');

-- 2. Admin screen (browser, authenticated + admin role): toggle premium, edit dialog, reset device.
INSERT INTO auth.sessions (id, user_id) VALUES ('40000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a2');
SET ROLE authenticated;
SELECT tests.as_claims('{"sub": "00000000-0000-0000-0000-0000000000a2", "role": "authenticated", "session_id": "40000000-0000-0000-0000-0000000000a2"}');
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET is_premium = true, subscription_status = ''active'' WHERE user_id = ''00000000-0000-0000-0000-0000000000f1''') = 'ok', 'admin toggles premium');
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET display_name = ''Ed'', gender = null, religion = null, care_day = null, subscription_status = ''active'', subscription_expires_at = ''2027-01-01'', is_premium = true, is_courtesy = true WHERE user_id = ''00000000-0000-0000-0000-0000000000f1''') = 'ok', 'admin edit dialog');
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET device_id = null, device_changed_at = null WHERE user_id = ''00000000-0000-0000-0000-0000000000f1''') = 'ok', 'admin resets device');
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET guru_id = ''g'' WHERE user_id = ''00000000-0000-0000-0000-0000000000f1''') = 'denied', 'admin browser cannot touch payment ids (server only)');
RESET ROLE;
SELECT tests.assert((SELECT is_premium AND is_courtesy AND subscription_status = 'active' FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f1'), 'admin edits saved');
-- An admin token whose hub session was signed out is a plain member again.
SET ROLE service_role;
SELECT public.hub_sso_record_session('40000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a2', 'sid-a2', '72', 'admin2@ifatokun.com.br');
SELECT public.hub_sso_revoke('sid-a2', '72');
RESET ROLE;
SET ROLE authenticated;
SELECT tests.as_claims('{"sub": "00000000-0000-0000-0000-0000000000a2", "role": "authenticated", "session_id": "40000000-0000-0000-0000-0000000000a2"}');
SELECT tests.assert(tests.member_update('UPDATE public.profiles SET is_premium = true WHERE user_id = auth.uid()') = 'denied', 'signed-out admin token blocked');
RESET ROLE;

-- 3. Server code (service_role: guru-webhook, check-expired-subscriptions, admin-manage-users).
SET ROLE service_role;
SELECT tests.as_claims('{"role": "service_role"}');
UPDATE public.profiles SET is_premium = true, subscription_status = 'active', subscription_plan_id = '40000000-0000-0000-0000-000000000001',
  subscription_started_at = now(), subscription_expires_at = now() + interval '1 year', guru_id = 'g9', guru_subscription_id = 's9'
WHERE user_id = '00000000-0000-0000-0000-0000000000f2';
UPDATE public.profiles SET is_premium = false, subscription_status = 'overdue' WHERE user_id = '00000000-0000-0000-0000-0000000000f1';
RESET ROLE;
SELECT tests.assert((SELECT is_premium AND guru_subscription_id = 's9' FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f2'), 'webhook writes subscription');
SELECT tests.assert((SELECT subscription_status = 'overdue' FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f1'), 'expiry cron writes');
-- postgres (SQL editor, cron, SECURITY DEFINER functions such as handle_new_user).
INSERT INTO auth.users (id, email, email_confirmed_at) VALUES ('00000000-0000-0000-0000-0000000000f3', 'novo@example.com', now());
INSERT INTO public.profiles (user_id, display_name, is_premium) VALUES ('00000000-0000-0000-0000-0000000000f3', 'Novo', true);
SELECT tests.assert((SELECT is_premium FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f3'), 'postgres unaffected');
SELECT tests.as_claims('{}');
