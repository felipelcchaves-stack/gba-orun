
# Corrigir "ejife" na Jornada + Explicar Tarefas

## Problema 1: "ejife" aparecendo na Jornada

O campo `user_journey.oracle_result` armazena o `result_key` do banco (ex: "ejife", "oyekun"). O componente `JourneyEntryCard` exibe esse valor cru na linha 39:

```text
{entry.oracle_result}  -->  "ejife"
```

Deveria exibir o `name` da tabela `oracle_configs`:
- "ejife" --> "Ejikorere"
- "oyekun" --> "Apotaku"
- "etagun" --> "Etaiwa"

## Problema 2: Como funcionam as tarefas ("Oracao da Manha", "Fazer Ebo", etc.)

Essas tarefas NAO sao hardcoded. Elas vem da tabela `oracle_task_templates`, configurada pelo admin. O fluxo e:

1. Usuario faz consulta no Oraculo
2. No no de Diagnostico, o sistema filtra os templates pela `condition` (ex: `always`, `ebo_not_done`, `ori_needs_ibori`)
3. Templates que passam no filtro viram tarefas em `journey_tasks`
4. A Jornada exibe essas tarefas agrupadas por periodo (Manha, Noite, Rituais)

Exemplos de templates atuais no banco:
- `condition: always + ire_or_ibi: ire` --> "Oracao da Manha" (aparece sempre que resultado for Ire)
- `condition: always + ire_or_ibi: ibi` --> "Oracao da Noite" (aparece sempre que resultado for Ibi)
- `condition: ebo_not_done` --> "Fazer Ebo de Limpeza"

Esse sistema esta correto e funcional. Tudo configuravel pelo admin.

## Solucao

### Arquivo: `src/components/journey/JourneyEntryCard.tsx`
- Importar o hook `useOracleConfigs`
- Criar um lookup `result_key -> name`
- Na linha 39, trocar `{entry.oracle_result}` por `{oracleNameMap[entry.oracle_result] || entry.oracle_result}`

### Arquivo: `src/pages/Journey.tsx`
- Mesmo tratamento: onde `oracle_result` aparece em contextos de exibicao, traduzir para o nome do banco

Mudanca minima: apenas 1 import + 2 linhas de logica no JourneyEntryCard.

## Detalhes tecnicos

- Hook `useOracleConfigs` ja existe em `src/hooks/useOracleConfig.ts`
- Nenhuma mudanca no banco de dados
- Nenhum hook novo
- O `oracle_result` continua sendo salvo como `result_key` no banco (isso e correto, e a chave de referencia). Apenas a exibicao muda.
