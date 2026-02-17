

# Exibir Oferendas Vinculadas no Fluxo do Oraculo

## Problema

O `StepHeader` (componente que renderiza o cabecalho de cada etapa do fluxo para o aluno) exibe botoes para rituais vinculados (`ritual_ids`), mas ignora completamente o campo `offering_id`. O dado esta salvo na configuracao do no, porem nada aparece na tela do aluno.

## Solucao

Criar um componente `LinkedOfferingButton` similar ao `LinkedRitualButton` e adiciona-lo ao `StepHeader`, logo abaixo dos botoes de rituais.

## Detalhes tecnicos

### Arquivo: `src/components/oracle/FlowStepRenderer.tsx`

1. **Criar componente `LinkedOfferingButton`**
   - Recebe `offeringId` como prop
   - Usa o hook `useOfferings` (ou uma query individual) para buscar os dados da oferenda
   - Renderiza um botao com icone de oferenda (UtensilsCrossed)
   - Ao clicar, abre um Dialog/Modal com titulo, ingredientes, instrucoes (Markdown) e audio player

2. **Atualizar `StepHeader`**
   - Apos renderizar os `LinkedRitualButton`, verificar se `config.offering_id` existe
   - Se existir, renderizar `<LinkedOfferingButton offeringId={config.offering_id} />`
   - O botao aparece na mesma linha dos rituais (dentro do mesmo `flex flex-wrap gap-2`)

### Hook necessario

O `useOfferings` ja existe e retorna todas as oferendas. Para buscar uma unica oferenda por ID, pode-se filtrar localmente ou criar um pequeno hook `useOffering(id)`. A abordagem mais simples e filtrar do array ja carregado.

### Arquivos modificados: 1

1. `src/components/oracle/FlowStepRenderer.tsx` - adicionar `LinkedOfferingButton` e integrar no `StepHeader`

