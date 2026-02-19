

# Sugestoes Inteligentes com Questionamento Interativo

## Resumo

Transformar as sugestoes estaticas do Mapa Espiritual em orientacoes inteligentes e acolhedoras que:
1. So aparecem apos **15 jornadas** (maturidade minima de dados)
2. Sugerem o ritual correto por eixo (Ibori, Imule, assentar Egungun, etc.)
3. Fazem uma **pergunta interativa**: "Voce ja fez esse ritual?" com respostas Sim/Nao
4. Usam tom de **orientacao espiritual**, nunca de venda

## Tom de Comunicacao (Diretriz Principal)

O aplicativo e um **orientador espiritual**, nao uma vitrine de servicos. Toda comunicacao deve:

- Usar linguagem acolhedora e respeitosa ("O oraculo sugere que...", "Pode ser um bom momento para...")
- **Nunca** usar imperativos comerciais ("Compre", "Adquira", "Contrate")
- **Nunca** mencionar precos, pacotes ou links de compra nesse contexto
- Apresentar as sugestoes como **caminhos possiveis**, nao obrigacoes
- Deixar claro que o usuario tem autonomia ("Quando sentir que e o momento certo...")
- Usar o tom do Agemo (mascote): gentil, sabio, sem pressa

**Exemplos de tom correto:**
- "O oraculo percebe que seu Ori pode se beneficiar de um Ibori. Voce ja teve a oportunidade de fazer esse ritual?"
- "Seus ancestrais pedem atencao. Quando sentir que e o momento, considere conversar com um Awo sobre assentar Egungun."
- "Tudo no seu tempo. O importante e voce saber que esse caminho existe."

**Exemplos de tom ERRADO (nunca usar):**
- "Voce PRECISA fazer Ibori urgentemente!"
- "Faca Imule agora para resolver seus problemas"
- "Clique aqui para contratar o ritual"

## Logica do Questionamento

Quando um eixo estiver fragil (atencao ou critico) **e** o usuario tiver 15+ jornadas, o dashboard mostra uma orientacao suave:

```text
  Iyami [atencao]
  "O oraculo percebe que sua relacao com Iyami pode se beneficiar
   de um Imule (pacto com as Maes)."

  "Voce ja teve a oportunidade de fazer Imule?"
    [Ja fiz] -> "Que bom! Considere conversar com um Awo para
                 fortalecer esse vinculo quando sentir necessidade."
    [Ainda nao] -> "Tudo bem, cada jornada tem seu tempo. Quando sentir
                    que e o momento, um Awo pode te orientar sobre esse caminho."
```

### Mapeamento por eixo (tom acolhedor)

| Eixo | Orientacao principal | Se ja fez | Se nao fez |
|------|---------------------|-----------|------------|
| Ebo | "...pode se beneficiar de uma consulta com um Awo" | "Considere uma nova consulta quando sentir necessidade" | "Quando sentir que e o momento, busque a orientacao de um Awo (Babalawo/Iyanifa)" |
| Ori | "...pode se beneficiar de um Ibori" | "Considere conversar com um Awo para fortalecer seu Ibori" | "Quando sentir que e o momento, um Awo pode te orientar sobre o Ibori" |
| Iyami | "...pode se beneficiar de um Imule" | "Considere conversar com um Awo para fortalecer seu Imule" | "Cada jornada tem seu tempo. Quando sentir que e o momento, um Awo pode te orientar" |
| Egbe Orun | "...pode se beneficiar de assentar Egbe Orun" | "Considere conversar com um Awo para cuidar do seu Egbe" | "Quando sentir que e o momento, um Awo pode te orientar sobre assentar Egbe Orun" |
| Egungun | "...pode se beneficiar de assentar Egungun" | "Considere conversar com um Awo para cuidar dos seus Egungun" | "Quando sentir que e o momento, um Awo pode te orientar sobre assentar Egungun" |
| Orixa | "...pode se beneficiar de assentar seu Orixa" | "Considere conversar com um Awo para fortalecer seu Orixa" | "Quando sentir que e o momento, um Awo pode te orientar sobre assentar seu Orixa" |

## O que muda visualmente

**Antes de 15 jornadas:** apenas barras de progresso com sugestoes simples. Sem alarme, sem questionamento.

**Apos 15 jornadas, para eixos frageis:** aparece um card suave com:
- Texto orientativo em tom acolhedor (nunca imperativo)
- Pergunta gentil: "Voce ja teve a oportunidade de fazer [ritual]?"
- Dois botoes suaves: "Ja fiz" / "Ainda nao"
- Resposta correspondente aparece inline, sempre tranquilizadora
- Estado local (useState) -- nao persiste, e apenas orientativo

