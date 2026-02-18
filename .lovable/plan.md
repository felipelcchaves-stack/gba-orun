

# Instalar Meta Conversions API (CAPI) + Ativar Eventos Pixel

## Por que o CAPI?

O Pixel do Meta roda no navegador do usuario e pode ser bloqueado por ad blockers, iOS 14+, ou perda de cookies. O CAPI envia os mesmos eventos **pelo servidor**, garantindo que o Meta receba 100% das conversoes. Juntos, Pixel + CAPI formam o que o Meta chama de "Redundant Event Setup" -- a configuracao recomendada.

## O que sera feito

### 1. Criar Edge Function `meta-capi` (servidor)

Nova funcao backend que envia eventos diretamente para a API do Meta (`graph.facebook.com`).

**Eventos enviados pelo servidor:**
- **Purchase** -- quando o webhook da Guru confirma pagamento
- **Lead** -- quando um novo usuario faz login pela primeira vez

**Como funciona:**
- A funcao recebe `event_name`, `email`, `value`, `currency`
- Faz hash SHA-256 do email (exigencia do Meta)
- Envia para `https://graph.facebook.com/v21.0/{PIXEL_ID}/events`
- Usa o `META_CAPI_TOKEN` (token de acesso do servidor)

**Segredos necessarios (novos):**
- `META_CAPI_TOKEN` -- Token de acesso gerado no Gerenciador de Eventos do Meta
- O Pixel ID ja esta salvo na tabela `app_settings` (chave `meta_pixel_id`)

### 2. Guru Webhook envia Purchase via CAPI

Apos ativar a assinatura do usuario com sucesso, o webhook da Guru chamara a funcao `meta-capi` internamente para enviar o evento `Purchase` com o email e valor.

### 3. Disparar Lead no primeiro login

No `Auth.tsx`, apos login bem-sucedido, verificar se e o primeiro acesso do usuario (checando `onboarding_completed` no perfil). Se for o primeiro login, disparar:
- `trackLead()` no Pixel (navegador)
- Chamada a funcao `meta-capi` com evento `Lead` (servidor)

### 4. Disparar InitiateCheckout via CAPI tambem

No `PremiumLockModal.tsx` e `Oferta.tsx`, alem do Pixel no navegador, tambem enviar `InitiateCheckout` pelo servidor via `meta-capi`.

---

## Detalhes tecnicos

### Nova Edge Function: `supabase/functions/meta-capi/index.ts`

```
POST /meta-capi
Body: { event_name, email, value?, currency?, event_source_url? }
```

- Busca `meta_pixel_id` da tabela `app_settings`
- Usa secret `META_CAPI_TOKEN` do ambiente
- Hash SHA-256 do email com `crypto.subtle.digest`
- POST para `graph.facebook.com/v21.0/{pixel_id}/events`
- Retorna status do envio

### Arquivo: `supabase/functions/guru-webhook/index.ts`

- Apos bloco de ativacao de assinatura (linha 93), adicionar chamada interna a `meta-capi` com:
  - `event_name: "Purchase"`
  - `email` do comprador
  - `value` do pagamento (se disponivel no payload da Guru)

### Novo helper: `src/lib/capi.ts`

Funcao client-side que chama a edge function `meta-capi`:
```ts
export const sendCAPIEvent = async (eventName, email, value?, currency?)
```

### Arquivo: `src/pages/Auth.tsx`

- Apos login bem-sucedido, buscar perfil do usuario
- Se `onboarding_completed === false` ou perfil recem-criado:
  - Chamar `trackLead()` (Pixel browser)
  - Chamar `sendCAPIEvent("Lead", email)` (CAPI servidor)

### Arquivos: `src/components/PremiumLockModal.tsx` e `src/pages/Oferta.tsx`

- Apos `trackInitiateCheckout()`, tambem chamar `sendCAPIEvent("InitiateCheckout", userEmail)`

---

## Segredo necessario

Voce precisara gerar um **Token de Acesso do Servidor** no Meta:
1. Acesse o [Gerenciador de Eventos](https://business.facebook.com/events_manager)
2. Selecione seu Pixel
3. Va em **Configuracoes** > **Conversions API**
4. Clique em **Gerar token de acesso**
5. Copie o token gerado

Eu vou solicitar esse token de forma segura antes de implementar.

---

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/meta-capi/index.ts` | Criar (nova edge function) |
| `supabase/functions/guru-webhook/index.ts` | Modificar (adicionar chamada CAPI no Purchase) |
| `src/lib/capi.ts` | Criar (helper client-side) |
| `src/pages/Auth.tsx` | Modificar (trackLead no primeiro login) |
| `src/components/PremiumLockModal.tsx` | Modificar (adicionar CAPI InitiateCheckout) |
| `src/pages/Oferta.tsx` | Modificar (adicionar CAPI InitiateCheckout) |

**Total: 4 arquivos modificados + 2 novos**

