

# Corrigir Card "Receita Este Mes"

## Problema

O card "Receita Este Mes" usa uma RPC que soma o valor cheio do plano anual (R$238 por assinante), resultando em R$761,60. Porem a receita mensal real e a normalizada: anual dividido por 12, mensal inteiro. Essa e a mesma logica que ja calcula os cards "Receita Mensal Prevista" (R$107,10) e "Receita Anual Prevista" (R$1.285,20).

## Solucao

Simplificar o card "Receita Este Mes" para usar o mesmo valor do `monthlyRevenueForecast` que ja existe no frontend (linha 143-162 do AdminDashboard), em vez de chamar a RPC separada. O badge de evolucao % sera calculado comparando com o periodo anterior do historico mensal.

## Alteracoes

### AdminDashboard.tsx

1. **Remover** a importacao e uso do `useMonthlyRevenue`
2. **Alterar** o card "Receita Este Mes" para exibir o valor de `monthlyRevenueForecast` (que ja normaliza anual/12, trimestral/3)
3. **Calcular evolucao %** usando os dois ultimos registros do `useSubscriptionHistory('monthly')` (campo `revenue_estimate`), que ja usa a mesma logica de normalizacao
4. **Remover** o card KPI "Receita Mensal Prevista" dos KPI_CARDS para nao duplicar a informacao (o card grande ja mostra esse valor com o badge de evolucao)

### Resultado visual

O card grande passa a mostrar R$107,10 (mesmo valor da previsao mensal) com o badge de evolucao %, e os KPI cards mantem apenas "Receita Anual Prevista" sem duplicar.

### Detalhes tecnicos

- Buscar os dois ultimos meses de `useSubscriptionHistory('monthly')` para calcular a variacao %
- Se so houver 1 mes, badge mostra "Novo"
- A RPC `admin_get_monthly_revenue` pode ser mantida no banco mas nao sera mais chamada pelo dashboard

