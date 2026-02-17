
# Plano: Dashboard Espiritual com Graficos de Cuidado + Fonte Poppins

## Resumo

Adicionar ao Dashboard do usuario (Home) um painel inteligente que analisa as 4 energias espirituais (Ebo, Ori, Iyami, Egbe Orun) com base no historico de consultas e tarefas, mostrando graficos de evolucao e sugestoes de cuidado. Alem disso, trocar toda a tipografia do app de Playfair Display/Inter para **Poppins**.

---

## Parte 1: Logica de Analise Espiritual

### Fonte de Dados

Os dados ja existem nas tabelas:
- **`user_journey`**: cada consulta ao oraculo salva `oracle_result` e `context` (JSON com `eboApurado`, `oriPrecisa`, `iyamiQuer`, `egbeOrunQuer`)
- **`journey_tasks`**: cada tarefa tem `task_type` (ebo, ibori, oracao_ori, iyami, egbe_orun, cantiga, etc.) e `completed` (boolean)

### Calculo do "Nivel de Atencao" por Energia

Para cada uma das 4 energias, o sistema vai calcular um score de 0-100 baseado em:

| Energia | task_types relevantes | Logica de score |
|---|---|---|
| **Ebo** | `ebo` | Quantas vezes foi pedido vs quantas vezes foi completado |
| **Ori** | `ibori`, `oracao_ori` | Idem - demanda vs conclusao |
| **Iyami** | `iyami`, `oracao_iyami` | Idem |
| **Egbe Orun** | `egbe_orun` | Idem |

**Formula**: `score = (total_pedidos - total_completados) / total_pedidos * 100`
- Score alto = muitas demandas nao atendidas = precisa de atencao urgente
- Score baixo = usuario esta em dia = energia equilibrada
- Se nao tem dados, score = 50 (neutro)

### Sugestoes Automaticas por Nivel

| Energia | Score > 70 (Critico) | Score 40-70 (Atencao) | Score < 40 (Equilibrado) |
|---|---|---|---|
| **Ebo** | "Consulte um Awo (Babalawo/Iyanifa)" | "Faca um Ebo de manutencao" | "Ebo em dia!" |
| **Ori** | "Precisa de um Igba Ori (assento de Ori)" | "Faca um Ibori de fortalecimento" | "Ori fortalecido!" |
| **Iyami** | "Considere fazer Imule (pacto com as Maes)" | "Faca oracoes para Iyami" | "Iyami em paz!" |
| **Egbe Orun** | "Considere fazer Idi Egbe (1a mao de Egbe)" | "Oferenda ao Egbe Orun" | "Egbe Orun satisfeito!" |

---

## Parte 2: Componentes Visuais

### Novo Componente: `SpiritualEnergyDashboard`

Card na Home que mostra:

1. **4 barras de progresso radiais** (ou barras horizontais) coloridas, uma por energia
2. **Indicador de urgencia** com cores: verde (equilibrado), amarelo (atencao), vermelho (critico)
3. **Sugestao principal**: a energia que mais precisa de cuidado, com a recomendacao adequada
4. **Botao de acao**: link para o Oraculo ou para o Ritual sugerido

### Novo Componente: `SpiritualEvolutionChart`

Grafico de linha (usando Recharts, ja instalado) mostrando a evolucao das 4 energias ao longo do tempo:
- Eixo X: ultimas 4 semanas (ou ultimos 30 dias agrupados por semana)
- Eixo Y: score de atencao (0-100)
- 4 linhas coloridas, uma por energia
- Tooltip com detalhes

### Hook: `useSpiritualAnalysis`

Hook que:
1. Busca todas as `journey_tasks` do usuario
2. Agrupa por `task_type` nas 4 categorias
3. Calcula os scores
4. Gera as sugestoes
5. Prepara os dados para o grafico de evolucao (agrupando por semana)

---

## Parte 3: Troca de Fonte para Poppins

### Mudancas

1. **`index.html`** ou **`src/index.css`**: trocar o import do Google Fonts de `Playfair Display + Inter` para `Poppins` (com pesos 300, 400, 500, 600, 700)
2. **`tailwind.config.ts`**: alterar `fontFamily.display` e `fontFamily.body` ambas para `["Poppins", "sans-serif"]`
3. **`src/index.css`**: atualizar as regras de `h1-h6` e `.font-display` / `.font-body` para usar Poppins
4. Nao precisa mexer nos componentes individualmente - as classes `font-display` e `font-body` ja sao usadas em todo o app e vao herdar a nova fonte

---

## Detalhes Tecnicos

### Arquivos a Criar

| Arquivo | Descricao |
|---|---|
| `src/hooks/useSpiritualAnalysis.ts` | Hook que calcula scores e sugestoes das 4 energias |
| `src/components/home/SpiritualEnergyDashboard.tsx` | Card com barras de progresso e sugestao principal |
| `src/components/home/SpiritualEvolutionChart.tsx` | Grafico de linha com evolucao semanal das energias |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/index.css` | Trocar import de fontes para Poppins |
| `tailwind.config.ts` | Atualizar fontFamily para Poppins |
| `src/pages/Home.tsx` | Adicionar os novos componentes de energia abaixo do SpiritualCareCard |

### Cores das Energias

| Energia | Cor | Referencia |
|---|---|---|
| Ebo | Marrom Terra (`hsl(var(--earth))`) | Cor do earth token |
| Ori | Amarelo Ouro (`hsl(var(--gold))`) | Cor do gold token |
| Iyami | Roxo (`#800080`) | Cor de alerta Iyami do briefing |
| Egbe Orun | Verde Folha (`hsl(var(--leaf))`) | Cor do leaf token |

### Estrutura do Grafico (Recharts)

Usando `LineChart` com `ResponsiveContainer` do Recharts (ja instalado). Dados no formato:

```text
[
  { semana: "Sem 1", ebo: 80, ori: 40, iyami: 20, egbe: 60 },
  { semana: "Sem 2", ebo: 60, ori: 50, iyami: 30, egbe: 50 },
  ...
]
```

### Integracao na Home

O novo dashboard de energias aparecera logo abaixo do `SpiritualCareCard` existente, somente para usuarios logados. Tera dois blocos:
1. O card com as 4 barras e a sugestao principal
2. O grafico de evolucao (colapsavel, inicia fechado para nao sobrecarregar a tela)

---

## Resultado Esperado

O usuario logado vera na Home, alem do card de cuidado semanal, um painel mostrando o estado das 4 energias espirituais com barras coloridas, indicadores visuais de urgencia, sugestoes personalizadas (como "Consulte um Awo" ou "Faca Idi Egbe"), e um grafico de evolucao ao longo das semanas. Toda a tipografia do app sera Poppins, mantendo a hierarquia de tamanhos e pesos existente.
