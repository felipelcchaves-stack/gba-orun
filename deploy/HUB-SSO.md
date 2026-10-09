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
| Banco | `supabase/migrations/20261008230000_hub_sso.sql` (tabela `hub_sso_sessions` + funções), `20261009090000_hub_sso_end_local_sessions.sql` (encerra as sessões sem Hub de quem entrou pelo Hub) e `20261008230100_hub_sso_role_guard.sql` (`has_role` recusa sessão revogada); segurança: `20261009120000_security_profiles_subscription_lockdown.sql` (membro não vira premium sozinho); hook: `20261009130000_hub_sso_access_token_hook.sql` (só cria as funções, ver §9) |

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
   A ordem completa das migrações deste branch está em §9.1. A `20261009130000` só cria as funções
   do hook: nada muda até você ligá-lo (§9.3).
   Para aplicar **só a correção de segurança agora**, sem o SSO: SQL Editor › colar o conteúdo de
   `supabase/migrations/20261009120000_security_profiles_subscription_lockdown.sql` › Run. Quando o
   `db push` rodar depois, ela roda de novo sem efeito (é idempotente).
5. **SPA.** Criar os secrets do GitHub `VITE_HUB_SSO_ENABLED=true` e
   `VITE_HUB_ISSUER=https://hub.ifatokun.com.br/oidc` e acrescentá-los ao `env:` do passo
   `npm run build` em `.github/workflows/deploy-frontend.yml` (o workflow já faz o deploy atômico).
6. **Teste**: Hub › lançador › Gba-Orun → cai em `/admin` logado. Sair no Hub → em até 1 minuto o
   admin volta para o login do Hub.
7. **Recomendado**: Authentication › Settings › JWT expiry em 600–900 s (hoje 3600 s). O
   `has_role` já recusa o token revogado na hora; isto encurta o resto (ex.: telas que só leem a
   própria linha).

**Emergência (Hub fora do ar):** se o hook de §9.3 estiver ligado, **desligue-o primeiro** (senão "Esqueci a senha" é recusado para admin). Depois: `supabase secrets set HUB_SSO_ENABLED=false` → o `/admin` volta
ao fluxo antigo sem rebuild (com a senha aleatória, use "Esqueci a senha"). Ou rebuild com
`VITE_HUB_SSO_LOCAL_LOGIN=true`.

## 6. Testes

- `npm test` — `src/test/hub-sso/*.test.ts` (102 testes no `npm test`, incluindo `guard.test.ts`: o guarda das Edge Functions, §9.4): validação de `iss`/`target_link_uri`,
  PKCE (vetor do RFC 7636), estado de uso único e expiração, ID token e logout token **assinados
  de verdade** (RS256, chave de teste) e validados pelo `jose` num JWKS servido por HTTP local
  (nonce, aud, azp, iss, exp, iat, jti, evento, assinatura forjada, outro algoritmo), código usado
  duas vezes, PKCE errado, mapeamento e recusas (sem usuário, sem papel, bloqueado, e-mail não
  confirmado), troca de senha, o cliente `supabase-js` real com `fetch` falso (confere que só
  chama `rpc/hub_sso_find_user`, `admin/generate_link` e `verify`, nunca cria usuário).
- `bash supabase/tests/hub_sso/run.sh` — além do abaixo, roda `hook_test.sql` (o hook como
  `supabase_auth_admin`: permissões, cada método de login, claims obrigatórias mantidas, a regra
  com e sem a claim) e os testes de segurança (`security_base/before/after.sql`): o membro virando premium antes da correção e barrado depois (aplicada duas vezes), com a tela de admin, o service role e o postgres ainda gravando.
  O mesmo script aplica as migrações num PostgreSQL local descartável
  (socket, sem porta) com um esqueleto do `auth` e confere permissões, status, revogação e o
  `has_role` recusando o token revogado.
- `scripts/hub-sso-dev.ts` — a função real em Deno + um Supabase falso em memória, para testar no
  navegador contra o Hub local (instruções no topo do arquivo).

## 7. Achados durante o trabalho

- **ALTO, já existia (não é do SSO) — CORRIGIDO em 09/10/2026:** a policy "Users can update own
  profile" deixava qualquer usuário mudar `is_premium`, `subscription_*`, `guru_*` do próprio
  perfil pela API pública (virar premium de graça). Agora é a migração
  `20261009120000_security_profiles_subscription_lockdown.sql` (ver §9). A versão "proposta" que
  existia tinha um defeito: o gatilho era `SECURITY DEFINER`, então o `current_user` dentro dele
  era sempre o dono e ele nunca barrava nada; a migração usa `SECURITY INVOKER` e um teste pega
  esse erro.
- **Fora do escopo, só registro:** o `useDeviceGuard` (um dispositivo por conta) roda no navegador;
  o próprio membro consegue trocar `device_id`. Não é brecha de pagamento, mas não é trava real.
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

Era a decisão pendente: o Supabase Auth aceitava **"Esqueci a senha" / link mágico** pela anon key
pública, e quem controlasse a caixa de e-mail de um admin abria uma sessão de admin sem o TOTP do
Hub. **Preparado em 09/10/2026, não ligado:** o *Custom Access Token Hook*
`hub_sso_access_token_hook` e o guarda das Edge Functions. Para ligar e desligar, ver §9.3.

## 9. Correções de segurança e fechamento do "Esqueci a senha" (09/10/2026)

### 9.1 Ordem das migrações deste branch

O `supabase db push` aplica nesta ordem (todas idempotentes, nenhuma migração antiga foi editada):

