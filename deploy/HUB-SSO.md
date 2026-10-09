# Login único pelo Hub — área administrativa do Gba-Orun

Só o **/admin** usa o Hub. Alunos e clientes continuam com o login de sempre (`/auth`, e-mail e
senha no Supabase). Para quem administra: senha e código do app autenticador só no Hub, uma vez.
Abrir o Gba-Orun pelo lançador do Hub cai direto no painel, já logado.

Sistema no Hub: **id 9** (`https://gba-orun.ifatokun.com.br/`).

## 1. Decisão de arquitetura (registro)

**Contexto.** O Gba-Orun é uma SPA estática (Vite + React) servida pelo Nginx; os dados e o login
estão no Supabase (`remrjowcbyavydfbkbny`). Uma SPA não guarda segredo, e o Hub exige um cliente
OIDC confidencial (code + PKCE S256 + `client_secret`).

**Opções avaliadas (lendo o `@supabase/auth-js` 2.95.3 instalado, não a memória):**

- *Provedor OIDC do próprio Supabase Auth.* O tipo `Provider` do auth-js só aceita provedores
  fixos (google, azure, keycloak, workos…); não há emissor OIDC genérico no cliente. `signInWithSSO`
  é SAML (plano pago). Além disso o Supabase **criaria** usuários sozinho no primeiro login e não
  tem logout por back-channel. Descartado.
- *Third-party auth (JWT do Hub direto no PostgREST).* Só para provedores listados (Clerk,
  Firebase, Auth0, Cognito, WorkOS) e trocaria o modelo de sessão do app inteiro. Descartado.
- **Escolhida: uma Edge Function `hub-sso` como cliente OIDC confidencial.** Ela guarda o segredo,
  troca o código no Hub, valida o ID token com `jose` no JWKS do Hub e abre uma sessão Supabase
  **para um usuário que já existe e já é admin**, pelo caminho oficial do Admin API:
  `auth.admin.generateLink({ type: "magiclink" })` (não envia e-mail) e `auth.verifyOtp({ token_hash })`
  no próprio servidor. A sessão volta para a SPA **no corpo de um POST**, nunca na URL.
  `auth.admin.signOut(jwt)` exige o JWT da pessoa (não serve para o back-channel), então o logout
  apaga a linha em `auth.sessions` por uma função SQL `SECURITY DEFINER` (os refresh tokens caem
  junto, `ON DELETE CASCADE`).

**Mesmo desenho e mesmos arquivos** no Gba-Orun, no Isesemind e no Academy:
`supabase/functions/_shared/hub-sso/*` e `src/lib/hubSso.ts` são idênticos nos três; muda só a
migração (quem conta como admin) e a ligação com as telas (`src/lib/hubSsoProject.ts`).

## 2. Como funciona

```
Lançador do Hub ──> /auth/hub/iniciar?iss=<emissor>&target_link_uri=<url do sistema>
  SPA confere iss (= VITE_HUB_ISSUER) e o destino (mesma origem, dentro de /admin; senão /admin)
  SPA cria verifier PKCE + state + nonce (sessionStorage, 10 min, uso único)
  SPA ──POST hub-sso/start──> função devolve a URL de autorização do Hub (client_id, redirect_uri)
Hub (sessão + TOTP já feitos) ──> /auth/hub/callback?code=…&state=…
  SPA confere state, apaga o pendente, ──POST hub-sso/exchange {code, verifier, nonce}──>
  função: /token com segredo + verifier → valida ID token (JWKS, iss, aud, exp, nonce, azp,
          email_verified, sid) → hub_sso_find_user(e-mail, papéis) → só usuário EXISTENTE,
          e-mail confirmado, não bloqueado, com papel permitido → generateLink + verifyOtp →
          grava (sessão Supabase ↔ sid do Hub) → troca a senha Supabase por uma aleatória
          → encerra as sessões Supabase dessa pessoa abertas SEM o Hub (senha, link de redefinição)
  SPA: supabase.auth.setSession(...) → /admin
Sair no Gba-Orun ──> supabase.auth.signOut() → end_session do Hub ("Sair de todos os sistemas?")
Hub encerra a sessão ──POST logout_token──> hub-sso/backchannel-logout
  função valida o logout token (JWKS, iss, aud, iat ≤ 5 min, jti, evento, sem nonce)
  → hub_sso_revoke(sid, sub): marca o vínculo e apaga as sessões Supabase
  → has_role() passa a dizer "não" para o access token que ainda estiver no navegador
  → a tela do admin percebe em até 1 min (ou ao voltar para a aba) e volta para o Hub
```

