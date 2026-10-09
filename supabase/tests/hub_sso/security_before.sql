-- Before the fix: the attack WORKS (a free member makes themselves premium through the API).
\set ON_ERROR_STOP 1
SET ROLE authenticated;
SELECT tests.as_claims('{"sub": "00000000-0000-0000-0000-0000000000f1", "role": "authenticated"}');
UPDATE public.profiles SET is_premium = true, subscription_status = 'active', subscription_expires_at = '2099-01-01'
WHERE user_id = '00000000-0000-0000-0000-0000000000f1';
RESET ROLE;
SELECT tests.assert((SELECT is_premium FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-0000000000f1'), 'before the fix: member made themselves premium');
UPDATE public.profiles SET is_premium = false, subscription_status = 'free', subscription_expires_at = NULL
WHERE user_id = '00000000-0000-0000-0000-0000000000f1';
