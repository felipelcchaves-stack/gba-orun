

# Granularidade dos Graficos do Dashboard (Diario / Mensal / Anual)

## Problema
Todos os graficos de evolucao (Assinantes, Receita, Crescimento de Usuarios) usam dados mensais fixos da RPC `admin_get_subscription_history`. No inicio do projeto, com poucos meses de dados, os graficos ficam com poucos pontos e parecem vazios.

## Solucao
Adicionar um seletor de granularidade (Diario / Mensal / Anual) acima dos graficos, com **Diario como padrao**. Os tres graficos compartilham o mesmo filtro.

## Alteracoes

### 1. Nova RPC no banco de dados (migracao SQL)

Criar `admin_get_subscription_history_v2(p_granularity text)` que aceita `'daily'`, `'monthly'` ou `'yearly'`.

- Para **diario**: gera series dos ultimos 90 dias (para nao sobrecarregar), agrupando por dia
- Para **mensal**: mesmo comportamento atual, desde o primeiro usuario
- Para **anual**: agrupa por ano

A estrutura de retorno e a mesma (month, new_users, active_subscribers, courtesy_users, overdue_users, cancelled_users, revenue_estimate), so muda a granularidade do campo `month`.

### 2. Atualizar hook useSubscriptionHistory

- Aceitar parametro `granularity: 'daily' | 'monthly' | 'yearly'`
- Chamar a nova RPC passando o parametro
- Incluir granularity na queryKey para cache separado

### 3. Atualizar AdminDashboard.tsx

- Adicionar estado `granularity` com valor padrao `'daily'`
- Renderizar um Select com 3 opcoes (Diario, Mensal, Anual) acima dos graficos
- Ajustar a funcao `formatMonth` para formatar de acordo com a granularidade:
  - Diario: `dd/MM` (ex: 27/02)
  - Mensal: `MMM/yy` (ex: Fev/26)
  - Anual: `yyyy` (ex: 2026)
- Passar `granularity` para o hook

### Detalhes tecnicos

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Nova RPC `admin_get_subscription_history_v2(p_granularity text)` |
| `src/hooks/useAdminData.ts` | Atualizar `useSubscriptionHistory` para aceitar e passar granularidade |
| `src/components/admin/AdminDashboard.tsx` | Adicionar seletor de granularidade + formatacao dinamica dos eixos |

### Logica da RPC (resumo)

```text
p_granularity = 'daily'   -> generate_series(now() - 90 days, now(), '1 day')
p_granularity = 'monthly' -> generate_series(primeiro_usuario, now(), '1 month')
p_granularity = 'yearly'  -> generate_series(primeiro_usuario, now(), '1 year')
```

Para cada ponto na serie, as subqueries de contagem usam `date_trunc(p_granularity, ...)` em vez de `date_trunc('month', ...)` fixo.

### Resultado esperado
- Padrao: grafico diario mostrando os ultimos 90 dias com pontos diarios
- O admin pode trocar para mensal ou anual a qualquer momento
- Graficos ficam mais preenchidos e uteis desde o primeiro dia

