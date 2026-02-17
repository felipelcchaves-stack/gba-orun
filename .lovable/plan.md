
# Plano: Transformar a Jornada em Bussola Espiritual de Rotina

## O Problema Atual

Hoje o app funciona assim:
1. Usuario joga o Obi no app (aleatorio)
2. O app salva o resultado na jornada
3. A jornada e apenas uma lista cronologica de consultas passadas

**O que falta**: O usuario nao "informa" o resultado real do jogo dele. O app gera um resultado aleatorio, mas na vida real o usuario ja jogou fisicamente e sabe o resultado. Alem disso, a jornada nao funciona como um mapa de rotina -- ela e apenas um historico.

---

## A Nova Logica: App como Bussola de Rotina

O fluxo correto sera:

```text
+-------------------------------------------+
|  1. USUARIO JOGA OBI NA VIDA REAL          |
+-------------------------------------------+
              |
              v
+-------------------------------------------+
|  2. ABRE O APP E INFORMA O RESULTADO      |
|     (seleciona: Oyekun, Okaran, Ejife,    |
|      Etagun ou Alafia)                     |
+-------------------------------------------+
              |
              v
+-------------------------------------------+
|  3. APP MOSTRA O DIAGNOSTICO              |
|     - O que o Oraculo esta dizendo        |
|     - Acoes sugeridas (Ebo, Ori, Iyami,   |
|       Egbe Orun)                          |
|     - Rituais especificos para executar   |
+-------------------------------------------+
              |
              v
+-------------------------------------------+
|  4. JORNADA = MAPA DA ROTINA              |
|     - Hoje: card do dia com acoes         |
|     - Historico visual (timeline)         |
|     - Checklist de tarefas espirituais    |
|     - Streak de dias ativos              |
+-------------------------------------------+
```

---

## Fase 1 - Oraculo: De Aleatorio para Input Manual

### Mudanca no Oracle.tsx
Atualmente o app sorteia o resultado. O novo fluxo sera:

- **Tela 1**: "Qual foi o resultado do seu Obi hoje?" com 5 botoes grandes e bonitos, um para cada resultado (Oyekun, Okaran, Ejife, Etagun, Alafia)
- O usuario toca no resultado que ele obteve na vida real
- **Tela 2**: Card de diagnostico aparece com:
  - Nome e significado do resultado
  - Diagnostico detalhado (o que o Orixa esta pedindo)
  - Lista de acoes sugeridas organizadas por categoria:
    - "Cuidar do Ori" (Ibori) -- quando o resultado pede protecao pessoal
    - "Fazer Ebo" -- quando ha necessidade de limpeza/oferenda
    - "Apaziguar Iyami" -- quando o resultado indica bloqueio das Maes
    - "Cuidar do Egbe Orun" -- quando ha indicacao de trabalho com os ancestrais
  - Cada acao e um link para o ritual correspondente no banco de dados

### Logica de Sugestoes (Mapeamento)
Criar um mapeamento inteligente entre cada resultado do Obi e as categorias de acao. Exemplo:
- **Oyekun** (negativo): sugere Ebo de limpeza + Ibori + verificar Iyami
- **Okaran** (duvida): sugere Ebo leve + Ibori
- **Ejife** (sim): sugere Oriki de agradecimento
- **Etagun** (sim forte): sugere Oriki + oferenda ao Egbe Orun
- **Alafia** (confirmar): sugere jogar novamente e pede cautela

Este mapeamento sera uma constante no codigo, facilmente editavel.

---

## Fase 2 - Jornada: De Historico para Mapa de Rotina

### Nova estrutura da pagina Journey.tsx

**Secao 1: Card do Dia ("Hoje")**
- Se o usuario ja consultou hoje: mostra o resultado + checklist de tarefas
- Se nao consultou: botao "Registrar consulta de hoje" que leva ao Oraculo
- Cada tarefa sugerida e um checkbox que o usuario marca ao completar

**Secao 2: Calendario Visual (Timeline)**
- Linha do tempo vertical mostrando os ultimos 7-14 dias
- Cada dia mostra: o resultado do Obi + quantas tarefas foram completadas
- Dias sem consulta aparecem em cinza ("Sem registro")
- Visual inspirado em calendarios de habitos (como apps de meditacao)

**Secao 3: Progresso Geral**
- Barra de progresso: "X tarefas concluidas esta semana"
- Streak de dias consecutivos consultando o Oraculo

### Nova tabela: journey_tasks
Para rastrear as tarefas individuais de cada consulta:
- `id`, `journey_id` (FK para user_journey), `task_type` (ebo, ibori, iyami, egbe_orun, oriki), `task_title`, `ritual_id` (opcional), `completed`, `completed_at`
- Quando o usuario registra o resultado do Obi, o app automaticamente cria as tarefas sugeridas nesta tabela

---

## Fase 3 - Home Page: Bussola do Dia

### Mudanca no Home.tsx
A Home passa a funcionar como a "tela de rotina diaria":

- **Card principal**: "Sua Rotina de Hoje"
  - Se ja consultou: mostra resumo (resultado + X de Y tarefas feitas)
  - Se nao consultou: "Comece seu dia - Registre o Obi de hoje" com botao
- Os cards de atalho e categorias continuam abaixo
- O banner hero muda o texto para reforcar a ideia de rotina/bussola

---

## Fase 4 - Migracao SQL

### Nova tabela `journey_tasks`
- `id` (uuid, PK)
- `journey_id` (uuid, FK -> user_journey.id)
- `user_id` (uuid, para RLS)
- `task_type` (text: 'ebo', 'ibori', 'iyami', 'egbe_orun', 'oriki')
- `task_title` (text: descricao curta da tarefa)
- `ritual_id` (uuid, nullable, FK -> rituals.id)
- `completed` (boolean, default false)
- `completed_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- RLS: usuario ve/edita apenas suas proprias tarefas

### Adicionar coluna em user_journey
- `notes` (text, nullable) -- para o usuario anotar observacoes do dia
- `context` (text, nullable) -- "rotina_diaria", "consulta_especial" etc.

---

## Resumo dos Arquivos

| Arquivo | Mudanca |
|---|---|
| `src/pages/Oracle.tsx` | Trocar jogo aleatorio por selecao manual de resultado + diagnostico com acoes sugeridas |
| `src/pages/Journey.tsx` | Redesign completo: card do dia + timeline + checklist de tarefas |
| `src/pages/Home.tsx` | Adicionar card de rotina diaria no topo |
| `src/hooks/useJourney.ts` | Adicionar hooks para tarefas (useJourneyTasks, useCompleteTask, useCreateTasks) |
| Nova migracao SQL | Criar tabela `journey_tasks` + adicionar colunas em `user_journey` |

Nenhuma mudanca na landing page, admin ou perfil -- apenas no fluxo central de uso do app.
