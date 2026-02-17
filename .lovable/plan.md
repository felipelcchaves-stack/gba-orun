

# Plano: Sistema de Assinaturas, Inadimplencia e Metricas Financeiras

Transicao do modelo vitalicio para assinatura mensal via Guru, com controle de inadimplencia, gestao de planos e metricas financeiras no dashboard admin.

---

## O que muda para o usuario

- A landing page `/oferta` passa a mostrar **preco mensal** em vez de vitalicio, com textos como "por mes" e FAQ atualizado
- O modal Premium (cadeado) tambem reflete o modelo de assinatura
- Se a assinatura vencer ou for cancelada, o acesso premium e **travado automaticamente** (volta a ser gratuito)
- Na tela de perfil, o usuario ve o status da sua assinatura (ativa, vencida, data de renovacao)

## O que muda para o admin

- Novos KPIs no dashboard: **Ativos**, **Inadimplentes**, **Previsao de Receita Mensal**
- Tabela de usuarios mostra status da assinatura (Ativo, Inadimplente, Gratuito) com datas
- Nova secao **"Planos"** no sidebar para criar/editar planos com nome, preco, link Guru e descricao
- Capacidade de **travar manualmente** uma conta inadimplente

---

## Detalhes Tecnicos

### 1. Migration SQL -- Novas tabelas e colunas

**Tabela `subscription_plans` (planos editaveis)**
```
id UUID PK
name TEXT NOT NULL (ex: "Mensal", "Trimestral")
price DECIMAL NOT NULL
billing_period TEXT NOT NULL DEFAULT 'monthly' (monthly, quarterly, yearly)
guru_checkout_url TEXT (link direto do checkout na Guru)
description TEXT
is_active BOOLEAN DEFAULT true
display_order INT DEFAULT 0
created_at TIMESTAMPTZ DEFAULT now()
```

**Novas colunas em `profiles`**
```
subscription_status TEXT DEFAULT 'free' (free, active, overdue, cancelled)
subscription_plan_id UUID NULL FK -> subscription_plans
subscription_started_at TIMESTAMPTZ NULL
subscription_expires_at TIMESTAMPTZ NULL
guru_subscription_id TEXT NULL
```

**RLS:**
- `subscription_plans`: SELECT publico, ALL para admin
- Colunas novas em `profiles`: ja protegidas pelas policies existentes

**Atualizar funcao `admin_list_profiles`:** retornar os novos campos de assinatura

**Atualizar funcao `admin_get_stats`:** adicionar `active_subscribers`, `overdue_users`, `monthly_revenue_forecast`

### 2. Webhook da Guru -- Suportar eventos de assinatura (`guru-webhook/index.ts`)

Alem de `payment_approved`, tratar novos eventos:
- `subscription_created` / `subscription_renewed` -> `subscription_status = 'active'`, atualizar `subscription_expires_at` (+30 dias), `is_premium = true`
- `subscription_overdue` / `payment_refunded` -> `subscription_status = 'overdue'`, `is_premium = false` (trava acesso)
- `subscription_cancelled` -> `subscription_status = 'cancelled'`, `is_premium = false`

O webhook busca o plano correspondente via `guru_checkout_url` ou `guru_subscription_id` para vincular ao `subscription_plan_id`.

### 3. Hook `usePremium.ts` -- Verificacao dupla

Alem de checar `is_premium`, verificar se `subscription_expires_at` nao esta no passado. Se estiver, tratar como inadimplente no frontend (mesmo que o webhook ainda nao tenha atualizado).

### 4. Nova secao Admin: Planos (`AdminPlans.tsx`)

- Listar planos cadastrados (nome, preco, periodo, link Guru, ativo/inativo)
- Formulario para criar/editar plano
- Toggle para ativar/desativar plano
- Os planos ativos aparecem na landing page automaticamente

**Hook: `useSubscriptionPlans.ts`** -- CRUD da tabela `subscription_plans`

### 5. Dashboard Admin -- Novas metricas (`AdminDashboard.tsx`)

Novos KPI cards:
- **Assinantes Ativos** (subscription_status = 'active')
- **Inadimplentes** (subscription_status = 'overdue')
- **Previsao de Receita** = assinantes ativos x preco do plano vinculado (calculado no frontend a partir dos profiles + plans)

### 6. Tabela de Usuarios Admin (`AdminUsers.tsx`)

- Coluna "Assinatura" com badges coloridos:
  - Verde: Ativo
  - Vermelho: Inadimplente
  - Cinza: Gratuito
  - Amarelo: Cancelado
- Coluna "Expira em" com a data de `subscription_expires_at`
- Filtro novo: por status de assinatura (Ativo / Inadimplente / Cancelado / Gratuito)
- Botao para admin travar/destravar manualmente (atualiza `is_premium` e `subscription_status`)

### 7. Landing Page (`Oferta.tsx`) -- Modelo de assinatura

- Trocar "Acesso Vitalicio" por "Assinatura Mensal" (ou o nome do plano ativo)
- Mostrar preco como "R$ XX/mes"
- Se houver mais de um plano ativo, mostrar cards de comparacao de planos
- Atualizar FAQ: remover pergunta sobre "acesso vitalicio", adicionar "posso cancelar a qualquer momento?"
- CTA abre o `guru_checkout_url` do plano selecionado

### 8. Modal Premium (`PremiumLockModal.tsx`)

- Atualizar texto para refletir assinatura mensal
- Mostrar preco do plano ativo mais barato
- Link vai para a LP `/oferta` ou direto para o checkout do plano

### 9. Sidebar Admin (`AdminSidebar.tsx`)

- Adicionar item "Planos" com icone `CreditCard` entre "Usuarios" e "Rituais"
- Expandir `AdminSection` com `"plans"`

### 10. Admin.tsx

- Adicionar render da secao `"plans"` -> `<AdminPlans />`

---

## Dados mockados para teste

Inserir via migration 2 planos iniciais:
- **Mensal**: R$ 29,90/mes, link placeholder `https://pay.guru.com/mensal`
- **Trimestral**: R$ 69,90/trimestre, link placeholder `https://pay.guru.com/trimestral`

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Tabela `subscription_plans`, colunas em `profiles`, atualizar funcoes admin |
| Migration SQL (dados) | Inserir 2 planos mockados |
| `supabase/functions/guru-webhook/index.ts` | Tratar eventos de assinatura |
| `src/hooks/useSubscriptionPlans.ts` | Criar: CRUD de planos |
| `src/hooks/usePremium.ts` | Verificacao de expiracao |
| `src/hooks/useAdminData.ts` | Expandir tipos com campos de assinatura |
| `src/components/admin/AdminPlans.tsx` | Criar: gestao de planos |
| `src/components/admin/AdminDashboard.tsx` | Novos KPIs financeiros |
| `src/components/admin/AdminUsers.tsx` | Status assinatura + acoes manuais |
| `src/components/admin/AdminSidebar.tsx` | Item "Planos" |
| `src/pages/Admin.tsx` | Secao "plans" |
| `src/pages/Oferta.tsx` | Modelo mensal + cards de planos |
| `src/components/PremiumLockModal.tsx` | Texto de assinatura |

