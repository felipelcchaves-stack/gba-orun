
# Correções do Mapa Espiritual

## Problemas identificados

1. **Tipos de tarefa nao mapeados**: `cuidado_espiritual`, `cantiga` e `oriki` nao sao classificados em nenhuma energia, sendo silenciosamente ignorados na analise.
2. **Radar com apenas 2 pontos**: Quando so Ebo e Ori tem dados, o grafico radar vira uma linha reta -- visualmente inutil.
3. **Score homogeneo**: Com 20/24 concluidos para ambos, os valores ficam quase identicos, gerando um grafico "generico" sem diferenciacao.
4. **Energias sem dados nao aparecem**: Iyami e Egbe nunca mostram porque o filtro remove energias com `total === 0`, mas seria mais informativo mostra-las como "sem dados" com score neutro.

## Solucao

### 1. Expandir o mapeamento de task types

Adicionar os tipos faltantes ao `TASK_TYPE_MAP`:

```text
TASK_TYPE_MAP:
  ebo: ["ebo", "limpeza", "banho", "cuidado_espiritual"]
  ori: ["ibori", "oracao_ori", "oracao_manha", "oracao_noite", "meditacao", "oriki", "cantiga"]
  iyami: ["iyami", "oracao_iyami", "oferenda_iyami"]
  egbe: ["egbe_orun", "oferenda_egbe"]
```

- `cuidado_espiritual` entra em Ebo (cuidado geral / limpeza)
- `oriki` e `cantiga` entram em Ori (conexao espiritual / devocional)

### 2. Mostrar todas as 4 energias no radar (mesmo sem dados)

Em vez de filtrar energias com `total === 0`, mostra-las com um valor base neutro (ex: 50%) e uma indicacao visual de "sem dados ainda". Isso garante que o radar sempre tenha 4 pontos e forme um poligono real.

### 3. Melhorar a diferenciacao visual

Quando todas as energias estao "equilibradas", o grafico fica uniforme e pouco informativo. Adicionar:
- Um texto contextual abaixo do radar explicando o estado ("Suas energias estao equilibradas!" vs "Ebo precisa de atencao")
- Manter a sugestao da energia mais urgente como ja esta

### Arquivos alterados

```text
src/hooks/useSpiritualAnalysis.ts
  - Adicionar cuidado_espiritual, oriki, cantiga ao TASK_TYPE_MAP
  - Mudar calcScore para retornar 50 (neutro) quando total === 0 em vez de 0
  - Adicionar keyword fallbacks para cantiga e oriki

src/components/home/SpiritualEvolutionChart.tsx
  - Remover filtro que esconde energias sem dados
  - Mostrar todas as 4 energias sempre
  - Diferenciar visualmente energias "sem dados" (cor mais suave, label com asterisco)
```

### Detalhes tecnicos

**calcScore atualizado:**
```text
function calcScore(total, completed):
  if total === 0: return 50  // Neutro (sem dados = nao sabemos)
  return Math.round(((total - completed) / total) * 100)
```

**getLevel atualizado:**
```text
function getLevel(score, total):
  if total === 0: return "equilibrado"  // Sem dados = nao alarmar
  if score > 70: return "critico"
  if score >= 40: return "atencao"
  return "equilibrado"
```

**Radar sempre com 4 pontos:**
```text
// Antes: energiesWithData = data.energies.filter(e => e.total > 0)
// Depois: usar data.energies diretamente (sempre 4 itens)
const radarData = data.energies.map(e => ({
  energy: e.label,
  value: e.total > 0 ? (100 - e.score) : 50,
  fullMark: 100,
}))
```

Isso corrige a assertividade do mapa: tipos de tarefa nao serao mais perdidos, o grafico sempre formara um poligono com 4 eixos, e energias sem dados aparecem como "neutras" em vez de desaparecerem.
