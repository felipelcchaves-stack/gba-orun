

# Mapa Espiritual Expandido: 6 Eixos de Equilibrio

## Resumo

Expandir o radar de 4 para **6 eixos** com grafia ioruba correta, cobrindo as grandes areas da pratica espiritual.

## Novo Modelo: 6 Eixos (Hexagono)

```text
          Ori
         /    \
   Orixa      Ebo
      |        |
  Egungun    Iyami
         \    /
        Egbe Orun
```

| Eixo | Label exibido | O que mede | Task types mapeados |
|------|---------------|-----------|---------------------|
| **Ebo** | Ẹbọ | Limpezas e cuidados | ebo, limpeza, banho, cuidado_espiritual, sacudimento |
| **Ori** | Orí | Cabeca e destino pessoal | ibori, oracao_ori, oracao_manha, oracao_noite, meditacao |
| **Iyami** | Ìyàmi | Maes ancestrais | iyami, oracao_iyami, oferenda_iyami, imule |
| **Egbe** | Ẹgbẹ́ Ọ̀run | Comunidade espiritual | egbe_orun, oferenda_egbe |
| **Egungun** | Egúngún | Ancestrais / Eguns | egungun, egupaka, egun, oferenda_egun, oracao_egun |
| **Orixa** | Òrìṣà | Devocao aos Orixas | orixa, oriki, cantiga, oferenda_orixa, orunmila |

## Sugestoes por eixo (com grafia correta)

| Eixo | Critico | Atencao | Equilibrado |
|------|---------|---------|-------------|
| Ẹbọ | "Consulte um Awó (Babalawó/Ìyánífá)" | "Faca um Ẹbọ de manutencao" | "Ẹbọ em dia! " |
| Orí | "Precisa de um Igbá Orí (assento de Orí)" | "Faca um Ìborí de fortalecimento" | "Orí fortalecido! " |
| Ìyàmi | "Considere fazer Ìmùlẹ̀ (pacto com as Maes)" | "Faca oracoes para Ìyàmi" | "Ìyàmi em paz! " |
| Ẹgbẹ́ Ọ̀run | "Considere fazer Ìdí Ẹgbẹ́ (1a mao de Ẹgbẹ́)" | "Faca uma oferenda ao Ẹgbẹ́ Ọ̀run" | "Ẹgbẹ́ Ọ̀run satisfeito! " |
| Egúngún | "Cuide dos seus Egúngún com urgencia" | "Faca uma oferenda aos ancestrais" | "Egúngún em paz! " |
| Òrìṣà | "Fortaleca sua conexao com seu Òrìṣà" | "Faca um Oríkì ou Orin" | "Devocao aos Òrìṣà em dia! " |

## Mudanca importante: oriki e cantiga

`oríkì` e `orin` (cantiga) migram de **Orí** para **Òrìṣà**, pois sao devocoes direcionadas aos Orixas. Orí fica focado em ìborí, oracoes pessoais e meditacao.

## Arquivos alterados

```text
src/hooks/useSpiritualAnalysis.ts
  - Expandir EnergyKey de 4 para 6 ("egungun" | "orixa")
  - Reorganizar TASK_TYPE_MAP (oriki/cantiga saem de ori, vao para orixa)
  - Adicionar novos grupos: egungun e orixa
  - Expandir KEYWORD_FALLBACK, LABELS, COLORS, SUGGESTIONS com grafia ioruba
  - Atualizar WeeklyData interface com os 2 novos campos

src/components/home/SpiritualEvolutionChart.tsx
  - Ajustar outerRadius de 75% para 68% (6 labels precisam de mais espaco)
  - Reduzir fontSize de 12 para 11 nos labels do radar
```

## Detalhes tecnicos

**Cores dos novos eixos:**
```text
ebo:     hsl(25, 60%, 35%)   -- marrom terra (mantem)
ori:     hsl(45, 90%, 52%)   -- amarelo ouro (mantem)
iyami:   hsl(300, 100%, 25%) -- roxo (mantem)
egbe:    hsl(120, 40%, 38%)  -- verde (mantem)
egungun: hsl(0, 0%, 40%)    -- cinza ancestral (novo)
orixa:   hsl(210, 70%, 45%)  -- azul celeste (novo)
```

**TASK_TYPE_MAP completo:**
```text
ebo:     ["ebo", "limpeza", "banho", "cuidado_espiritual", "sacudimento"]
ori:     ["ibori", "oracao_ori", "oracao_manha", "oracao_noite", "meditacao"]
iyami:   ["iyami", "oracao_iyami", "oferenda_iyami", "imule"]
egbe:    ["egbe_orun", "oferenda_egbe"]
egungun: ["egungun", "egupaka", "egun", "oferenda_egun", "oracao_egun"]
orixa:   ["orixa", "oriki", "cantiga", "oferenda_orixa", "orunmila"]
```

**KEYWORD_FALLBACK completo:**
```text
ebo:     ["ebo", "limpeza", "banho", "sacudimento", "cuidado"]
ori:     ["ori", "oracao", "reza", "prece", "meditac", "ibori"]
iyami:   ["iyami", "mae", "mãe", "imule", "imulé"]
egbe:    ["egbe", "egbé"]
egungun: ["egun", "ancestr", "egupaka", "oriodu", "ofé"]
orixa:   ["orixa", "orunmila", "oriki", "cantiga", "orin"]
```

**SpiritualEnergyDashboard.tsx** ja itera dinamicamente sobre `data.energies`, entao mostrara 6 barras automaticamente sem alteracoes.

**Nenhuma migracao necessaria**: o campo `task_type` em `oracle_task_templates` e texto livre -- o admin pode criar templates com `egungun`, `orixa`, etc. pelo painel e o mapeamento reconhece automaticamente.

