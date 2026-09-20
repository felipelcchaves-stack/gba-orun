-- Aplicar manualmente via `psql`/SQL editor no projeto novo depois que ele
-- existir — de propósito FORA de supabase/migrations/ pra não ser
-- empurrado automaticamente pelo workflow deploy-supabase.yml (o secret
-- real do CRON_SECRET não deve viajar pelo git/GitHub Actions).
--
-- Antes de rodar, substitua __CRON_SECRET__ pelo mesmo valor configurado
-- via `supabase secrets set --project-ref <ref> CRON_SECRET=...`.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'check-expired-subscriptions-daily',
  '0 6 * * *', -- 06:00 UTC = 03:00 America/Sao_Paulo
  $$
  select net.http_post(
    url := 'https://remrjowcbyavydfbkbny.supabase.co/functions/v1/check-expired-subscriptions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '__CRON_SECRET__'
    ),
    body := '{}'::jsonb
  );
  $$
);
