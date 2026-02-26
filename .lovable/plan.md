

# Plano: Checkout Guru como Unica Porta de Entrada + Dados Completos do Comprador

## Resumo

O sistema sera ajustado para que a unica forma de criar conta seja via compra na Guru (ou cortesia pelo admin). Nao havera cadastro manual em nenhum lugar do app. Alem disso, o webhook vai extrair todos os dados relevantes do payload da Guru (nome, email, plano mensal/anual) e popular o perfil completo do usuario, permitindo gestao de inadimplencia e controle de recorrencia.

## O que muda

### 1. Webhook da Guru -- Auto-criacao de conta com dados completos

**Arquivo:** `supabase/functions/guru-webhook/index.ts`

Quando o webhook receber pagamento aprovado e o usuario NAO existir:

- Criar conta via `supabase.auth.admin.createUser()` com:
  - Email do comprador
  - Senha aleatoria (16 caracteres)
  - `email_confirm: true` (sem necessidade de verificacao)
  - `display_name` extraido do payload (`body.buyer.name` ou `body.customer.name`)
- Disparar email de recuperacao de senha via `supabase.auth.admin.generateLink({ type: 'recovery' })` para o comprador definir sua propria senha
- Popular o perfil com TODOS os dados do checkout:
  - `display_name`: nome do comprador
  - `is_premium: true`
  - `subscription_status: 'active'`
  - `subscription_started_at`: data atual
  - `subscription_expires_at`: +30 dias (mensal) ou +365 dias (anual)
  - `subscription_plan_id`: vinculado ao plano correspondente na tabela `subscription_plans`
  - `guru_id`: ID da transacao
  - `guru_subscription_id`: ID da assinatura na Guru

**Logica de duracao do plano:**
- O webhook vai verificar o campo de produto/plano da Guru (`body.product`, `body.subscription.plan`, `body.offer`) para determinar se e mensal ou anual
- Buscar o plano correspondente na tabela `subscription_plans` pelo nome ou preco
- Se nao encontrar correspondencia, usar 30 dias como padrao (mensal)

**Para usuarios que JA existem** (fluxo atual melhorado):
- Alem de ativar premium, tambem atualizar `display_name` se estiver vazio
- Vincular ao `subscription_plan_id` correto
- Calcular `subscription_expires_at` baseado no tipo de plano (mensal = 30 dias, anual = 365 dias)

### 2. Remover cadastro manual da pagina Admin

**Arquivo:** `src/pages/Admin.tsx`

- Remover o botao "Criar Conta Admin (primeiro acesso)" e a funcao `handleSignUp`
- Manter apenas o formulario de login
- O primeiro admin ja foi criado; novos admins sao adicionados via painel admin (cortesia)

### 3. Pagina de Auth -- Somente Login (ja esta assim)

**Arquivo:** `src/pages/Auth.tsx`

- Nenhuma mudanca necessaria. Ja possui apenas "Entrar" e "Esqueci minha senha"
- Nao sera adicionado botao de cadastro

### 4. Hook useAuth -- Remover funcao signUp da exposicao publica

**Arquivo:** `src/hooks/useAuth.ts`

- Remover `signUp` do retorno do hook para garantir que nenhum componente use cadastro manual
- Manter a funcao internamente caso o admin precise (via edge function)

## Fluxo Completo

```text
COMPRADOR:
  Guru checkout → Paga → Webhook recebe
    → Usuario existe? → Atualiza premium + vincula plano
    → Usuario NAO existe? → Cria conta + popula perfil + ativa premium
      → Envia email "Defina sua senha"
      → Comprador define senha → Acessa o app

CORTESIA (Admin):
  Admin → Painel → Cadastra usuario como cortesia (fluxo existente)

INADIMPLENCIA:
  Guru envia webhook "overdue" → Webhook bloqueia acesso
  Cron diario 03h → Verifica expiracoes → Bloqueia quem passou da data
```

## Gestao de Recorrencia

Com o `subscription_plan_id` vinculado e o `subscription_expires_at` calculado corretamente por tipo de plano:
- Plano mensal: expira em 30 dias, Guru renova e webhook atualiza
- Plano anual: expira em 365 dias, Guru renova e webhook atualiza
- Se Guru enviar "overdue": acesso bloqueado imediatamente
- Se Guru enviar "cancelled": acesso bloqueado
- Cron diario: backup para pegar expiracoes que o webhook nao cobriu

## Arquivos Modificados

1. `supabase/functions/guru-webhook/index.ts` -- auto-criacao + dados completos
2. `src/pages/Admin.tsx` -- remover botao de cadastro manual
3. `src/hooks/useAuth.ts` -- remover signUp do retorno publico

## Nenhuma mudanca de banco de dados

Todas as colunas necessarias ja existem na tabela `profiles` (`subscription_plan_id`, `subscription_expires_at`, `display_name`, etc.).

