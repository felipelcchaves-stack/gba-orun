
# Correção: Esconder tarefas de oração quando desabilitado

## Problema

Quando `show_daily_prayers` está `false`, o código mostra **todas** as tarefas juntas (incluindo "Oração da Manhã", "Oração da Noite", etc.), porque passa a lista completa `tasks` ao invés de filtrar as orações.

## Solução

**Arquivo:** `src/components/journey/JourneyEntryCard.tsx` (linha 148)

Trocar `tasks` por `otherTasks` no bloco de quando orações estão desabilitadas. Assim, as tarefas de oração ficam completamente ocultas.

Também ajustar o cálculo de progresso para considerar apenas as tarefas visíveis quando orações estão desabilitadas, para que a barra de progresso reflita corretamente o estado.

### Detalhes técnicos

- Linha 148: trocar `tasks` por `otherTasks`
- Ajustar `completedCount` e `totalCount` para usar `otherTasks` quando `showPrayerGroups` é `false`
- O `allDone` também precisa considerar apenas tarefas visíveis
