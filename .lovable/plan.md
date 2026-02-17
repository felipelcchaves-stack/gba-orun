

# Variaveis de Contexto no Fluxo do Oraculo

## Problema atual

O sistema ja preserva respostas em um dicionario `answers`, mas com problemas graves:

1. **Chaves sao UUIDs dos nos** - mudam a cada salvamento, quebrando condicoes no Diagnostico
2. **Busca de Obi e fragil** - o IreIbiStep varre todos os valores procurando por nomes como "alafia", "ejife", sem saber de qual no veio
3. **Nao e possivel referenciar respostas anteriores** em textos de mensagem ou orientacao
4. **Condicoes do Diagnostico referenciam UUIDs** que mudam, tornando-as inuteis

## Solucao: Variaveis Nomeadas

Cada no do fluxo podera definir um **nome de variavel** (ex: `resultado_obi`, `tipo_ire_ibi`, `intencao`). As respostas serao armazenadas com essas chaves nomeadas alem do nodeId, e poderao ser usadas em:

- Condicoes do Diagnostico (ex: `answer_equals:resultado_obi:ejife`)
- Interpolacao em textos de mensagem (ex: `"Seu resultado foi {{resultado_obi}}"`)
- Logica do IreIbiStep para encontrar o resultado do Obi automaticamente

## Mudancas por arquivo

### Arquivo 1: `src/components/admin/flow-builder/NodeConfigPanel.tsx`

Adicionar campo "Nome da variavel" no painel de configuracao de TODOS os tipos de no (exceto `start`). Campo de texto simples com placeholder "Ex: resultado_obi". Sera salvo em `config.variable_name`.

### Arquivo 2: `src/components/oracle/DynamicFlowRunner.tsx`

Alterar o estado `answers` para usar o `variable_name` do no como chave (quando definido), em vez do UUID:

- Quando `handleNext` recebe uma resposta, verificar se o no atual tem `config.variable_name`
- Se sim, usar esse nome como chave no dicionario
- Se nao, usar o nodeId como fallback
- Manter tambem um mapa `nodeIdToVarName` para traducao

### Arquivo 3: `src/components/oracle/FlowStepRenderer.tsx`

Tres ajustes:

1. **IreIbiStep**: Em vez de varrer todos os valores de `answers` procurando nomes de resultado Obi, buscar pela chave nomeada (qualquer chave cujo valor seja um resultado Obi valido). Isso ja funciona porque a busca continua sendo por valor, mas agora a chave e legivel.

2. **DiagnosisStep - evaluateCondition**: Aceitar tanto nodeId quanto variable_name nas condicoes. A sintaxe `answer_equals:resultado_obi:ejife` funcionara porque `answers["resultado_obi"]` existira.

3. **DiagnosisStep - Resumo**: Mostrar o nome da variavel em vez do UUID no resumo da consulta. Tambem interpolar variaveis em textos usando `{{nome_variavel}}`.

4. **StepHeader e mensagens**: Adicionar funcao `interpolateVars(text, answers)` que substitui `{{nome}}` pelo valor correspondente no dicionario de respostas.

## Detalhes tecnicos

### Nova funcao utilitaria (em FlowStepRenderer.tsx)

```text
function interpolateVars(text: string, answers: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => answers[key] || `{{${key}}}`);
}
```

### Mudanca em DynamicFlowRunner.handleNext

```text
Antes:
  setAnswers(prev => ({ ...prev, [currentNodeId]: answer }))

Depois:
  const varName = currentNode?.config?.variable_name || currentNodeId;
  setAnswers(prev => ({ ...prev, [varName]: answer }))
```

### Mudanca em NodeConfigPanel

Adicionar acima dos campos existentes:
- Label: "Nome da variavel (opcional)"
- Input tipo texto, valor: config.variable_name
- Placeholder: "Ex: resultado_obi"
- Dica: "Use para referenciar esta resposta em outros passos"

### Arquivos modificados: 3

1. `src/components/admin/flow-builder/NodeConfigPanel.tsx` - campo variable_name
2. `src/components/oracle/DynamicFlowRunner.tsx` - usar variable_name como chave
3. `src/components/oracle/FlowStepRenderer.tsx` - interpolacao de variaveis e resumo legivel

