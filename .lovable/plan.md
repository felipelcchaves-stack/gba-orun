

# Redesign da Pagina Jornada - UX Premium

## Problemas identificados

1. **Titulo "Plano de Vida"** - generico, nao transmite espiritualidade. Parece um app de produtividade.
2. **Calendario ocupa 60% da tela** - e a primeira coisa que o usuario ve. Calendarios sao uteis para consultar historico, mas nao devem ser o elemento principal. Afasta o usuario da acao.
3. **Stats cards monotonos** - tres caixinhas brancas identicas, sem hierarquia visual.
4. **Estado vazio desanimador** - imagem opaca, texto passivo. Deveria motivar.
5. **Falta de personalidade** - nao tem nada que remeta ao universo espiritual/Ioruba.

## Novo conceito: "Minha Jornada"

Inspirado em Duolingo + Headspace: foco na acao do dia (hoje), com historico acessivel mas nao dominante.

## Estrutura da nova pagina (de cima pra baixo)

### 1. Header com saudacao contextual
- Titulo: **"Minha Jornada"** (pessoal, afetivo)
- Subtitulo contextual baseado na hora do dia: "Bom dia, [Nome]" / "Boa noite, [Nome]"
- Botao de acesso rapido ao Oraculo (manter sparkles)

### 2. Card Hero "Rotina de Hoje" (destaque principal)
- Card grande com gradiente (earth/gold), bordas 3xl
- Mostra o resumo do dia: "3 de 5 tarefas concluidas"
- Barra de progresso circular ou semicircular estilizada
- Se nao tem tarefas: CTA vibrante "Consultar o Obi" com icone animado
- Frase motivacional contextual (ex: "Seu Ori agradece cada passo")

### 3. Lista de tarefas do dia (scroll vertical)
- Cards de tarefas com visual melhorado:
  - Icones tematicos coloridos por periodo (Sunrise amarelo, Moon roxo)
  - Checkbox com animacao de confete ao completar
  - Progresso visual por secao (Manha / Rituais / Noite)
- Se nao tem tarefas do dia: ilustracao com mascote Agemo e texto motivacional

### 4. Streak / Consistencia (inline, compacto)
- Faixa horizontal com os ultimos 7 dias como circulos
- Dias ativos = circulo preenchido com cor leaf
- Dia atual = circulo com borda dourada pulsante
- Mostra streak atual em destaque

### 5. Calendario (colapsavel, secundario)
- Comeca FECHADO por padrao
- Botao "Ver historico" abre/fecha o calendario
- Quando aberto, mantem os dots de atividade
- Ao selecionar um dia, mostra as consultas daquele dia abaixo

### 6. Stats do mes (redesenhados)
- Movidos para ABAIXO do calendario (so visiveis quando o calendario esta aberto)
- Visual com icones maiores e cores diferenciadas por stat
- Consultas = icone bussola, fundo amber
- Tarefas = icone check, fundo leaf
- Dias ativos = icone flame, fundo accent

## Mudancas nos arquivos

### `src/pages/Journey.tsx` (rewrite significativo)
- Renomear titulo para "Minha Jornada"
- Reorganizar layout: Hero card > Tarefas do dia > Streak > Calendario colapsavel > Stats
- Adicionar saudacao contextual (hora do dia)
- Adicionar state `calendarOpen` (default false)
- Adicionar componente de streak semanal inline
- Estado vazio redesenhado com CTA vibrante

### `src/components/journey/TodayHeroCard.tsx` (novo)
- Card hero com gradiente earth-to-dark
- Progresso do dia (circular ou barra grande)
- Frase motivacional
- CTA quando vazio

### `src/components/journey/WeekStreak.tsx` (novo)
- 7 circulos representando os ultimos 7 dias
- Cores: leaf (completo), accent (parcial), muted (vazio)
- Dia atual com ring dourado

### `src/components/journey/MonthlyStats.tsx` (redesign)
- Cards com cores diferenciadas (amber, leaf, accent)
- Icones maiores com fundo colorido arredondado
- Visivel apenas quando calendario esta aberto

### `src/components/journey/JourneyEntryCard.tsx` (melhorias visuais)
- Bordas mais suaves, sombras mais pronunciadas
- Icones com fundos coloridos ao inves de icons soltos
- Animacao sutil ao completar tarefa

## Detalhes tecnicos

- Nenhuma mudanca no banco de dados
- Nenhum hook novo (reutiliza useJourneyByMonth, useCompleteJourney, useCompleteTask)
- Componente Collapsible do Radix para o calendario
- date-fns para calculo dos ultimos 7 dias no streak
- Animacoes via Tailwind (transition, scale, pulse)

## Resultado esperado

A pagina deixa de parecer um "Google Calendar espiritual" e passa a ser uma experiencia imersiva focada no HOJE, com historico acessivel mas nao intrusivo. Visual quente, motivacional e alinhado com a identidade Ioruba do app.

