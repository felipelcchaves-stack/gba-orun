

# Corrigir Webhook da Guru -- Mapeamento Real do Payload

## Problema

O webhook esta falhando por dois motivos:

1. **Autenticacao**: A Guru envia o token como `payload.api_token` dentro do corpo JSON. O codigo atual procura nos headers (`x-guru-token` / `Authorization`), entao nunca encontra e rejeita com 401.

2. **Mapeamento de campos errado**: O payload real da Guru tem estrutura aninhada diferente do que o codigo espera:

```text
Codigo atual espera:          Guru envia de verdade:
─────────────────────         ──────────────────────
body.status                   body.payload.last_status
body.buyer.email              body.payload.subscriber.email
body.buyer.name               body.payload.subscriber.name
body.subscription.id          body.payload.subscription_code
body.transaction.id           body.payload.last_transaction.id
body.transaction.value        body.payload.last_transaction.payment.total
body.product.name             body.payload.product.name
(nenhum)                      body.payload.charged_every_days (30)
(nenhum)                      body.payload.product.offer.plan.interval_type ("month")
```

## Solucao

Reescrever a extracao de dados no `supabase/functions/guru-webhook/index.ts` para mapear corretamente os campos reais do payload da Guru.

### Mudancas no arquivo `supabase/functions/guru-webhook/index.ts`

**A. Validacao de Token (linhas 22-31)**

Mover a validacao para DEPOIS de parsear o JSON, e comparar com `body.payload.api_token`:

```text
ANTES:  token = headers["x-guru-token"] ou headers["Authorization"]
DEPOIS: token = body.payload?.api_token (tambem manter fallback para headers)
```

**B. Extracao de dados (apos parsear o body)**

Mapear todos os campos para a estrutura real:

```text
status       = body.payload?.last_status
                OU body.payload?.last_transaction?.status
email        = body.payload?.subscriber?.email
                OU body.payload?.last_transaction?.contact?.email
buyerName    = body.payload?.subscriber?.name
                OU body.payload?.last_transaction?.contact?.name
guruSubId    = body.payload?.subscription_code OU body.payload?.id
transactionId = body.payload?.last_transaction?.id
purchaseValue = body.payload?.last_transaction?.payment?.total
                 OU body.payload?.current_invoice?.value
```

**C. Deteccao de plano mensal/anual (melhorada)**

Usar os campos reais da Guru que sao muito mais confiaveis:

```text
intervalType = body.payload?.product?.offer?.plan?.interval_type
               // "month" ou "year"
chargedDays  = body.payload?.charged_every_days
               // 30 para mensal

SE intervalType == "year" OU chargedDays >= 365:
  durationDays = 365, billingPeriod = "yearly"
SENAO:
  durationDays = 30, billingPeriod = "monthly"
```

**D. Mapeamento de status da Guru**

A Guru envia `last_status` com valores como:

```text
"active"     → pagamento aprovado, ativar premium
"overdue"    → inadimplente, bloquear acesso
"canceled"   → cancelado, bloquear acesso
"unpaid"     → nao pago, bloquear acesso
```

Ajustar a lista de status aprovados:

```text
isApproved = status IN ("active", "approved", "paid",
             "payment_approved", "completed",
             "subscription_created", "subscription_renewed")
```

### Nenhuma mudanca em outros arquivos

Apenas o webhook precisa ser corrigido. O resto do fluxo (criacao de conta, ativacao premium, email de senha) ja esta implementado e correto -- so nao estava sendo executado porque o webhook rejeitava antes.

## Resultado Esperado

Apos a correcao:
1. Guru envia o webhook com o payload real
2. Token e validado via `payload.api_token`
3. Dados do comprador sao extraidos corretamente
4. Conta e criada (se nova) ou premium ativado (se existente)
5. Email de "Defina sua senha" e enviado para novos compradores
6. Plano mensal/anual detectado automaticamente via `interval_type`

