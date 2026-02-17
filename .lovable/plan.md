

# Plano Consolidado: Correções e Melhorias para Lançamento

## STATUS DO QUE JA FOI FEITO

- [FEITO] Remover staleTime de 30min de useOracleFlows.ts (nodes/edges)
- [FEITO] Forçar invalidação completa no onSuccess do useSaveFlowCanvas
- [FEITO] Remover staleTime de 30min de useRituals.ts
- [FEITO] Forçar invalidação completa nas mutações de rituais

## O QUE FALTA IMPLEMENTAR

---

### 1. Service Worker CacheFirst -> StaleWhileRevalidate (BUG CRITICO)

O `vite.config.ts` linha 41 usa `CacheFirst` para rotas do banco de dados (rituals, offerings, oracle_flow, etc.). Isso faz o Service Worker interceptar as requisições e servir dados velhos por até 24 horas, anulando todas as correções de cache que já fizemos.

**Arquivo:** `vite.config.ts`
**Mudança:** Trocar `handler: "CacheFirst"` para `handler: "StaleWhileRevalidate"` na primeira regra de runtimeCaching (linha 41). Também reduzir maxAgeSeconds de 86400 (24h) para 3600 (1h).

---

### 2. Webhook Guru: Busca por email escalável (BUG CRITICO)

O `guru-webhook/index.ts` linha 33 chama `supabase.auth.admin.listUsers()` sem filtro, carregando TODOS os usuários na memória. Tem limite de 1000 usuários -- após esse limite, novos compradores nunca serão encontrados.

**Arquivo:** `supabase/functions/guru-webhook/index.ts`
**Mudança:** Substituir o bloco de busca por email por uma query direta na tabela `profiles` usando o email. Isso é eficiente e sem limite.

Antes:
```
const { data: users } = await supabase.auth.admin.listUsers();
const user = users?.users?.find((u) => u.email === email);
```

Depois:
```
const { data: profile, error: profileErr } = await supabase
  .from("profiles")
  .select("user_id")
  .eq("email", email)
  .maybeSingle();
```

Precisamos verificar se a tabela profiles tem coluna email. Se não tiver, buscaremos via auth.users com RPC ou usaremos a API admin com paginação.

---

### 3. Webhook: Validação de autenticidade (SEGURANÇA)

Qualquer pessoa pode enviar POST para o webhook e ativar premium. Adicionaremos validação via um token secreto configurado como variável de ambiente.

**Arquivo:** `supabase/functions/guru-webhook/index.ts`
**Mudança:** Adicionar verificação de um header `X-Guru-Token` ou `Authorization` contra um secret `GURU_WEBHOOK_SECRET`. Se não bater, retornar 401.

Será necessário configurar o secret `GURU_WEBHOOK_SECRET` antes de implementar.

---

### 4. Cron job para check-expired-subscriptions

A edge function existe mas nunca é chamada automaticamente. Usuários com assinatura expirada continuam premium.

**Mudança:** Habilitar extensões `pg_cron` e `pg_net` via migração SQL, depois criar o cron job via SQL insert para chamar a função diariamente à meia-noite.

---

### 5. "Esqueci minha senha" na página de Auth

A página de login não tem recuperação de senha. Usuários que esquecem a senha ficam travados.

**Arquivo:** `src/pages/Auth.tsx`
**Mudança:** Adicionar um terceiro estado `isForgot` além de `isLogin` e `!isLogin`. Quando ativo, mostra apenas o campo de email e chama `supabase.auth.resetPasswordForEmail(email)`. Incluir link "Esqueci minha senha" abaixo do formulário de login.

---

### 6. trackLead() no signup

**Arquivo:** `src/pages/Auth.tsx`
**Mudança:** Após signup bem-sucedido (linha 24-26), chamar `trackLead()` importado de `@/lib/pixel`.

---

### 7. Dead-end protection no Oráculo

Se o fluxo tem um nó sem edge de saída (e não é diagnosis), o usuário fica preso sem botões.

**Arquivo:** `src/components/oracle/DynamicFlowRunner.tsx`
**Mudança:** No `handleNext`, se nenhuma edge é encontrada (nem específica nem default), mostrar um estado de "beco sem saída" com botão "Voltar ao início" (reset).

---

### 8. ProtectedRoute no /admin

A rota `/admin` não usa `ProtectedRoute`. Qualquer usuário não-logado vê a interface.

**Arquivo:** `src/App.tsx`
**Mudança:** Trocar `<Route path="/admin" element={<Admin />} />` por `<Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />`.

---

### 9. Páginas de Termos de Uso e Política de Privacidade

Obrigatórias para vender online no Brasil.

**Novos arquivos:** `src/pages/Terms.tsx` e `src/pages/Privacy.tsx`
**Mudanças em:** `src/App.tsx` (adicionar rotas) e `src/pages/Oferta.tsx` (adicionar links no footer).

Conteúdo básico com placeholders para você personalizar depois.

---

### 10. Spinner no botão de login

**Arquivo:** `src/pages/Auth.tsx`
**Mudança:** Adicionar ícone `Loader2` com animação `animate-spin` quando `loading` está ativo.

---

## RESUMO DE ARQUIVOS

| Arquivo | Mudança |
|---------|---------|
| `vite.config.ts` | CacheFirst -> StaleWhileRevalidate |
| `supabase/functions/guru-webhook/index.ts` | Busca por email + validação de token |
| `src/pages/Auth.tsx` | Esqueci senha + trackLead + spinner |
| `src/components/oracle/DynamicFlowRunner.tsx` | Dead-end protection |
| `src/App.tsx` | ProtectedRoute no /admin + rotas termos/privacidade |
| `src/pages/Oferta.tsx` | Links termos/privacidade no footer |
| Novo: `src/pages/Terms.tsx` | Termos de uso |
| Novo: `src/pages/Privacy.tsx` | Política de privacidade |
| Migração SQL | pg_cron + pg_net + cron job |
| Secret | GURU_WEBHOOK_SECRET |

**Total: 7 arquivos modificados, 2 novos, 1 migração SQL, 1 secret**

