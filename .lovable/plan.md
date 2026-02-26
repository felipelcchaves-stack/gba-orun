

# Correcao do Calculo de Receita no Dashboard Admin

## Problema Identificado

O card "Previsao Receita/Mes" soma o valor bruto de cada plano, independente do periodo. Atualmente existem dois planos:
- **Mensal**: R$ 27,00
- **Anual**: R$ 270,00

Quando um assinante tem o plano Anual, o sistema soma R$ 270 inteiro como se fosse receita mensal, em vez de dividir por 12 (R$ 22,50/mes).

## Solucao

### 1. Normalizar o calculo de receita mensal

Dividir o valor do plano pelo numero de meses do periodo:
- `monthly` -> divide por 1
- `quarterly` -> divide por 3
- `yearly` -> divide por 12

Isso fara o card "Previsao Receita/Mes" mostrar o valor correto que efetivamente entra por mes.

### 2. Adicionar card "Previsao Receita/Ano"

Um novo KPI card mostrando a receita anual projetada (receita mensal normalizada x 12), dando uma visao de planejamento anual.

## Detalhes Tecnicos

**Arquivo**: `src/components/admin/AdminDashboard.tsx`

**Calculo atual** (linhas 136-152):
```typescript
if (plan) total += Number(plan.price); // soma bruto, sem considerar periodo
```

**Calculo corrigido**:
```typescript
const PERIOD_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, yearly: 12 };
// ...
if (plan) {
  const months = PERIOD_MONTHS[plan.billing_period] || 1;
  total += Number(plan.price) / months;
}
```

**Novos KPI cards**:
- "Receita Mensal Prevista" -> soma normalizada para mes
- "Receita Anual Prevista" -> receita mensal x 12

Nenhuma alteracao no banco de dados e necessaria.

