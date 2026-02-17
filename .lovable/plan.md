

# Correção: Fluxos não refletem na jornada (cache agressivo)

## Problema

Dois pontos causam o problema:

1. **`staleTime` de 30 minutos** nos hooks `useFlowNodes` e `useFlowEdges` -- o app acha que os dados são "frescos" por 30 minutos e não busca novos dados do banco
2. **Cache persistido no localStorage** via `PersistQueryClientProvider` -- mesmo fechando e abrindo o app, os dados antigos são restaurados do localStorage antes de qualquer fetch
3. O `onSuccess` do `useSaveFlowCanvas` invalida queries mas não limpa o cache persistido de queries inativas (que ficam salvas no localStorage)

## Solução

Modificar apenas 1 arquivo: `src/hooks/useOracleFlows.ts`

### Mudança 1: Remover staleTime de 30 minutos

Remover `staleTime: 1000 * 60 * 30` de `useFlowNodes` e `useFlowEdges`. Isso faz eles usarem o padrão global de 5 minutos, que é suficiente para performance sem prejudicar a atualização.

### Mudança 2: Forçar limpeza completa do cache ao salvar

No `onSuccess` do `useSaveFlowCanvas`:
- Usar `refetchType: "all"` para invalidar queries ativas E inativas
- Chamar `removeQueries` com `type: "inactive"` para limpar o cache persistido no localStorage

Isso garante que ao salvar um fluxo no admin, qualquer outra aba ou navegação futura vai buscar dados frescos do banco.

## Detalhes técnicos

**Arquivo:** `src/hooks/useOracleFlows.ts`

Linha 119 -- remover `staleTime: 1000 * 60 * 30` de `useFlowNodes`
Linha 134 -- remover `staleTime: 1000 * 60 * 30` de `useFlowEdges`
Linhas 208-212 -- atualizar `onSuccess` do `useSaveFlowCanvas`:

```text
Antes:
  onSuccess: (_, vars) => {
    qc.invalidateQueries({ queryKey: ["oracle_flow_nodes", vars.flowId] });
    qc.invalidateQueries({ queryKey: ["oracle_flow_edges", vars.flowId] });
    qc.invalidateQueries({ queryKey: ["oracle_flows"] });
  }

Depois:
  onSuccess: (_, vars) => {
    qc.invalidateQueries({ queryKey: ["oracle_flow_nodes", vars.flowId], refetchType: "all" });
    qc.invalidateQueries({ queryKey: ["oracle_flow_edges", vars.flowId], refetchType: "all" });
    qc.invalidateQueries({ queryKey: ["oracle_flows"], refetchType: "all" });
    qc.removeQueries({ queryKey: ["oracle_flow_nodes"], type: "inactive" });
    qc.removeQueries({ queryKey: ["oracle_flow_edges"], type: "inactive" });
  }
```

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useOracleFlows.ts` | Remover staleTime de 30min dos nodes/edges + limpar cache persistido ao salvar |

**Total: 1 arquivo, 3 pontos de edição**

