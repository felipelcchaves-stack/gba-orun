

# Exibir ritual vinculado nas etapas do fluxo

## Problema

No painel de configuracao do Flow Builder, cada bloco tem uma secao "Vinculos" onde o admin pode associar um ritual e uma oferenda. Porem, o `FlowStepRenderer` ignora completamente esses campos (`config.ritual_id` e `config.offering_id`). O aluno ve a orientacao do mestre mas nao tem acesso ao ritual vinculado.

## Solucao

Adicionar ao componente `StepHeader` (que ja renderiza titulo, descricao e orientacao) um botao de acesso ao ritual vinculado. Quando `config.ritual_id` existir, um botao "Ver Ritual" aparece logo apos a orientacao do mestre. Ao clicar, abre um modal com o conteudo completo do ritual (texto Markdown + audio), igual ao `RitualHelpButton` ja existente.

## O que muda na experiencia do aluno

- Nas etapas que tiverem ritual vinculado, aparece um botao discreto abaixo da orientacao do mestre
- Ao clicar, abre um modal com o conteudo do ritual sem sair do fluxo
- Se o bloco tambem tiver oferenda vinculada, mostra um segundo botao para a oferenda

## Arquivo modificado

| Arquivo | Alteracao |
|---|---|
| `src/components/oracle/FlowStepRenderer.tsx` | No componente `StepHeader`, apos a orientacao do mestre, verificar se `config.ritual_id` existe. Se sim, usar o hook `useRitual` para buscar o conteudo e renderizar um botao "Ver Ritual" que abre um modal com o Markdown e audio do ritual |

## Detalhe tecnico

No `StepHeader`, adicionar:

1. Importar `useRitual` de `@/hooks/useRituals`, `Dialog`, `ReactMarkdown` e `AudioPlayer`
2. Verificar `config.ritual_id` -- se existir, buscar o ritual com `useRitual(config.ritual_id)`
3. Renderizar um botao com icone de livro ("Ver Ritual") apos o bloco de orientacao
4. Ao clicar, abrir um `Dialog` com o titulo, conteudo Markdown e player de audio do ritual
5. Incluir link "Ver ritual completo" que leva a `/rituais/{id}`

O mesmo padrao pode ser aplicado para `config.offering_id` futuramente, mas o foco agora e o ritual.