Sem sessão, abrir `/admin` direto vai para o Hub e volta para a mesma página (não existe mais tela
de login do admin no uso normal). Um aluno logado que não é admin continua vendo "sem permissão".

## 3. Rotas e funções

| O quê | Onde |
| --- | --- |
| Entrada pelo lançador (initiate_login_uri) | `https://gba-orun.ifatokun.com.br/auth/hub/iniciar` (SPA, `src/pages/HubSsoStart.tsx`) |
| Retorno do Hub (redirect_uri) | `https://gba-orun.ifatokun.com.br/auth/hub/callback` (SPA, `src/pages/HubSsoCallback.tsx`) |
| Depois de sair (post_logout_redirect_uri) | `https://gba-orun.ifatokun.com.br/` |
| Logout por back-channel | `https://remrjowcbyavydfbkbny.supabase.co/functions/v1/hub-sso/backchannel-logout` |
| Edge Function | `supabase/functions/hub-sso` (`verify_jwt = false`): `GET status`, `POST start`, `POST exchange`, `POST backchannel-logout` |
| Guarda do /admin | `src/components/hub-sso/HubAdminGuard.tsx` (em volta da rota `/admin` em `src/App.tsx`) |
| "Sair" | `src/lib/hubSsoSession.ts` → `signOutWithHub()` (usado em `src/pages/Admin.tsx`) |
| Banco | `supabase/migrations/20261008230000_hub_sso.sql` (tabela `hub_sso_sessions` + funções), `20261009090000_hub_sso_end_local_sessions.sql` (encerra as sessões sem Hub de quem entrou pelo Hub) e `20261008230100_hub_sso_role_guard.sql` (`has_role` recusa sessão revogada) |

## 4. Configuração (nada fixo no código)

Segredos da Edge Function (`supabase secrets set`, nunca no git):

| Chave | Valor em produção | Observação |
| --- | --- | --- |
| `HUB_SSO_ENABLED` | `true` | Interruptor do servidor. `false` = a SPA volta ao login antigo **sem novo build** (plano B de emergência). |
| `HUB_ISSUER` | `https://hub.ifatokun.com.br/oidc` | |
| `HUB_CLIENT_ID` | do bloco "Login único" do sistema 9 | |
| `HUB_CLIENT_SECRET` | idem (aparece uma vez) | |
| `HUB_SSO_APP_URL` | `https://gba-orun.ifatokun.com.br` | origem da SPA: monta o redirect_uri e libera o CORS |
| `HUB_SSO_ALLOWED_ROLES` | `admin` | papéis de `user_roles` que podem entrar pelo Hub (lista separada por vírgula) |
| `HUB_SSO_LOCK_PASSWORD` | `true` (padrão) | troca a senha Supabase do admin por uma aleatória a cada login pelo Hub e encerra as sessões dele abertas sem o Hub: ninguém entra no admin com e-mail+senha direto no Supabase Auth (anon key pública) pulando o Hub, nem fica com uma sessão antiga aberta com a senha |
| `HUB_SSO_TOKEN_AUTH_METHOD` | `client_secret_basic` (padrão) | ou `client_secret_post`, igual ao bloco do Hub |
| `HUB_SSO_CALLBACK_PATH`, `HUB_SSO_POST_LOGOUT_PATH` | padrão `/auth/hub/callback` e `/` | só se mudar as rotas |

