
# Flow Builder Responsivo - Tela Cheia

## Problema atual

O Flow Builder esta limitado a `h-[70vh]` fixo, com padding de `p-8` da area admin e o painel de configuracao com `max-h-[70vh]` e largura fixa `w-80`. Isso desperdiça espaco util, especialmente em telas menores onde a sidebar admin (w-60) consome area importante.

## Mudancas propostas

### 1. FlowBuilder ocupa toda a altura disponivel

Trocar `h-[70vh]` por `h-full` e garantir que o container pai preencha o espaco restante da tela. O FlowBuilder usara `flex-1` para crescer e ocupar tudo.

### 2. AdminFlows em modo edicao usa layout de tela cheia

Quando editando um fluxo, o container remove o padding extra e usa `flex flex-col h-full` para que o FlowBuilder ocupe todo o espaco vertical disponivel. O botao "Voltar" e titulo ficam compactos no topo.

### 3. Admin page reduz padding no modo fluxos

A `<main>` do Admin passa de `p-8` para padding reduzido quando a secao ativa for "flows" e estiver editando, maximizando a area do canvas.

### 4. NodeConfigPanel responsivo

- Em desktop: mantem o painel lateral com `max-h-[calc(100vh-8rem)]` em vez de `70vh`
- Em mobile: o painel se torna um overlay/sheet que desliza por cima do canvas, evitando esmagar o canvas

### 5. NodePalette colapsavel em mobile

A paleta de blocos fica como um botao flutuante em telas pequenas, abrindo um popover ao clicar, liberando espaco horizontal para o canvas.

## Detalhes tecnicos

### Arquivo 1: `src/pages/Admin.tsx`

- Quando `activeSection === "flows"`, a `<main>` usa padding menor (`p-4` em vez de `p-8`) e `flex flex-col` com `h-screen` para permitir que o conteudo interno cresca

### Arquivo 2: `src/components/admin/AdminFlows.tsx`

- No modo edicao (`editingFlowId`), o container usa `flex flex-col flex-1 min-h-0` para que o FlowBuilder preencha o espaco
- Header compacto com titulo + botao voltar em uma unica linha

### Arquivo 3: `src/components/admin/flow-builder/FlowBuilder.tsx`

- Trocar `h-[70vh]` por `flex-1 min-h-0` (cresce com o container pai)
- Em mobile (usar `useIsMobile`): NodePalette renderiza como botao flutuante + Popover
- NodeConfigPanel em mobile: renderiza dentro de um Sheet (drawer) em vez de coluna lateral

### Arquivo 4: `src/components/admin/flow-builder/NodeConfigPanel.tsx`

- Trocar `max-h-[70vh]` por `max-h-[calc(100vh-6rem)]` para usar mais altura
- Exportar tambem uma versao que pode ser usada dentro de um Sheet

### Arquivo 5: `src/components/admin/flow-builder/NodePalette.tsx`

- Aceitar prop `collapsed` para renderizar como botao flutuante + Popover em mobile

### Arquivos modificados: 5

1. `src/pages/Admin.tsx` - padding dinamico para fluxos
2. `src/components/admin/AdminFlows.tsx` - layout flex para modo edicao
3. `src/components/admin/flow-builder/FlowBuilder.tsx` - altura flexivel + mobile adaptations
4. `src/components/admin/flow-builder/NodeConfigPanel.tsx` - altura dinamica
5. `src/components/admin/flow-builder/NodePalette.tsx` - modo colapsavel
