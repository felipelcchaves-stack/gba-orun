
# Melhorar Grafico Espiritual + Corrigir Mapeamento de Energias

## Problemas atuais

1. **Task types desconectados**: O fluxo do oraculo gera tipos como `oracao_manha`, mas o hook so reconhece `ebo`, `ibori`, `oracao_ori`, `iyami`, `egbe_orun`. Resultado: energias ficam com score padrao de 50 e nunca refletem a realidade.
2. **Grafico inadequado**: O LineChart de linhas com 4 energias fica poluido em tela de celular e nao comunica "equilibrio" visualmente.
3. **Imule nunca aparece**: Como Iyami nunca chega a "critico", a sugestao de fazer Imule fica escondida.

## Solucao proposta

### 1. Trocar LineChart por RadarChart (grafico de teia)

O RadarChart e ideal para este caso porque:
- Mostra as 4 energias como pontos de uma mandala/compasso espiritual
- O usuario ve de imediato onde esta forte e onde esta fraco
- E mais bonito e intuitivo que linhas cruzadas
- Ocupa menos espaco vertical

O grafico tera 4 eixos (Ebo, Ori, Iyami, Egbe) com valores de 0 a 100, onde 100 = equilibrado.

### 2. Expandir o mapeamento de task_types

Adicionar mapeamentos mais abrangentes para capturar os tipos reais gerados pelos fluxos:

| Energia | Task types atuais | Task types adicionados |
|---------|-------------------|----------------------|
| Ebo | `ebo` | `limpeza`, `banho` |
| Ori | `ibori`, `oracao_ori` | `oracao_manha`, `oracao_noite`, `meditacao` |
| Iyami | `iyami`, `oracao_iyami` | `oferenda_iyami` |
| Egbe | `egbe_orun` | `oferenda_egbe` |

Tambem incluir um fallback: task types nao mapeados contarao para a energia geral mais proxima baseado em palavras-chave no nome.

### 3. Corrigir score padrao

Quando uma energia tem 0 tarefas, em vez de retornar score 50 ("atencao"), retornar 0 e nao exibir essa energia no radar. Isso evita falsos alertas.

## Arquivos modificados

| Arquivo | Acao |
|---------|------|
| `src/hooks/useSpiritualAnalysis.ts` | Expandir TASK_TYPE_MAP, corrigir score padrao (0 em vez de 50), adicionar fallback por palavra-chave |
| `src/components/home/SpiritualEvolutionChart.tsx` | Substituir LineChart por RadarChart com visual de mandala espiritual |
| `src/components/home/SpiritualEnergyDashboard.tsx` | Ajustar logica de "hasNoData" para considerar o novo score padrao |

**Total: 3 arquivos, 0 tabelas novas**

## Resultado esperado

- O radar mostra visualmente o equilibrio espiritual como um mapa
- Sugestoes como Imule aparecem corretamente quando Iyami esta critico
- Tarefas do fluxo (como `oracao_manha`) alimentam os scores corretamente
- Energias sem dados simplesmente nao aparecem, sem falsos alertas