Variáveis de build da SPA (secrets do GitHub Actions, passadas no `npm run build`):

| Chave | Valor | Observação |
| --- | --- | --- |
| `VITE_HUB_SSO_ENABLED` | `true` | sem isto o app fica exatamente como antes |
| `VITE_HUB_ISSUER` | `https://hub.ifatokun.com.br/oidc` | único `iss` aceito na entrada |
| `VITE_HUB_SSO_LOCAL_LOGIN` | vazio / `false` | **plano B de emergência**: `true` volta a aceitar o login antigo do admin (e-mail e senha em `/auth`); com `HUB_SSO_LOCK_PASSWORD` ligado é preciso usar "Esqueci a senha" |
| `VITE_HUB_SSO_FUNCTION_URL` | opcional | padrão `${VITE_SUPABASE_URL}/functions/v1/hub-sso` |

## 5. Passo a passo de produção (Felipe)

1. **E-mails.** O Hub só emite contas `@ifatokun.com.br`. Cada admin do Gba-Orun precisa ter, no
   Supabase, o **mesmo** e-mail da conta do Hub, confirmado. Conferir no SQL Editor:
   ```sql
   SELECT u.email, u.email_confirmed_at IS NOT NULL AS confirmado
   FROM auth.users u JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin';
   ```
   Quem não for `@ifatokun.com.br`: trocar o e-mail (Authentication › Users › usuário › e-mail)
   **antes** de ligar. Ninguém é criado nem promovido automaticamente.
2. **Hub › Sistemas › Gba-Orun (id 9) › Login único › Configurar**: copiar o `client_secret`, e
   preencher:
   - URL de retorno: `https://gba-orun.ifatokun.com.br/auth/hub/callback`
   - URL de logout por back-channel: `https://remrjowcbyavydfbkbny.supabase.co/functions/v1/hub-sso/backchannel-logout`
   - URL após sair: `https://gba-orun.ifatokun.com.br/`
   - URL de entrada (initiate_login_uri): `https://gba-orun.ifatokun.com.br/auth/hub/iniciar`
   - Endereço do sistema no Hub pode continuar `https://gba-orun.ifatokun.com.br/` (a entrada leva
     para `/admin`). Ligar o interruptor e liberar o sistema para as pessoas certas.
3. **Segredos da função** (antes do deploy da função):
   ```bash
   supabase secrets set --project-ref remrjowcbyavydfbkbny \
     HUB_SSO_ENABLED=true HUB_ISSUER=https://hub.ifatokun.com.br/oidc \
     HUB_CLIENT_ID=hub-9-xxxx HUB_CLIENT_SECRET='...' \
     HUB_SSO_APP_URL=https://gba-orun.ifatokun.com.br HUB_SSO_ALLOWED_ROLES=admin
   ```
4. **Banco + função.** O merge em `main` dispara `deploy-supabase.yml`, que roda `supabase db push`
   (as três migrações `20261008230000_hub_sso.sql`, `20261008230100_hub_sso_role_guard.sql` e `20261009090000_hub_sso_end_local_sessions.sql`) e
   `supabase functions deploy` (inclui `hub-sso`). Manual, se preferir:
   ```bash
   supabase db push --project-ref remrjowcbyavydfbkbny
   supabase functions deploy hub-sso --project-ref remrjowcbyavydfbkbny
   ```
5. **SPA.** Criar os secrets do GitHub `VITE_HUB_SSO_ENABLED=true` e
   `VITE_HUB_ISSUER=https://hub.ifatokun.com.br/oidc` e acrescentá-los ao `env:` do passo
   `npm run build` em `.github/workflows/deploy-frontend.yml` (o workflow já faz o deploy atômico).
6. **Teste**: Hub › lançador › Gba-Orun → cai em `/admin` logado. Sair no Hub → em até 1 minuto o
   admin volta para o login do Hub.
7. **Recomendado**: Authentication › Settings › JWT expiry em 600–900 s (hoje 3600 s). O
   `has_role` já recusa o token revogado na hora; isto encurta o resto (ex.: telas que só leem a
   própria linha).

