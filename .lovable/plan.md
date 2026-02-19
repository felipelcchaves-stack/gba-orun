
# Corrigir: Barra de Progresso do Oraculo mostra total errado

## Problema

A barra de progresso usa `nodes.length` (total de TODOS os nos do fluxo) como denominador. Num fluxo com ramificacoes (como a cascata Etaiwa com 3 Obis), o total inclui nos que o usuario nunca vai visitar naquele caminho. Resultado: a barra nunca chega perto de 100% e o texto "Passo X de Y" mostra um total inflado.

Exemplo: fluxo com 10 nos, caminho do usuario passa por 5. A barra mostra "Passo 2 de 10" em vez de "Passo 2 de 5".

## Solucao

Calcular o total de passos dinamicamente: passos ja visitados + estimativa de passos restantes ate o diagnostico. A cada transicao, o sistema percorre as edges a partir do no atual seguindo a saida "default" ate encontrar um no de diagnostico (ou ficar sem saidas), contando quantos passos faltam.

Formula: `totalSteps = history.length + 1 + stepsRemaining`

Isso garante que:
- O total se adapta ao caminho real do usuario
- Se cair Etaiwa e o caminho ficar mais longo, o total aumenta proporcionalmente
- A barra chega a ~100% ao atingir o diagnostico

## Detalhes Tecnicos

### Arquivo: `src/components/oracle/DynamicFlowRunner.tsx`

Substituir o calculo atual (linhas 45-46):

```text
const totalNodes = nodes?.length || 1;
const visitedCount = history.length + 1;
```

Por uma funcao que estima passos restantes:

```text
const estimateRemainingSteps = useMemo(() => {
  if (!nodes || !edges || !currentNodeId) return 0;
  let count = 0;
  let nodeId: string | null = currentNodeId;
  const visited = new Set<string>();
  while (nodeId && count < 20) {
    if (visited.has(nodeId)) break;
    visited.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.node_type === "diagnosis") break;
    // Follow the first available edge (default handle preferred)
    const defaultEdge = edges.find(
      e => e.source_node_id === nodeId && (e.source_handle === "default" || e.source_handle === "")
    );
    const anyEdge = defaultEdge || edges.find(e => e.source_node_id === nodeId);
    if (anyEdge) {
      nodeId = anyEdge.target_node_id;
      count++;
    } else {
      break;
    }
  }
  return count;
}, [nodes, edges, currentNodeId]);

const visitedCount = history.length + 1;
const totalSteps = visitedCount + estimateRemainingSteps;
```

E atualizar a chamada do componente:

```text
<OracleProgressBar currentStep={visitedCount} totalSteps={totalSteps} />
```

### Arquivo: `src/components/oracle/OracleProgressBar.tsx`

Nenhuma mudanca necessaria -- o componente ja aceita `currentStep` e `totalSteps` como props.

### Resumo
- 1 arquivo modificado: `src/components/oracle/DynamicFlowRunner.tsx`
- Calculo dinamico baseado no caminho real, nao no total de nos
- Protecao contra loops infinitos (limite de 20 iteracoes + set de visitados)
