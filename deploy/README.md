# Deploy do Gba-Orun na VPS HostGator

SPA estática (build do Vite), sem PM2/processo Node — backend inteiro no
Supabase Cloud, projeto próprio `remrjowcbyavydfbkbny` (região
`sa-east-1`, org `xzxxgszsgsgbkpzidfkt`, mesma organização do Ìrántí,
Sistema Oluwo, Isesemind e Academy). Migrado do Lovable seguindo o
mesmo padrão do Isesemind e do Academy.

## Bootstrap do usuário Linux dedicado (uma vez só, manual)

Logado como o usuário `gba-orun` na VPS (senha, já que ainda não há
chave autorizada):

```
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDmhQzP3sf54ty4Z30KSos9vchVaJtWJI3GpuTA2qWkk gba-orun-deploy@vps-143.95.164.62" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod o+x /home/gba-orun
```

O último `chmod o+x /home/gba-orun` evita a pegadinha já conhecida do
skill de deploy: a home vem `750` por padrão, o que bloqueia o Nginx
(`www-data`) de atravessar o diretório até chegar em `current/`, mesmo
com todas as permissões corretas lá dentro.

A chave privada correspondente (par ed25519 dedicado a este projeto,
nunca reaproveitado do Isesemind/Academy) vai para o secret do GitHub
`GBAORUN_DEPLOY_SSH_KEY`.

## Deploy atômico

```
/home/gba-orun/releases/<timestamp>/   # cada build vai numa pasta nova
/home/gba-orun/current -> releases/<timestamp mais recente>/
```

O Nginx sempre serve `/home/gba-orun/current`. O GitHub Actions
(`.github/workflows/deploy-frontend.yml`) faz upload pra uma pasta
`releases/<timestamp>` nova e só troca o symlink depois do upload
completo, depois apaga releases antigas (mantém as últimas 5).

## Nginx + Certbot

1. Copiar `deploy/nginx-gba-orun.conf` pra
   `/etc/nginx/sites-available/gba-orun`.
2. `ln -s /etc/nginx/sites-available/gba-orun /etc/nginx/sites-enabled/gba-orun`
3. `nginx -t && systemctl reload nginx`
4. Confirmar DNS: `dig +short gba-orun.ifatokun.com.br` → `143.95.164.62`.
5. `curl -I http://gba-orun.ifatokun.com.br` deve responder (200 ou 404
   do Nginx, não connection refused).
6. Só então: `sudo certbot --nginx -d gba-orun.ifatokun.com.br` — ele
   reescreve o arquivo sozinho acrescentando o bloco HTTPS, preservando
   as diretivas customizadas.

## Secrets do GitHub Actions

`gh secret set` é bloqueado no modo automático — colar manualmente em
`github.com/felipelcchaves-stack/gba-orun/settings/secrets/actions`:

| Secret | Valor |
|---|---|
| `GBAORUN_DEPLOY_SSH_KEY` | chave privada do par ed25519 dedicado |
| `VITE_SUPABASE_PROJECT_ID` | `remrjowcbyavydfbkbny` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key do projeto novo |
| `VITE_SUPABASE_URL` | `https://remrjowcbyavydfbkbny.supabase.co` |
| `SUPABASE_ACCESS_TOKEN` | personal access token (supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | `remrjowcbyavydfbkbny` |
| `SUPABASE_DB_PASSWORD` | senha do banco definida na criação do projeto |

## Segredos de Edge Functions (não são secrets do GitHub — write-only no Supabase)

Nunca migram automaticamente, nunca passam por git nem por GitHub
Actions. Aplicar com:

```
supabase secrets set --project-ref remrjowcbyavydfbkbny \
  GURU_WEBHOOK_SECRET=... \
  META_CAPI_TOKEN=... \
  RESEND_API_KEY=... \
  PREVIEW_AUTH_TOKEN=$(openssl rand -hex 32) \
  CRON_SECRET=$(openssl rand -hex 32)

# Depois de habilitar "Send Email Hook" no painel Auth do projeto (copia o secret gerado lá):
supabase secrets set --project-ref remrjowcbyavydfbkbny SEND_EMAIL_HOOK_SECRET='v1,whsec_...'
```

`RESEND_API_KEY` também depende de um domínio de envio verificado
(SPF/DKIM/DMARC) na conta Resend antes do `auth-email-hook` conseguir
mandar e-mail de verdade.

## Teste de ponta a ponta

1. `curl -I https://gba-orun.ifatokun.com.br` → `200`.
2. Push de commit de teste em `main` → confirmar em Actions que
   `deploy-frontend.yml` rodou, o symlink `current` mudou de timestamp
   (`ssh -p 22022 gba-orun@143.95.164.62 readlink /home/gba-orun/current`
   antes/depois), e o conteúdo do site atualizou.
