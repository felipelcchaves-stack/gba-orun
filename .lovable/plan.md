
# Corrigir dados desatualizados ao voltar para Jornada

## Problema

Quando o diagnostico salva e redireciona para `/jornada`, a rotina recem-criada nao aparece. O usuario precisa fazer refresh manual. Isso acontece porque:

1. O hook `useAddJourneyEntry` invalida a query key `["journey"]`
2. O hook `useCreateJourneyTasks` invalida `["journey-tasks"]`
3. Porem, a pagina Jornada usa as query keys `["journey-month", ...]` e `["journey-month-tasks", ...]`
4. Como as keys nao batem, o React Query nao recarrega os dados

## Solucao

Corrigir as invalidacoes no `src/hooks/useJourney.ts` para incluir as query keys corretas que a pagina de Jornada usa.

## Detalhes Tecnicos

### Arquivo: `src/hooks/useJourney.ts`

1. No `useAddJourneyEntry` (onSuccess): adicionar invalidacao de `["journey-month"]` e `["journey-month-tasks"]`
2. No `useCompleteJourney` (onSuccess): adicionar invalidacao de `["journey-month"]`
3. No `useCreateJourneyTasks` (onSuccess): adicionar invalidacao de `["journey-month-tasks"]`
4. No `useCompleteTask` (onSuccess): adicionar invalidacao de `["journey-month-tasks"]`

Cada `onSuccess` passara a invalidar tanto a key antiga (para compatibilidade) quanto as keys usadas pela pagina de Jornada. Isso garante que ao navegar para `/jornada`, o React Query busque os dados frescos automaticamente.

Mudancas em um unico arquivo, 4 blocos de `onSuccess` ajustados.