1. `20261008230000_hub_sso.sql` — SSO
2. `20261008230100_hub_sso_role_guard.sql` — SSO
3. `20261009090000_hub_sso_end_local_sessions.sql` — SSO
4. `20261009120000_security_profiles_subscription_lockdown.sql` — **correção de segurança, independe do SSO**
5. `20261009130000_hub_sso_access_token_hook.sql` — **só cria** as funções do hook (precisa das do SSO). Sem
   o hook ligado, nada muda.

### 9.2 O que pode ir para produção já, sem o SSO

- **`20261009120000_security_profiles_subscription_lockdown.sql` — pode aplicar já, sozinha.**
  Membro não muda mais `is_premium`, `is_courtesy`, `subscription_*` nem `guru_*` do próprio
  perfil pela API pública. Continua funcionando: a tela de admin (liberar/travar acesso, editar,
  resetar dispositivo), o `guru-webhook`, o `check-expired-subscriptions`, o `admin-manage-users`
  (service role), o cadastro (`handle_new_user`) e tudo o que o membro edita no próprio perfil
  (nome, religião, gênero, dia de cuidado, nascimento, status de Ifá, onboarding, foto,
  dispositivo, UTMs). Coluna nova em `profiles` que o membro precise editar pelo app passa a
  exigir `GRANT UPDATE (coluna) ON public.profiles TO authenticated` na migração dela.

Todas foram testadas no PostgreSQL local: o ataque funciona antes e é barrado depois, os caminhos
legítimos continuam gravando, e aplicar duas vezes não quebra nada.

### 9.3 Hook que fecha o "Esqueci a senha" para admins (preparado, NÃO ligado)

**O que faz.** O Supabase Auth chama `public.hub_sso_access_token_hook` antes de emitir qualquer
token (login e renovação). Para quem tem papel gerenciado pelo Hub (`admin` (`user_roles`); a função
`hub_sso_hook_roles()` precisa bater com o segredo `HUB_SSO_ALLOWED_ROLES`):

- sessão aberta pelo Hub: o token sai normal;
- sessão que **não** veio do Hub, aberta por senha, link de "Esqueci a senha", cadastro, convite,
  troca de e-mail, ou a **renovação** dela: **recusada** ("Quem administra entra pelo Hub");
- sessão encerrada no Hub: recusada;
- link mágico: sai o token, marcado `hub_sso: "unlinked"`. O link do próprio Hub é igual a um link
  mandado por e-mail, então não dá para recusar na hora. Esse token **não tem poder de admin**
  (todas as checagens de papel no banco e o guarda das funções recusam) e não se renova. O Hub
  vincula a sessão dele antes de entregar ao navegador, então o login pelo Hub funciona.

Alunos, membros e quem não tem papel do Hub: nada muda. Com o hook desligado, nada muda para
ninguém. Se o hook tiver um erro interno, o login passa como "unlinked" (sem poder de admin), em
vez de travar todo mundo.

**Pré-requisitos:** SSO em produção e testado (§5), as migrações de §9.1 aplicadas e as funções
publicadas.

**Ligar:**
1. Dashboard do projeto `remrjowcbyavydfbkbny` › Authentication › Hooks (ou "Auth Hooks") ›
   **Customize Access Token (JWT) Claims hook** › Add/Enable.
2. Tipo **Postgres**, schema `public`, função `hub_sso_access_token_hook` › Save.
   (Não precisa mexer em permissões: a migração já deu `EXECUTE` só ao `supabase_auth_admin`.)
3. Teste logo em seguida, numa janela anônima:
   - Hub › lançador › Gba-Orun → cai no `/admin` logado. Deixe a aba aberta mais que o tempo do
     JWT (ou recarregue depois de alguns minutos): continua logado.
   - Em `/auth`, "Esqueci a senha" com o e-mail de um admin → o link do e-mail **não** abre sessão
     (mensagem do Hub).
   - Um aluno/membro entra com e-mail e senha normalmente.

**Desligar (rollback imediato):** mesma tela › desligar (ou remover) o hook. Vale na hora para os
próximos tokens; não precisa mexer no banco. Para remover as funções de vez (opcional, com o hook
desligado): `DROP FUNCTION public.hub_sso_access_token_hook(jsonb); DROP FUNCTION
public.hub_sso_hook_roles();`. A regra "unlinked" em `hub_sso_current_session_revoked()` pode
ficar: sem o hook, nenhum token tem essa marca.

**Emergência com o hook ligado:** desligue o hook **antes** de `HUB_SSO_ENABLED=false`; senão o
"Esqueci a senha" do admin continua recusado.

**Não pôr no `supabase/config.toml`** (`[auth.hook.custom_access_token]`): um `config push`
ligaria o hook sem o teste acima.

### 9.4 Edge Functions que conferem papel com o service role

O hook protege o que o banco confere com o JWT de quem chama. Funções que leem `user_roles` /
`is_admin` com a **service role** não veem esse JWT. Por isso o guarda
`supabase/functions/_shared/hub-sso/guard.ts` (igual nos três projetos) faz a mesma pergunta ao
banco **como quem chamou** (`rpc/hub_sso_current_session_revoked` com o JWT dela) e devolve 403
quando a sessão foi encerrada no Hub ou é uma sessão de admin sem o Hub. Se der erro, ele bloqueia
(por isso as funções vão para produção depois das migrações, como o workflow já faz).

Nenhuma função do Gba-Orun precisou do guarda: o `admin-manage-users` confere `has_role` com o
JWT de quem chamou, então a regra do banco já vale para ele.

### 9.5 O que continua de fora

- Um link mágico pedido por e-mail para o endereço de um admin ainda abre uma sessão **comum**
  (sem admin) até o JWT expirar, sem renovar. O próximo login dele pelo Hub encerra essa sessão.
- O hook só cobre os papéis de `hub_sso_hook_roles()`.
