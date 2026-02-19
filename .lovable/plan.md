
# Corrigir: Cascata de Obi (Etaiwa) Nao Avanca para o Proximo Lancamento

## Diagnostico

O banco de dados esta 100% correto -- todas as conexoes dos 3 nos de Obi estao configuradas adequadamente:
- 1o Obi: etagun -> 2o Obi
- 2o Obi: etagun -> 3o Obi  
- 3o Obi: todos os resultados -> Ire/Ibi

O problema esta no React: quando o usuario seleciona "Etaiwa" no 1o Obi e avanca para o 2o Obi, o React **reutiliza a mesma instancia** do componente `ObiStep` porque o tipo do componente nao mudou (continua sendo `ObiStep`). Isso faz com que o estado interno (`selectedKey`) nao seja resetado, e o componente pode exibir a tela de orientacao do Etaiwa anterior ou nao renderizar o novo lancamento corretamente.

## Solucao

Adicionar uma prop `key={node.id}` no `FlowStepRenderer` (dentro do `DynamicFlowRunner`) para forcar o React a destruir e recriar o componente sempre que o no mudar. Isso garante que o estado interno de cada step (como `selectedKey` do ObiStep) comece limpo.

## Detalhes Tecnicos

### Arquivo: `src/components/oracle/DynamicFlowRunner.tsx` (linha ~118-124)

Alterar de:

```text
<div className="animate-fade-up">
  <FlowStepRenderer
    node={currentNode}
    onNext={handleNext}
    answers={answers}
    allNodes={nodes}
  />
</div>
```

Para:

```text
<div className="animate-fade-up" key={currentNode.id}>
  <FlowStepRenderer
    node={currentNode}
    onNext={handleNext}
    answers={answers}
    allNodes={nodes}
  />
</div>
```

A `key` no `div` envolvente forca o React a desmontar e remontar todo o conteudo quando o `currentNode.id` muda -- garantindo que o ObiStep (e qualquer outro step) comece com estado limpo.

Uma unica linha alterada em 1 arquivo. Nenhuma mudanca no banco de dados.
