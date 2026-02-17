

# Corrigir bug de perda de dados no Flow Builder

## Problema identificado

O salvamento do fluxo tem uma **race condition** que causa perda total dos dados:

1. `handleSave` chama `saveCanvas.mutateAsync()` que DELETA todos os nodes/edges e re-insere com novos IDs
2. Apos o save, `setLoaded(false)` dispara o `useEffect` de carregamento
3. O `useEffect` roda ANTES do refetch do React Query completar, usando dados STALE do cache (IDs antigos que ja nao existem)
4. O canvas fica com nodes de IDs invalidos
5. No proximo save, os edges referenciam IDs inexistentes e tudo se perde

Alem disso, o campo `_tempId` esta sendo salvo permanentemente no config dos nodes no banco de dados, poluindo os dados.

## Solucao

### Estrategia: Nao recarregar do banco apos salvar

Em vez de fazer `setLoaded(false)` e depender do refetch (que causa a race condition), vamos **atualizar o estado local diretamente** com os novos IDs retornados pelo banco apos o insert.

### Arquivo 1: `src/hooks/useOracleFlows.ts`

Modificar `useSaveFlowCanvas` para:
- Retornar os nodes e edges inseridos (com novos IDs)
- Limpar o `_tempId` do config antes de salvar no banco
- Retornar um objeto `{ insertedNodes, nodeIdMap }` para o caller usar

### Arquivo 2: `src/components/admin/flow-builder/FlowBuilder.tsx`

Modificar `handleSave` para:
- NAO fazer `setLoaded(false)` apos salvar
- Usar o resultado do save para atualizar os IDs locais dos nodes e edges
- Manter o canvas intacto com os dados corretos

## Detalhes tecnicos

### Mudanca em `useSaveFlowCanvas` (useOracleFlows.ts)

```text
Antes:
- Insere nodes com _tempId no config
- Nao retorna nada (void)

Depois:
- Remove _tempId do config antes de inserir
- Retorna { insertedNodes, nodeIdMap } 
- nodeIdMap: Map<tempId, newDbId>
```

### Mudanca em `handleSave` (FlowBuilder.tsx)

```text
Antes:
await saveCanvas.mutateAsync(...)
setLoaded(false)  // <-- causa a race condition

Depois:
const result = await saveCanvas.mutateAsync(...)
// Atualiza IDs dos nodes locais usando o nodeIdMap
// Atualiza source/target dos edges locais
// NÃO faz setLoaded(false)
```

### Fluxo corrigido

1. Usuario adiciona/edita nodes no canvas
2. Clica "Salvar"
3. Sistema deleta nodes/edges antigos do banco
4. Sistema insere novos nodes e recebe novos IDs
5. Sistema insere edges com IDs mapeados
6. Sistema atualiza o estado LOCAL (React) com os novos IDs
7. Canvas permanece intacto, IDs sincronizados com o banco

### Arquivos modificados: 2

1. `src/hooks/useOracleFlows.ts` - retornar dados do save e limpar _tempId
2. `src/components/admin/flow-builder/FlowBuilder.tsx` - usar resultado do save para atualizar estado local

