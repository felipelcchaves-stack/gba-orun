

# Limpeza e Reorganizacao da Home - Remover Duplicacoes

## Problemas encontrados

### 1. SpiritualEnergyDashboard + SpiritualEvolutionChart = mesma coisa
Ambos usam o mesmo hook `useSpiritualAnalysis` e mostram os mesmos dados:
- Dashboard: barras de progresso + "Ebo precisa de atencao"
- EvolutionChart: grafico radar (mandala) com os mesmos scores

O usuario ve a mesma informacao duas vezes, em formatos diferentes.

### 2. "Destaques" + "Rituais do Dia" = mesmos rituais
- Destaques: `rituals?.slice(0, 6)` (cards horizontais)
- Rituais do Dia: `rituals?.slice(0, 4)` (lista vertical)

Ambos pegam os primeiros rituais da mesma query. O usuario ve os mesmos rituais repetidos.

### 3. SpiritualCareCard + SpiritualEnergyDashboard = sobreposicao
- CareCard: "Seu Ori sente sua falta" / "Hoje e dia de cuidado" (pessoal, motivacional)
- EnergyDashboard: "Ebo precisa de atencao" (tecnico, pode assustar)

O CareCard ja cumpre o papel de motivar. O Dashboard duplica com tom alarmista.

### 4. Logica do "precisa de atencao" pode gerar falsos alertas
Se o usuario tem 2 tarefas de Ebo e completou 0, o score e 100% = "critico". Mas pode ser que ele acabou de comecar! A mensagem assusta sem contexto.

## Solucao proposta

### Unificar os dashboards espirituais
- **Manter** o `SpiritualEvolutionChart` (radar/mandala) como o unico painel de analise. E visualmente mais bonito e informativo.
- **Remover** o `SpiritualEnergyDashboard` (barras de progresso + alerta). Sua funcao e coberta pelo radar + CareCard.
- **Mover** a sugestao de "precisa de atencao" para dentro do radar (opcional, como texto sutil abaixo do grafico, sem tom alarmista).

### Corrigir "Destaques" e "Rituais do Dia"
- **Manter "Destaques"** como carousel horizontal (visual atrativo).
- **Transformar "Rituais do Dia"** em algo util: mostrar rituais de uma categoria diferente da dos Destaques, OU remover completamente se nao tiver logica propria.
- Alternativa: "Rituais do Dia" poderia mostrar rituais sugeridos pela ultima consulta ao Oraculo (campo `suggested_ritual_id` em `user_journey`), dando personalidade real a secao.

### Melhorar tom do alerta espiritual
- Trocar "precisa de atencao" por frases mais suaves como "Que tal cuidar do seu Ebo hoje?" dentro do radar
- Manter o CareCard como unico ponto de urgencia (ele ja tem logica de dias sem atividade)

## Mudancas nos arquivos

| Arquivo | Mudanca |
|---|---|
| `src/pages/Home.tsx` | Remover import e uso do SpiritualEnergyDashboard. Remover secao "Rituais do Dia" (duplica Destaques). |
| `src/components/home/SpiritualEvolutionChart.tsx` | Adicionar sugestao sutil abaixo do radar quando houver energia em atencao (tom suave, nao alarmista). |
| `src/components/home/SpiritualEnergyDashboard.tsx` | Nenhuma mudanca no arquivo (apenas deixa de ser usado na Home). Pode ser util em outra pagina futuramente. |

## Resultado

A Home passa de 8+ secoes para uma estrutura mais limpa:

1. Header + Streak
2. SubscriptionBanner (condicional)
3. SpiritualCareCard (motivacional, personalizado)
4. PromoBanner (condicional)
5. Mapa Espiritual (radar, colapsavel)
6. Hero Banner (link para Jornada)
7. Oracoes do Dia (contextual por horario)
8. Destaques (carousel de rituais)

Sem duplicacoes. Cada secao tem um proposito unico.

## Detalhes tecnicos

- Nenhuma mudanca no banco de dados
- Nenhum hook novo
- O componente SpiritualEnergyDashboard continua existindo no codigo (pode ser reutilizado na pagina Jornada ou Perfil se necessario)
- A sugestao no radar usa dados do `mostUrgent` que ja existe no hook `useSpiritualAnalysis`