**Emergência (Hub fora do ar):** `supabase secrets set HUB_SSO_ENABLED=false` → o `/admin` volta
ao fluxo antigo sem rebuild (com a senha aleatória, use "Esqueci a senha"). Ou rebuild com
`VITE_HUB_SSO_LOCAL_LOGIN=true`.

## 6. Testes

- `npm test` — `src/test/hub-sso/*.test.ts` (84 testes): validação de `iss`/`target_link_uri`,
  PKCE (vetor do RFC 7636), estado de uso único e expiração, ID token e logout token **assinados
  de verdade** (RS256, chave de teste) e validados pelo `jose` num JWKS servido por HTTP local
  (nonce, aud, azp, iss, exp, iat, jti, evento, assinatura forjada, outro algoritmo), código usado
  duas vezes, PKCE errado, mapeamento e recusas (sem usuário, sem papel, bloqueado, e-mail não
  confirmado), troca de senha, o cliente `supabase-js` real com `fetch` falso (confere que só
  chama `rpc/hub_sso_find_user`, `admin/generate_link` e `verify`, nunca cria usuário).
- `bash supabase/tests/hub_sso/run.sh` — aplica as migrações num PostgreSQL local descartável
  (socket, sem porta) com um esqueleto do `auth` e confere permissões, status, revogação e o
  `has_role` recusando o token revogado.
- `scripts/hub-sso-dev.ts` — a função real em Deno + um Supabase falso em memória, para testar no
  navegador contra o Hub local (instruções no topo do arquivo).

## 7. Achados durante o trabalho

- **ALTO, já existia (não é do SSO):** a policy "Users can update own profile" deixa qualquer
  usuário mudar `is_premium`, `subscription_*`, `guru_*` do próprio perfil pela API pública, ou
  seja, virar premium de graça. Correção proposta, **não aplicada**:
  `supabase/proposed/protect_profile_subscription_columns.sql`.
- Papel de admin: `user_roles` só aceita escrita de admin (policy "Admins can manage roles"); não
  achei caminho de autopromoção.

## 8. Revisão de segurança (09/10/2026)

Conferido: ID token (assinatura RS256 fixa, JWKS com rotação, iss, aud, azp, exp, iat, nonce,
`email_verified`, `sid`), state/PKCE de uso único, destino depois do login (só mesma origem e
dentro de `/admin`; `//evil`, `/\evil`, codificados, `javascript:` caem em `/admin`), logout token
(evento, sem nonce, iat ≤ 5 min, sid/sub), CORS só da origem da SPA, funções SQL `SECURITY DEFINER`
com `search_path` fixo e execução só para `service_role`, interruptores com padrão seguro.

Corrigido nesta revisão:
- **Sessões abertas sem o Hub continuavam valendo** depois que o admin passava a entrar pelo Hub
  (ex.: alguém que entrou com a senha antes da troca, ou por um link de "Esqueci a senha"). Agora
  cada login pelo Hub (com `HUB_SSO_LOCK_PASSWORD` ligado) encerra as sessões Supabase dessa pessoa
  que não vieram do Hub (`hub_sso_end_local_sessions`).
- O retorno do Hub com `iss` de outro emissor é recusado (RFC 9207); o código sai da barra de
  endereço antes da troca; a tela de erro não repete texto livre vindo do link (`?error=`).

Fica para o Felipe decidir (não corrigido): o Supabase Auth continua aceitando **"Esqueci a
senha" / link mágico** pela anon key pública. Quem controlar a caixa de e-mail de um admin abre
uma sessão de admin sem o TOTP do Hub (ela dura até o próximo login dele pelo Hub, que a encerra).
O fechamento completo é um *Custom Access Token Hook* do Supabase (Authentication › Hooks) que
recuse emitir token para papéis do Hub quando a sessão não estiver em `hub_sso_sessions`, ou
desligar o login por e-mail para esses usuários. Mexe no login de todo o projeto, por isso não foi
ligado sem você.
