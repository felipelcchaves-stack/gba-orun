
# Auto-Save para o Flow Builder

## Problema

Atualmente o fluxo so e salvo quando voce clica manualmente em "Salvar Fluxo". Se a pagina recarregar (refresh, queda de internet, fechar aba acidentalmente), todo o trabalho nao salvo se perde.

## Solucao

Implementar um sistema de auto-save em duas camadas:

### Camada 1: Rascunho local (localStorage)

A cada alteracao no canvas (mover no, adicionar no, conectar, editar config), o estado completo de nodes e edges e salvo automaticamente no `localStorage` do navegador com a chave `flow_draft_{flowId}`.

- **Quando salva localmente:** A cada mudanca, com debounce de 1 segundo (evita salvar a cada pixel de arraste)
- **Quando carrega:** Ao abrir o FlowBuilder, verifica se existe rascunho local MAIS RECENTE que os dados do banco. Se sim, pergunta ao usuario: "Encontramos um rascunho nao salvo. Deseja restaurar?"
- **Quando limpa:** Apos um save com sucesso no banco, o rascunho local e apagado

### Camada 2: Auto-save no banco (periodico)

A cada 60 segundos, se houver alteracoes pendentes, o sistema salva automaticamente no banco (usando o mesmo `useSaveFlowCanvas`). Um indicador visual mostra o status:

- Circulo verde: "Salvo"
- Circulo amarelo: "Alteracoes nao salvas"
- Animacao de loading: "Salvando..."

### Camada 3: Protecao contra saida

Um `beforeunload` event listener avisa o usuario se ele tentar fechar a aba com alteracoes nao salvas.

## Detalhes tecnicos

### Arquivo 1: `src/hooks/useFlowAutoSave.ts` (novo)

Hook customizado que encapsula toda a logica:

- Recebe `flowId`, `nodes`, `edges`, `loaded` (se ja carregou do banco)
- **Debounced localStorage save:** Salva nodes/edges no localStorage 1s apos qualquer mudanca
- **Draft detection:** Ao montar, verifica se existe draft e retorna `hasDraft: true` + funcao `restoreDraft()`
- **Dirty tracking:** Compara estado atual com ultimo save para saber se ha alteracoes pendentes (`isDirty`)
- **Auto-save periodico:** `setInterval` de 60s que chama `handleSave` se `isDirty`
- **beforeunload:** Registra/remove listener quando `isDirty` muda
- **clearDraft:** Limpa localStorage apos save bem-sucedido

### Arquivo 2: `src/components/admin/flow-builder/FlowBuilder.tsx` (modificado)

- Importar e usar `useFlowAutoSave`
- Adicionar indicador de status ao lado do botao "Salvar Fluxo" (circulo colorido + texto)
- Mostrar dialog de restauracao de rascunho ao carregar (se houver draft)
- Passar callbacks de `onNodesChange` e `onEdgesChange` para o hook marcar como dirty
- Apos save com sucesso, chamar `clearDraft()` e `markClean()`

### Arquivo 3: `src/components/admin/flow-builder/AutoSaveIndicator.tsx` (novo)

Componente visual pequeno que mostra:
- "Salvo" (verde) quando nao ha alteracoes
- "Alteracoes nao salvas" (amarelo) quando dirty
- "Salvando..." (animacao) durante save
- "Ultimo save: ha X min" com timestamp

### Arquivos modificados: 3

1. `src/hooks/useFlowAutoSave.ts` - novo hook com logica de auto-save
2. `src/components/admin/flow-builder/FlowBuilder.tsx` - integrar auto-save + indicador + dialog de restauracao
3. `src/components/admin/flow-builder/AutoSaveIndicator.tsx` - novo componente visual de status
