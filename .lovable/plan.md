

# Corrigir vinculacao de multiplos rituais que nao persiste

## Problema encontrado

O bug esta na linha 324 do `NodeConfigPanel.tsx`. Quando o `MultiRitualCombobox` muda, o codigo executa duas chamadas consecutivas a `updateTask`:

```tsx
onChange={(ids) => {
  updateTask(i, "ritual_ids", ids);   // <-- seta ritual_ids
  updateTask(i, "ritual_id", null);   // <-- sobrescreve tudo com tasks ANTIGO (sem ritual_ids)
}}
```

A funcao `updateTask` le a variavel `tasks` do closure (que e a versao antiga). A segunda chamada recria o array de tasks a partir da versao sem `ritual_ids`, efetivamente apagando a alteracao feita pela primeira chamada.

## Solucao

Combinar ambas as alteracoes em uma unica operacao dentro do `updateTask`, ou alterar a funcao para aceitar multiplos campos de uma vez.

A abordagem mais simples: mudar o `onChange` para fazer uma unica chamada que seta ambos os campos ao mesmo tempo.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/flow-builder/NodeConfigPanel.tsx` | Corrigir o `onChange` do `MultiRitualCombobox` nas tarefas do diagnostico (linha 324) para combinar `ritual_ids` e `ritual_id: null` em uma unica chamada a `updateTask`. Criar uma variante `updateTaskMulti` que aceita um objeto de campos, ou usar inline spread. |

## Detalhe tecnico

**Opcao escolhida: criar funcao `updateTaskFields`**

```tsx
const updateTaskFields = (i: number, fields: Record<string, any>) => {
  const updated = [...tasks];
  updated[i] = { ...updated[i], ...fields };
  updateField("tasks", updated);
};
```

**Linha 324 atualizada (diagnostico):**

```tsx
<MultiRitualCombobox
  value={task.ritual_ids || (task.ritual_id ? [task.ritual_id] : [])}
  onChange={(ids) => updateTaskFields(i, { ritual_ids: ids, ritual_id: null })}
  placeholder="Adicionar ritual..."
/>
```

Isso garante que `ritual_ids` e a limpeza de `ritual_id` acontecam na mesma operacao, sem que uma sobrescreva a outra.

