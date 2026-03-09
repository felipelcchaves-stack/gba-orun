

# Corrigir Cards de Receita no Dashboard

## O que estava errado

Na ultima alteracao, o card KPI "Receita Mensal Prevista" foi removido e o card grande "Receita Este Mes" passou a mostrar apenas o valor mensal normalizado (R$ 107,10). Voce quer os tres cards distintos.

## O que vai ficar

1. **Card grande "Receita Este Mes"** = Receita Mensal Prevista + Receita Anual Prevista (soma dos dois, ex: R$ 107,10 + R$ 1.285,20 = R$ 1.392,30)
2. **Card KPI "Receita Mensal Prevista"** = valor normalizado mensal (R$ 107,10) -- sera restaurado
3. **Card KPI "Receita Anual Prevista"** = valor anual (R$ 1.285,20) -- ja existe

## Alteracoes tecnicas

### AdminDashboard.tsx

1. **Restaurar** o card KPI "Receita Mensal Prevista" no array `KPI_CARDS` (linha que foi removida no ultimo diff)
2. **Alterar** o card grande "Receita Este Mes" para exibir `monthlyRevenueForecast + yearlyRevenueForecast` em vez de apenas `monthlyRevenueForecast`
3. **Ajustar** o calculo de evolucao % para comparar esse somatorio com o periodo anterior

Nenhuma alteracao de banco de dados necessaria.