## Arquivos alterados

```text
src/hooks/useSpiritualAnalysis.ts
  - Remover "limpeza", "banho", "sacudimento" do TASK_TYPE_MAP e KEYWORD_FALLBACK de ebo
  - Adicionar campo "totalJourneys" no retorno (contagem de jornadas do usuario)
  - Exportar constante RITUAL_GUIDANCE com textos acolhedores por eixo
  - Exportar threshold MIN_JOURNEYS = 15

src/components/home/SpiritualEnergyDashboard.tsx
  - Importar RITUAL_GUIDANCE e MIN_JOURNEYS
  - Adicionar estado local para respostas do usuario
  - Para eixos frageis com 15+ jornadas: renderizar card com orientacao e botoes
  - Tom visual suave: cores claras, sem icones de alerta agressivos, texto menor
```

## Detalhes tecnicos

**Nova constante RITUAL_GUIDANCE:**

```text
ebo: {
  ritual: "consultar um Awo",
  intro: "O oraculo percebe que seu caminho pode se beneficiar de uma consulta com um Awo (Babalawo/Iyanifa).",
  question: "Voce ja teve a oportunidade de consultar um Awo?",
  answerYes: "Que bom! Considere uma nova consulta quando sentir necessidade.",
  answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que e o momento, busque a orientacao de um Awo."
}
ori: {
  ritual: "Ibori",
  intro: "O oraculo percebe que seu Ori pode se beneficiar de um Ibori (fortalecimento da cabeca).",
  question: "Voce ja teve a oportunidade de fazer Ibori?",
  answerYes: "Que bom! Considere conversar com um Awo para fortalecer esse vinculo quando sentir necessidade.",
  answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que e o momento, um Awo pode te orientar sobre o Ibori."
}
iyami: {
  ritual: "Imule",
  intro: "O oraculo percebe que sua relacao com Iyami pode se beneficiar de um Imule (pacto com as Maes).",
  question: "Voce ja teve a oportunidade de fazer Imule?",
  answerYes: "Que bom! Considere conversar com um Awo para fortalecer seu Imule quando sentir necessidade.",
  answerNo: "Cada jornada tem seu tempo. Quando sentir que e o momento, um Awo pode te orientar sobre esse caminho."
}
egbe: {
  ritual: "assentar Egbe Orun",
  intro: "O oraculo percebe que sua conexao com Egbe Orun pode se beneficiar de um assentamento.",
  question: "Voce ja teve a oportunidade de assentar Egbe Orun?",
  answerYes: "Que bom! Considere conversar com um Awo para cuidar do seu Egbe quando sentir necessidade.",
  answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que e o momento, um Awo pode te orientar."
}
egungun: {
  ritual: "assentar Egungun",
  intro: "O oraculo percebe que seus ancestrais pedem atencao. Assentar Egungun pode fortalecer esse vinculo.",
  question: "Voce ja teve a oportunidade de assentar Egungun?",
  answerYes: "Que bom! Considere conversar com um Awo para cuidar dos seus Egungun quando sentir necessidade.",
  answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que e o momento, um Awo pode te orientar."
}
orixa: {
  ritual: "assentar seu Orixa",
  intro: "O oraculo percebe que sua devocao ao Orixa pode se beneficiar de um assentamento.",
  question: "Voce ja teve a oportunidade de assentar seu Orixa?",
  answerYes: "Que bom! Considere conversar com um Awo para fortalecer seu Orixa quando sentir necessidade.",
  answerNo: "Tudo bem, cada jornada tem seu tempo. Quando sentir que e o momento, um Awo pode te orientar."
}
```

**Query para contar jornadas:**

```text
const { count } = await supabase
  .from("user_journey")
  .select("id", { count: "exact", head: true })
  .eq("user_id", user.id);
```

**TASK_TYPE_MAP atualizado (ebo limpo):**

```text
ebo: ["ebo", "cuidado_espiritual"]
// Removidos: "limpeza", "banho", "sacudimento"
```

**KEYWORD_FALLBACK atualizado (ebo limpo):**

```text
ebo: ["ebo", "cuidado"]
// Removidos: "limpeza", "banho", "sacudimento"
```

**Visual dos cards de orientacao:**

Os cards usam fundo suave (bg do nivel correspondente com opacidade baixa), sem bordas agressivas. Os botoes "Ja fiz" e "Ainda nao" sao discretos (outline style), nao chamativos. A resposta aparece com transicao suave ao clicar. Nenhum link de compra, nenhum cadeado, nenhum CTA comercial aparece nesse contexto.

