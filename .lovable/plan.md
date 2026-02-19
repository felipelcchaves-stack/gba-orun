

# Dashboard Profissional com Graficos de Evolucao

## Objetivo

Transformar o dashboard admin de um painel apenas com cards de KPI e graficos de pizza em um painel profissional com graficos de linha mostrando a evolucao temporal de assinantes, cancelamentos, inadimplencia e cortesia.

## O que muda

### 1. Nova funcao SQL: `admin_get_subscription_history`

Uma funcao no banco que agrupa os perfis por mes e retorna uma serie temporal com:
- `month` (data no formato YYYY-MM-01)
- `new_users` (novos cadastros no mes)
- `active_subscribers` (assinantes ativos pagantes no mes)
- `courtesy_users` (usuarios cortesia no mes)
- `overdue_users` (inadimplentes no mes)
- `cancelled_users` (cancelados no mes)
- `revenue_estimate` (receita estimada: ativos x preco do plano)

A funcao usa as colunas `created_at`, `subscription_status`, `subscription_started_at`, `subscription_expires_at` e `is_courtesy` que ja existem na tabela `profiles`, cruzando com `subscription_plans` para calcular receita.

### 2. Novo hook: `useSubscriptionHistory`

Hook React Query que chama a funcao RPC acima e retorna os dados formatados para os graficos.

### 3. Reorganizacao do AdminDashboard

O dashboard sera reorganizado em secoes visuais claras:

**Secao 1 - KPI Cards (mantida, sem alteracoes)**
Os cards ja existentes continuam no topo.

**Secao 2 - Grafico de Linha: Evolucao de Assinantes**
- Eixo X: meses
- Linhas: Assinantes Ativos (verde), Cortesia (roxo), Inadimplentes (vermelho), Cancelados (amarelo)
- Tooltip com valores detalhados

**Secao 3 - Grafico de Area: Previsao de Receita Mensal**
- Eixo X: meses
- Area preenchida mostrando a evolucao da receita estimada
- Cor dourada (accent)

**Secao 4 - Grafico de Linha: Crescimento de Usuarios**
- Eixo X: meses
- Linha mostrando novos cadastros por mes

**Secao 5 - Graficos existentes (mantidos)**
- Distribuicao por Genero (pizza)
- Distribuicao por Religiao (pizza)
- Status em Ifa (pizza)
- Lacunas de Conhecimento (barras)
- Tabela de Ultimos Usuarios

### 4. Arquivos alterados

```text
Novo:   supabase/migrations/XXXX_subscription_history_fn.sql  (funcao RPC)
Editar: src/hooks/useAdminData.ts                              (novo hook)
Editar: src/components/admin/AdminDashboard.tsx                 (novos graficos)
```

## Detalhes Tecnicos

### Funcao SQL

A funcao gera uma serie de meses (do primeiro cadastro ate hoje) e para cada mes faz contagem dos perfis usando os campos existentes. Logica:

- **new_users**: `profiles.created_at` dentro do mes
- **active_subscribers**: `subscription_status = 'active' AND NOT is_courtesy` com `subscription_started_at <= fim_do_mes`
- **courtesy_users**: `is_courtesy = true` com `created_at <= fim_do_mes`
- **overdue_users**: `subscription_status = 'overdue'` no periodo
- **cancelled_users**: `subscription_status = 'cancelled'` no periodo
- **revenue_estimate**: soma dos precos dos planos dos ativos pagantes

A funcao e protegida pela mesma verificacao `has_role(auth.uid(), 'admin')`.

### Componente de Graficos

Usa Recharts (ja instalado) com `LineChart`, `AreaChart`, `Line`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`.

Cores das linhas:
- Ativos Pagantes: verde (#22c55e)
- Cortesia: roxo (#8b5cf6)
- Inadimplentes: vermelho (#ef4444)
- Cancelados: amarelo (#eab308)
- Receita: dourado (#FFD700)
- Novos Usuarios: azul (#3b82f6)

## Resumo

- 1 migracao SQL (funcao RPC para serie temporal)
- 1 hook novo no useAdminData
- 1 arquivo editado (AdminDashboard com 3 novos graficos de linha/area)
- 0 novas dependencias (Recharts ja instalado)

