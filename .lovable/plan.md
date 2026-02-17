
# Correção: Rituais não atualizam após edição no Admin

## Problema

O app usa `PersistQueryClientProvider` que salva o cache de queries no localStorage com validade de 24 horas. O hook `useRituals` tem `staleTime: 30 minutos`, ou seja, mesmo após salvar um ritual no admin e o `invalidateQueries` funcionar naquela página, ao navegar para outra rota o cache persistido no localStorage serve dados antigos sem buscar novamente no banco.

Mesmo após refresh completo do navegador, o localStorage ainda contém os dados velhos que são restaurados antes de qualquer fetch.

## Solução

### 1. Reduzir staleTime do useRituals

Remover o `staleTime: 30 minutos` do `useRituals` para usar o padrão global de 5 minutos. Isso garante que dados mais frescos serão buscados com mais frequência.

**Arquivo:** `src/hooks/useRituals.ts`
- Remover a linha `staleTime: 1000 * 60 * 30`

### 2. Forçar invalidação completa após mutações

Nas mutations de `useUpdateRitual`, `useCreateRitual` e `useDeleteRitual`, usar `refetchType: 'all'` para invalidar inclusive queries inativas (que existem no cache persistido mas não estão montadas na tela atual).

Também invalidar a query individual `["ritual", id]` no update para cobrir a página de leitura.

**Arquivo:** `src/hooks/useRituals.ts`
- Alterar `onSuccess` para: `qc.invalidateQueries({ queryKey: ["rituals"], refetchType: "all" })`
- No `useUpdateRitual`, invalidar também: `qc.invalidateQueries({ queryKey: ["ritual"], refetchType: "all" })`

### 3. Remover cache persistido de rituais ao salvar

Após qualquer mutação de ritual, remover explicitamente o cache persistido para garantir que um refresh da página busque dados frescos.

**Arquivo:** `src/hooks/useRituals.ts`
- No `onSuccess` de cada mutação, chamar `qc.removeQueries({ queryKey: ["rituals"], type: "inactive" })` para limpar queries inativas do cache

---

## Resumo

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useRituals.ts` | Remover staleTime de 30min, adicionar refetchType: "all" e removeQueries de inativas nas 3 mutações |

**Total: 1 arquivo modificado**
