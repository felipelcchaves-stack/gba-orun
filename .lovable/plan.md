
# Variáveis Intuitivas no Flow Builder

## O que muda para o usuário

Hoje, para usar variáveis o admin precisa:
1. Saber digitar um nome técnico (ex: `resultado_obi`)
2. Lembrar de digitar `{{resultado_obi}}` nos campos de texto
3. Não errar a grafia

Isso é confuso para leigos. A proposta é tornar tudo visual e automático.

## Melhorias propostas

### 1. Nome de variável automático ao criar o nó

Quando o admin arrastar um nó para o canvas, o sistema já preenche automaticamente o `variable_name` com um nome legível baseado no tipo:

- Obi -> `resultado_obi`
- Ire/Ibi -> `tipo_ire_ibi`
- Sim/Não -> `pergunta_1` (incrementa se já existir)
- Múltipla Escolha -> `escolha_1`
- Pergunta Aberta -> `resposta_1`
- Mensagem -> (sem variável, não captura resposta)

O admin pode editar se quiser, mas já vem preenchido.

### 2. Botão "Inserir Variável" nos campos de texto

Em vez de digitar `{{nome}}` manualmente, os campos de texto (Mensagem, Descrição, Orientação) terão um botão clicável que abre uma lista com todas as variáveis definidas nos outros nós do fluxo. Ao clicar em uma variável, ela é inserida automaticamente no campo na posição do cursor.

A lista mostra o nome amigável + o tipo do nó de origem:
- "resultado_obi (Obi)"
- "tipo_ire_ibi (Irê/Ibi)"
- "pergunta_1 (Sim/Não)"

### 3. Variáveis visíveis como chips coloridos nos nós do canvas

Cada nó no canvas mostrará um pequeno chip/badge com o nome da variável definida (ex: um badge verde escrito "resultado_obi" abaixo do título do nó). Isso dá visibilidade imediata de quais nós geram dados reutilizáveis.

## Detalhes técnicos

### Arquivo 1: `src/components/admin/flow-builder/FlowBuilder.tsx`

- No `onDrop`, ao criar um novo nó, preencher `config.variable_name` automaticamente com base no tipo do nó
- Criar função `generateVariableName(type, existingNodes)` que gera nomes únicos incrementais

### Arquivo 2: `src/components/admin/flow-builder/NodeConfigPanel.tsx`

- Receber lista de todas as variáveis disponíveis no fluxo (via nova prop `availableVariables`)
- Criar componente `VariableInsertButton` que aparece ao lado dos campos Textarea
- Ao clicar, abre um Popover com a lista de variáveis clicáveis
- Ao selecionar, insere `{{nome}}` no campo na posição do cursor
- Renomear o label "Nome da variável" para "Apelido desta resposta" com dica mais amigável

### Arquivo 3: Nós visuais do canvas (todos os arquivos de nós)

- Adicionar badge com o `variable_name` quando definido nos componentes:
  - `ObiNode.tsx`, `IreIbiNode.tsx`, `YesNoNode.tsx`, `MultipleChoiceNode.tsx`, `OpenQuestionNode.tsx`, `DiagnosisNode.tsx`

### Arquivos modificados: 8

1. `src/components/admin/flow-builder/FlowBuilder.tsx` - auto-gerar nome de variável
2. `src/components/admin/flow-builder/NodeConfigPanel.tsx` - botão inserir variável + label amigável
3. `src/components/admin/flow-builder/nodes/ObiNode.tsx` - badge de variável
4. `src/components/admin/flow-builder/nodes/IreIbiNode.tsx` - badge de variável
5. `src/components/admin/flow-builder/nodes/YesNoNode.tsx` - badge de variável
6. `src/components/admin/flow-builder/nodes/MultipleChoiceNode.tsx` - badge de variável
7. `src/components/admin/flow-builder/nodes/OpenQuestionNode.tsx` - badge de variável
8. `src/components/admin/flow-builder/nodes/DiagnosisNode.tsx` - badge de variável
