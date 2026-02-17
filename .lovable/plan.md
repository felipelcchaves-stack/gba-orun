

# Plano: Historico Completo de Consultas com Calendario

## O Que Existe Hoje

A pagina "Jornada" (`/jornada`) ja mostra as consultas do dia com um seletor de dias da semana. Porem, ela so mostra a **semana atual** -- o usuario nao consegue voltar no tempo para ver o que aconteceu no dia 10 de janeiro, por exemplo. Tambem nao ha nenhum resumo visual de quais dias tiveram atividade.

## O Que Vai Mudar

### 1. Calendario Mensal Navegavel
Substituir o seletor de 7 dias por um calendario mensal completo (usando o componente Calendar/DayPicker que ja esta instalado no projeto). O usuario podera:
- Navegar entre meses (setas para frente e para tras)
- Ver quais dias tiveram consultas (dias marcados com um ponto colorido)
- Tocar em qualquer dia para ver as consultas e tarefas daquele dia

### 2. Indicadores Visuais no Calendario
Cada dia com atividade tera um ponto abaixo do numero:
- **Verde**: todas as tarefas do dia foram concluidas
- **Amarelo**: tarefas parcialmente concluidas
- **Vermelho/Laranja**: nenhuma tarefa concluida

### 3. Detalhes do Dia Selecionado
Ao tocar num dia, a area abaixo do calendario mostra:
- Todas as consultas feitas naquele dia (cards com resultado do Obi, Ire/Ibi, horario)
- Checklist de tarefas de cada consulta com progresso
- Se nao houve consulta: mensagem incentivando a consultar o Oraculo

### 4. Estatisticas do Mes (resumo no topo)
Um mini-resumo acima do calendario:
- "X consultas este mes"
- "Y tarefas concluidas"
- "Z dias de atividade"

Isso reforça o habito e mostra ao usuario que o app esta registrando tudo.

---

## Detalhes Tecnicos

### Nenhuma migracao SQL necessaria
Todas as consultas ja sao salvas na tabela `user_journey` com `created_at`. As tarefas ficam em `journey_tasks`. So precisamos buscar os dados de forma diferente (por mes em vez de apenas a semana atual).

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/pages/Journey.tsx` | Substituir seletor semanal por calendario mensal, adicionar resumo do mes, manter cards de consulta do dia |
| `src/hooks/useJourney.ts` | Adicionar hook `useJourneyByMonth` que busca entradas de um mes inteiro para marcar os dias no calendario |

### Componentes Utilizados
- `react-day-picker` (ja instalado) para o calendario
- `date-fns` (ja instalado) para manipulacao de datas
- Componente `Calendar` do shadcn (ja existe em `src/components/ui/calendar.tsx`)

### Fluxo de Dados
1. Ao abrir a pagina, busca todas as entradas do mes atual via `useJourneyByMonth`
2. Monta um mapa `dia -> [entradas]` para marcar os pontos no calendario
3. Ao clicar num dia, filtra as entradas daquele dia e exibe os cards com tarefas
4. Ao navegar para outro mes, refaz a query com o novo intervalo de datas

### Hook `useJourneyByMonth`
Recebe `year` e `month`, busca `user_journey` com `created_at` entre o primeiro e ultimo dia do mes. Retorna os dados agrupados por dia para o calendario.

---

## Resultado Esperado

O usuario abre a Jornada e ve um calendario completo do mes. Dias com atividade tem pontinhos coloridos. Ele toca no dia 10 de janeiro e ve: "Caiu Okaran em Ibi -- 3 de 5 tarefas concluidas". Toca no dia 11 e ve outra consulta. Isso cria o habito de consultar todos os dias e da ao usuario a sensacao de que tudo esta sendo registrado e acompanhado.

