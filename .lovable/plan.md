
# Corrigir contagem do TodayHeroCard

## Problema

O card "Rotina de Hoje" no topo da pagina Jornada mostra 88% (7/8) porque o calculo em `Journey.tsx` conta **todas** as tarefas, incluindo as de oracao da manha/noite que foram desabilitadas. O filtro so foi aplicado dentro do `JourneyEntryCard`, mas nao no resumo geral.

## Solucao

**Arquivo:** `src/pages/Journey.tsx`

1. Importar `useAppSettings` no topo do componente
2. No `dayMap` (linhas 49-54), filtrar as tarefas de oracao quando `show_daily_prayers` nao estiver habilitado, excluindo tarefas com `task_type` em `["oracao_manha", "oracao_ori", "oracao_noite", "oracao_iyami"]`
3. Isso corrige automaticamente `todayTasksDone`, `todayTasksTotal` e tambem o `totalTasksDone` mensal

### Detalhe tecnico

Nas linhas 49-54, antes de incrementar `tasksTotal` e `tasksDone`, verificar se o `task_type` da tarefa nao e de oracao (quando desabilitado). Usar a mesma logica de filtragem ja aplicada no `JourneyEntryCard`:

```
const prayerTypes = ["oracao_manha", "oracao_ori", "oracao_noite", "oracao_iyami"];
const showPrayers = settings?.show_daily_prayers === "true";

// No loop de tasks do dayMap:
if (!showPrayers && prayerTypes.includes(t.task_type)) continue;
```

Tambem aplicar o mesmo filtro na linha 74 (`totalTasksDone`) para manter consistencia nas estatisticas mensais.
