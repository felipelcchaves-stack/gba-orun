

# Melhorar aviso de nos sem conexao de saida no Flow Builder

## Problema identificado

O fluxo **esta salvando corretamente** -- nao ha erro real. A mensagem amarela que aparece e apenas um **aviso de validacao** informando que alguns nos nao possuem conexoes de saida. O problema e que a mensagem diz "multiple_choice, multiple_choice" em vez de mostrar o nome real do no, tornando impossivel saber qual no precisa ser corrigido.

**Causa tecnica:** O codigo usa `(n.data as any)?.label || n.type || n.id`. Quando o label e uma string vazia `""` (falsy em JS), ele cai no fallback `n.type`, mostrando "multiple_choice" em vez do nome do no.

## O que sera feito

### 1. Melhorar identificacao dos nos na mensagem de aviso

Na funcao `findDeadEndNodes` e no `handleManualSave`, usar o label do no, ou a `variable_name` do config, ou o tipo traduzido em portugues. Nunca mostrar o tipo tecnico cru como "multiple_choice".

### 2. Nao bloquear o salvamento

Manter o comportamento atual: o aviso aparece mas o fluxo salva normalmente. Isso e intencional -- o usuario pode estar construindo o fluxo aos poucos.

### 3. Excluir nos-folha intencionais da validacao

Alem de excluir nos do tipo "diagnosis" (ja feito), tambem excluir nos do tipo "message" que estejam na ponta de ramificacoes -- pois mensagens finais sao terminacoes validas em sub-fluxos.

---

## Detalhes tecnicos

**Arquivo unico:** `src/components/admin/flow-builder/FlowBuilder.tsx`

**Mudanca na linha 261 (handleManualSave):**

Trocar:
```text
(n.data as any)?.label || n.type || n.id
```
Por uma funcao que:
1. Usa o `label` se nao for vazio
2. Usa `variable_name` do config como fallback
3. Usa um dicionario de nomes em portugues para o tipo: `{ multiple_choice: "Escolha Multipla", yes_no: "Sim/Nao", message: "Mensagem", ... }`
4. Adiciona um numero de posicao para diferenciar nos do mesmo tipo (ex: "Escolha Multipla #3")

**Resultado esperado:** A mensagem passara de:
- "os nos [multiple_choice, multiple_choice] nao tem conexao de saida"
Para:
- "os nos [escolha_1 (Escolha Multipla), escolha_2 (Escolha Multipla)] nao tem conexao de saida"

