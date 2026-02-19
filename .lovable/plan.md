
# Renomear "Diagnostico" para "Resultado do seu jogo"

## O que muda

Trocar todas as referencias visuais de "Diagnostico" por textos mais alinhados com o contexto espiritual do app. O tipo interno (`diagnosis`) permanece igual no banco e no codigo -- so mudam os textos exibidos ao usuario.

## Alteracoes

### 1. Tela do aluno - Resumo da Consulta
**Arquivo:** `src/components/oracle/FlowStepRenderer.tsx`
- Linha 699: `"Resumo da Consulta"` vira `"Resultado do seu jogo - o que voce precisa cultuar"`

### 2. No visual do Flow Builder (admin)
**Arquivo:** `src/components/admin/flow-builder/nodes/DiagnosisNode.tsx`
- Linha 10: `"Diagnostico Final"` vira `"Resultado do Jogo"`

### 3. Paleta de blocos (admin)
**Arquivo:** `src/components/admin/flow-builder/NodePalette.tsx`
- Linha 13: label `"Diagnostico"` vira `"Resultado do Jogo"`

### 4. Labels no FlowBuilder
**Arquivo:** `src/components/admin/flow-builder/FlowBuilder.tsx`
- Linha 81: `"Diagnostico"` vira `"Resultado do Jogo"` (label do tipo)
- Linha 242: label default ao criar no `"Diagnostico"` vira `"Resultado do Jogo"`

### 5. Orientacao no Admin
**Arquivo:** `src/components/admin/AdminGuidance.tsx`
- Linha 24: `"Oraculo: Diagnostico"` vira `"Oraculo: Resultado do Jogo"`

### Detalhes tecnicos
- O `node_type` interno continua sendo `"diagnosis"` em todo o codigo e no banco de dados -- nenhuma migracao necessaria
- Apenas textos de exibicao (labels) sao alterados
- 5 arquivos modificados, todas alteracoes sao trocas de strings
