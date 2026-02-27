
# Receita Liquida: Campo "Valor Liquido" nos Planos de Assinatura

## O que muda para voce

Na tela **Admin > Planos**, cada plano passara a ter um campo adicional chamado **"Valor Liquido (quanto voce recebe)"**. Voce preenche com o valor que efetivamente cai na sua conta apos descontos do gateway, impostos e rateio de coproducao.

Exemplo:
- Plano Mensal R$ 27,00 -> Valor Liquido: **R$ 26,50**
- Plano Anual R$ 270,00 -> Valor Liquido: **R$ 265,00**

Os cards **Receita Mensal Prevista** e **Receita Anual Prevista** no dashboard, bem como o grafico de evolucao de receita, passarao a usar o valor liquido. Se o campo nao estiver preenchido, o sistema usa o preco bruto como fallback.

---

## Detalhes Tecnicos

### 1. Migracao de banco de dados
- Adicionar coluna `net_price NUMERIC DEFAULT NULL` na tabela `subscription_plans`
- Atualizar os planos existentes com os valores informados (Mensal: 26.50, Anual: 265.00) via ferramenta de insercao
- Atualizar a funcao `admin_get_subscription_history` para usar `COALESCE(sp.net_price, sp.price)` no calculo de `revenue_estimate`

### 2. Frontend - AdminPlans.tsx
- Adicionar campo "Valor Liquido" no formulario de criacao/edicao de planos
- Exibir o valor liquido na listagem de planos (ex: "R$ 27,00 / Mensal | Liquido: R$ 26,50")

### 3. Frontend - AdminDashboard.tsx (linha ~147)
- Alterar o calculo de `monthlyRevenueForecast` para usar `net_price` quando disponivel:
```text
total += Number(plan.net_price ?? plan.price) / months;
```

### 4. Hook useSubscriptionPlans.ts
- Adicionar `net_price: number | null` ao tipo `SubscriptionPlan`
- Incluir `net_price` nas operacoes de criacao e edicao
