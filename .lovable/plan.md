

# Auto-pular o bloco "Início" no fluxo do usuário

## Problema

O bloco "Início" e um elemento estrutural do construtor de fluxos -- serve apenas para marcar o ponto de partida no grafo visual. Ele nao deveria aparecer como uma etapa visivel para o aluno. Quando o aluno entra no Oraculo, ele ve "Inicio, Bem-vindo a consulta espiritual" com um botao "Comecar", em vez de ir direto para a primeira etapa real do fluxo (que e a proxima apos o Inicio).

## Solucao

Modificar o `DynamicFlowRunner` para que, ao encontrar o no de tipo `start`, ele automaticamente avance para o proximo no conectado, sem renderizar nada na tela. Assim, o aluno nunca ve a tela "Inicio" -- ele entra direto no conteudo configurado pelo mestre.

## O que muda

- O bloco Start continua existindo no construtor de fluxos (o admin precisa dele para definir o ponto de partida)
- Mas no lado do aluno, ele e invisivel -- o fluxo comeca automaticamente no primeiro no real conectado ao Start
- A orientacao do mestre configurada no Start (guidance_message) pode ser movida para o primeiro bloco real do fluxo

## Arquivo modificado

| Arquivo | Alteracao |
|---|---|
| `src/components/oracle/DynamicFlowRunner.tsx` | No useEffect que define o no inicial, ao encontrar o no `start`, seguir automaticamente a edge `default` para o proximo no e usar esse como ponto de partida |

## Detalhe tecnico

No `useEffect` que inicializa o `currentNodeId`:

1. Encontrar o no de tipo `start`
2. Buscar a edge que sai dele (source_handle = "default")
3. Definir `currentNodeId` como o `target_node_id` dessa edge (o proximo no real)
4. Se nao houver edge conectada ao start, usar o start como fallback (comportamento atual)

Isso elimina a tela intermediaria sem perder nenhuma funcionalidade.
