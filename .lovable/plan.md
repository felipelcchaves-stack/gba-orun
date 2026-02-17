

# Correcao: Auto-Save + Fluxos nao Refletindo na Jornada

## Problemas Identificados

### Problema 1: Auto-save interfere nas edicoes
O auto-save grava no localStorage a cada 1 segundo de inatividade e tenta salvar no banco a cada 60 segundos. Isso causa dois problemas:
- O salvamento automatico no banco pode sobrescrever mudancas em andamento ou disparar durante operacoes delicadas
- O snapshot "limpo" e capturado uma unica vez no load, mas apos o save manual os IDs dos nodes mudam (de `temp_xxx` para UUIDs reais), invalidando o snapshot e fazendo o sistema achar que tudo mudou de novo

### Problema 2: Rascunho aparece mesmo apos salvar
Quando o usuario clica "Salvar Fluxo", o `markClean()` remove o rascunho do localStorage. Porem, o debounce de 1 segundo continua rodando e pode regravar o rascunho imediatamente apos o `markClean()`, pois os IDs mudaram durante o save (temp -> UUID) e o snapshot fica desatualizado.

### Problema 3: Fluxos salvos nao aparecem na jornada
O `useCreateJourneyTasks` nao inclui `offering_id` no tipo TypeScript. Alem disso, o cache dos fluxos no lado do usuario tem `staleTime` de 30 minutos, entao mudancas feitas no admin demoram para aparecer. Tambem existem caminhos no fluxo que nao chegam ao no de Diagnostico (dead ends).

---

## Solucao

### 1. Desativar auto-save automatico no banco (maior impacto)

Remover o intervalo de 60 segundos que salva automaticamente. Manter apenas:
- Deteccao de "dirty" (indicador visual amarelo)
- Protecao `beforeunload` (aviso ao fechar aba com mudancas)
- Rascunho local como seguranca (mas com logica corrigida)

O usuario continua no controle total: salva apenas quando clica "Salvar Fluxo".

**Arquivo: `src/hooks/useFlowAutoSave.ts`**
- Remover o `setInterval` de auto-save (linhas 103-115)
- Corrigir o snapshot limpo: atualizar `cleanSnapshotRef` dentro do `markClean` usando os nodes/edges atuais (ja faz, mas precisa cancelar o debounce pendente)
- No `markClean`, cancelar qualquer debounce pendente para evitar regravacao do rascunho
- Aumentar debounce de 1s para 3s para reduzir escritas no localStorage

### 2. Corrigir rascunho fantasma apos salvar

**Arquivo: `src/hooks/useFlowAutoSave.ts`**
- Adicionar ref para controlar "cooldown" apos markClean
- Apos `markClean`, ignorar a proxima deteccao de dirty por 5 segundos (tempo para os IDs se estabilizarem)

### 3. Corrigir `offering_id` no hook de tarefas

**Arquivo: `src/hooks/useJourney.ts`**
- Adicionar `offering_id?: string` ao tipo do parametro de `useCreateJourneyTasks`

### 4. Invalidar cache de fluxos apos salvar no admin

**Arquivo: `src/hooks/useOracleFlows.ts`**
- No `onSuccess` do `useSaveFlowCanvas`, invalidar tambem `["oracle_flows"]`

### 5. Validacao de dead ends antes de salvar

**Arquivo: `src/components/admin/flow-builder/FlowBuilder.tsx`**
- Antes de salvar, verificar se existem nos sem edges de saida (exceto `diagnosis`)
- Mostrar toast de aviso listando nos desconectados
- Permitir salvar mesmo assim, mas alertar o admin

---

## Detalhes tecnicos

### useFlowAutoSave.ts - Mudancas principais

```text
Antes:
- Debounce 1s grava rascunho no localStorage
- Intervalo 60s salva no banco automaticamente
- markClean atualiza snapshot mas debounce pode regravar

Depois:
- Debounce 3s grava rascunho no localStorage
- SEM auto-save no banco (removido)
- markClean cancela debounce pendente + cooldown de 5s
```

### useJourney.ts - Tipo corrigido

Adicionar `offering_id` ao array de tasks:
```typescript
tasks: Array<{
  journey_id: string;
  task_type: string;
  task_title: string;
  ritual_id?: string;
  offering_id?: string;  // <-- novo
  guidance_message?: string;
  guidance_audio_url?: string | null;
}>
```

### FlowBuilder.tsx - Validacao de dead ends

Funcao `findDeadEndNodes()`:
- Percorre todos os nodes
- Para cada node que NAO e `diagnosis`, verifica se existe pelo menos uma edge com `source === node.id`
- Retorna lista de nodes sem saida
- Exibe toast amarelo: "Atencao: os nos [X, Y] nao tem conexao de saida"

---

## Resumo de arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useFlowAutoSave.ts` | Remover auto-save no banco, corrigir rascunho fantasma, aumentar debounce |
| `src/hooks/useJourney.ts` | Adicionar `offering_id` ao tipo |
| `src/hooks/useOracleFlows.ts` | Invalidar cache de fluxos apos salvar canvas |
| `src/components/admin/flow-builder/FlowBuilder.tsx` | Validacao de dead ends antes de salvar |

**Total: 4 arquivos modificados, 0 novos**

