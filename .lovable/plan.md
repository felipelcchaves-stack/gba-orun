

# Vincular multiplos rituais/rezas por tarefa no fluxo

## Situacao atual

Cada tarefa no no de Diagnostico suporta apenas **um** ritual vinculado (`ritual_id`). O mesmo acontece na secao "Vinculos" dos demais blocos do fluxo. Isso limita o conteudo que pode ser associado a cada etapa.

## Solucao

Permitir vincular **multiplos rituais** por tarefa (e por bloco), usando um campo `ritual_ids: string[]` no config JSON do no. A interface mostrara uma lista de rituais vinculados com botao para adicionar mais.

## O que muda para o usuario

**No painel admin (Flow Builder):**
- Cada tarefa do Diagnostico mostrara uma lista de rituais vinculados, com botao "+ Adicionar ritual"
- Cada bloco (Mensagem, Sim/Nao, etc.) tambem podera ter multiplos rituais na secao "Vinculos"
- Rituais ja vinculados aparecem como chips com botao X para remover

**Na tela do aluno (Oraculo):**
- Cada tarefa mostrara multiplos botoes "Ver Ritual: [nome]" se houver mais de um vinculado
- Cada bloco do fluxo tambem mostrara todos os rituais vinculados

## Detalhes tecnicos

### 1. Componente MultiRitualCombobox (novo)

Componente que gerencia uma lista de `ritual_ids`. Mostra os rituais selecionados como chips e um combobox para adicionar mais.

```text
+-------------------------------------+
| [Reza do Ori x] [Iba Orixá x]      |
| [+ Adicionar ritual...]             |
+-------------------------------------+
```

### 2. NodeConfigPanel.tsx

**Secao "Vinculos" (blocos normais):**
- Substituir `RitualCombobox` (singular) por `MultiRitualCombobox`
- Campo muda de `config.ritual_id` para `config.ritual_ids`
- Manter compatibilidade: se existir `ritual_id` antigo, migrar para `ritual_ids: [ritual_id]`

**Secao "Tarefas do Diagnostico":**
- Substituir `RitualCombobox` por `MultiRitualCombobox` em cada tarefa
- Campo muda de `task.ritual_id` para `task.ritual_ids`

### 3. FlowStepRenderer.tsx

**StepHeader:**
- Verificar `config.ritual_ids` (array) alem de `config.ritual_id` (legado)
- Renderizar um `LinkedRitualButton` para cada ritual da lista

**DiagnosisStep:**
- Mostrar multiplos `LinkedRitualButton` por tarefa
- Ao salvar no `journey_tasks`, usar o primeiro `ritual_id` da lista (a tabela so suporta um)
- Manter override de ritual individual por tarefa

### 4. Compatibilidade

- Se `ritual_id` existir e `ritual_ids` nao, tratar como `ritual_ids: [ritual_id]`
- Isso garante que fluxos ja configurados continuem funcionando sem necessidade de reconfigurar

### Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/MultiRitualCombobox.tsx` | Novo componente para selecao multipla de rituais |
| `src/components/admin/flow-builder/NodeConfigPanel.tsx` | Trocar `RitualCombobox` por `MultiRitualCombobox` nos vinculos e tarefas |
| `src/components/oracle/FlowStepRenderer.tsx` | Renderizar multiplos `LinkedRitualButton` no `StepHeader` e `DiagnosisStep` |

Nenhuma alteracao de banco de dados e necessaria, pois os dados sao armazenados como JSON no campo `config` dos nos do fluxo.

