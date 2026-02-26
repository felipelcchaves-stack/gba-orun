

# Correção: Receita Prevista atualizar ao cancelar + normalizar no histórico

## Situação Atual

O cálculo dos **cards KPI** (Receita Mensal/Anual) já está correto após a última correção — só soma assinantes com `subscription_status = 'active'` e normaliza pelo período. Quando você cancela um aluno, ele sai do cálculo automaticamente ao recarregar a página.

Porém, existem dois problemas remanescentes:

### Problema 1: Gráfico de "Previsão de Receita Mensal" (evolução histórica)
A função de banco de dados `admin_get_subscription_history` que alimenta o gráfico de área "Previsão de Receita Mensal" ainda soma o valor bruto do plano (`sum(sp.price)`) sem dividir pelo período de cobrança. Ou seja, plano anual de R$ 270 aparece como R$ 270/mês no gráfico, em vez de R$ 22,50.

### Problema 2: Dados não atualizam em tempo real
Após cancelar um usuário na aba "Usuários", o dashboard não refaz a consulta automaticamente — o admin precisa sair e voltar para ver o card atualizado.

## Solução

### 1. Corrigir a função de banco de dados
Atualizar a RPC `admin_get_subscription_history` para normalizar a receita pelo período de cobrança:

```sql
-- Antes: sum(sp.price)
-- Depois: sum(sp.price / CASE sp.billing_period WHEN 'yearly' THEN 12 WHEN 'quarterly' THEN 3 ELSE 1 END)
```

### 2. Invalidar cache do dashboard ao cancelar
No componente `AdminUsers`, após salvar edições (incluindo mudança de status para "cancelled"), invalidar também as queries do dashboard (`admin-stats`, `admin-profiles`, `subscription-history`) para que os cards atualizem imediatamente.

## Detalhes Técnicos

**Arquivo 1**: Migração SQL para atualizar `admin_get_subscription_history`
- Substituir `sum(sp.price)` por `sum(sp.price / CASE sp.billing_period WHEN 'yearly' THEN 12 WHEN 'quarterly' THEN 3 ELSE 1 END)`

**Arquivo 2**: `src/components/admin/AdminUsers.tsx`
- Na função `handleSaveEdit` (linha 257), adicionar invalidação das queries: `admin-stats` e `subscription-history`
- Na função `togglePremium` (linha 180), adicionar as mesmas invalidações
- Na função `handleDelete` (linha 203), adicionar as mesmas invalidações
