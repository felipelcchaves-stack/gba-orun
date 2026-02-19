
# Exibir todas as informacoes do diagnostico na Minha Jornada

## Problema

Quando voce preenche campos de texto livre durante o fluxo (ex: "carne com sangue", "1 Galo", "Elas precisam de um Ipese"), essas respostas aparecem no Resumo do Diagnostico, mas ao salvar e ir para Minha Jornada, so aparecem as tarefas pre-configuradas ("Oracao da Manha", "Fazer Ebo"). As respostas de texto livre sao salvas como JSON bruto no campo `context` da tabela `user_journey`, mas nunca sao convertidas em tarefas visiveis.

## Solucao

Ao salvar o diagnostico, alem das tarefas pre-configuradas, o sistema vai automaticamente criar tarefas extras para cada resposta de texto livre que o usuario preencheu durante o fluxo. Assim, na Minha Jornada aparecera tudo que foi orientado.

## Detalhes Tecnicos

### Arquivo: `src/components/oracle/FlowStepRenderer.tsx` (funcao `handleSave` no `DiagnosisStep`)

Apos montar as `taskRows` das tarefas pre-configuradas (linha ~650), adicionar logica para:

1. Percorrer todas as `answers` e identificar quais vieram de nos do tipo `message` com `enable_text_input: true` ou do tipo `open_question`
2. Filtrar apenas os nos que tem `show_in_diagnosis: true` ou que sao text-input (para nao criar tarefa de respostas irrelevantes)
3. Para cada uma dessas respostas, criar uma `journey_task` adicional com:
   - `task_title`: O label/question do no (ex: "Bom, como elas querem Ipese, precisamos apurar!")
   - `task_type`: "cuidado_espiritual" (novo tipo generico para essas tarefas)
   - `guidance_message`: A resposta do usuario (ex: "carne com sangue")
   - Sem `ritual_id` ou `offering_id` (sao orientacoes livres)

```text
// Pseudocodigo da logica a adicionar:
const freeTextTasks = Object.entries(answers)
  .filter(([key, value]) => {
    const srcNode = allNodes.find(n => 
      n.id === key || (n.config as any)?.variable_name === key
    );
    if (!srcNode) return false;
    // Incluir message com texto livre e open_question
    const isTextInput = srcNode.node_type === "message" && (srcNode.config as any)?.enable_text_input;
    const isOpenQuestion = srcNode.node_type === "open_question";
    return (isTextInput || isOpenQuestion) && value.trim();
  })
  .map(([key, value]) => {
    const srcNode = allNodes.find(n => 
      n.id === key || (n.config as any)?.variable_name === key
    );
    return {
      journey_id: entry.id,
      task_type: "cuidado_espiritual",
      task_title: srcNode?.config?.question || srcNode?.label || "Orientacao",
      guidance_message: value,
    };
  });

// Combinar com as taskRows existentes
const allTaskRows = [...taskRows, ...freeTextTasks];
await createTasks.mutateAsync(allTaskRows);
```

### Arquivo: `src/components/journey/JourneyEntryCard.tsx`

Atualizar a logica de agrupamento para incluir o novo tipo `cuidado_espiritual`:

- Adicionar `cuidado_espiritual` ao grupo `otherTasks` (ja cai la automaticamente por nao estar em morningTypes nem nightTypes)
- A tarefa ja vai aparecer com o `guidance_message` (a resposta do usuario) gracas ao codigo existente na linha 171-173 que renderiza `TaskGuidanceBubble` quando `guidance_message` existe

Nenhuma mudanca de layout necessaria -- o card existente ja suporta exibir tarefas com mensagem de orientacao.

### Resumo

- 1 arquivo modificado: `src/components/oracle/FlowStepRenderer.tsx`
- As respostas de texto livre viram tarefas com tipo "cuidado_espiritual"
- Na Jornada, aparecerao na secao "Rituais & Oferendas" com o titulo do passo e a resposta como orientacao
- Nenhuma mudanca no banco de dados (a tabela `journey_tasks` ja suporta os campos necessarios)
