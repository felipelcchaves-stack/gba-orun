

# Card de Receita Mensal com Evolucao %

## O que sera criado
Um novo card KPI no dashboard admin mostrando:
- **Valor total em R$** que voce esta recebendo neste mes (soma de todos os planos ativos, independente se mensal ou anual)
- **Badge de evolucao %** comparando com o mes anterior (seta verde para cima se cresceu, vermelha para baixo se caiu)

## Como funciona

O card usa os dados de assinantes ativos e seus planos para calcular quanto entra por mes. Planos anuais sao divididos por 12, trimestrais por 3, para normalizar tudo em valor mensal. A comparacao e feita pegando o mesmo calculo do mes anterior.

## Detalhes tecnicos

### 1. Nova RPC no banco de dados: `admin_get_revenue_comparison`

Funcao SQL que retorna duas linhas:
- Receita do mes atual (baseada nos assinantes ativos hoje)
- Receita do mes anterior (baseada nos assinantes que estavam ativos no ultimo dia do mes passado, usando o historico ja existente)

A logica reutiliza o mesmo calculo de `net_price` ja usado no dashboard, somando o valor liquido de cada plano normalizado para mensal.

### 2. Alteracao no frontend: `AdminDashboard.tsx`

- Novo hook `useMonthlyRevenueComparison` em `useAdminData.ts`
- Novo card com icone DollarSign mostrando o valor em R$
- Badge ao lado com a % de variacao e cor condicional (verde/vermelho)
- Posicionado logo apos os cards de assinantes ativos

### Visual esperado

```text
+----------------------------------+
| R$ 1.250,00                      |
| Receita Este Mes    [+15.3% ^]   |
+----------------------------------+
```

Se nao houver dados do mes anterior, o badge mostra "Novo" em vez de porcentagem.

