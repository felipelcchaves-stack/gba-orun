

# Ciclo de Vida da Rotina Concluida

## Problema Atual

Quando o usuario completa 100% das tarefas do dia, o card permanece aberto e expandido, mostrando todas as tarefas riscadas. Isso ocupa espaco sem agregar valor. O card so desaparece naturalmente na meia-noite (troca de dia).

## Proposta: 3 Estados Visuais do Card

### Estado 1: Rotina Ativa (como esta hoje)
- Card expandido com lista de tarefas, barra de progresso, botoes de check
- Aparece enquanto houver tarefas pendentes

### Estado 2: Rotina Concluida (NOVO)
- Quando **todas as tarefas** sao completadas:
  - Auto-marcar o `user_journey.completed = true`
  - Colapsar o card para um formato compacto de celebracao
  - Mostrar: icone de sucesso + "Rotina concluida!" + horario + badge do Odu
  - Esconder a lista de tarefas (usuario ja fez tudo)
  - Manter um botao "Ver detalhes" que expande se quiser rever
- O Hero Card (circulo de progresso) muda para um estado de "100% - Ase!" com visual diferenciado

### Estado 3: Historico (via calendario)
- Cards de dias anteriores continuam acessiveis no calendario
- Mostram o formato compacto se foram concluidos, ou o formato completo se ficaram incompletos

## Regra de Permanencia

- O card de hoje fica visivel o dia todo, mesmo apos concluir
- Mas no formato **compacto** (nao expandido), para nao poluir
- Na meia-noite, sai da view "hoje" e vai para o historico (comportamento atual, sem mudanca)
- Se o usuario fizer **outra consulta** no mesmo dia, um novo card ativo aparece acima do concluido

## Mudancas Tecnicas

### Arquivo: `src/components/journey/JourneyEntryCard.tsx`
- Detectar quando `completedCount === totalCount && totalCount > 0`
- Renderizar versao compacta: 1 linha com icone de sucesso, nome do Odu, horario, e botao "Ver detalhes"
- Ao clicar "Ver detalhes", expandir mostrando as tarefas (todas verdes)
- Quando colapsa pela primeira vez, chamar `onComplete()` para marcar `completed = true` no banco

### Arquivo: `src/components/journey/TodayHeroCard.tsx`
- Quando `completedCount === totalCount && totalCount > 0`:
  - Circulo fica 100% preenchido com cor de sucesso (leaf)
  - Texto muda para "Rotina concluida!" em vez de "X de Y tarefas"
  - Frase motivacional muda para algo como "Ase! Ori agradece sua dedicacao"

### Arquivo: `src/pages/Journey.tsx`
- Nenhuma mudanca estrutural, o comportamento de filtro por dia continua igual
- A unica diferenca e visual: cards concluidos aparecem compactos

## Resumo Visual

| Situacao | O que aparece |
|---|---|
| Nenhuma consulta hoje | Hero Card com CTA "Iniciar meu Ritual" |
| Tarefas pendentes | Hero Card com progresso + Card expandido com checklist |
| Tudo concluido | Hero Card "100% Ase!" + Card compacto verde com "Ver detalhes" |
| Dia seguinte | Cards vao para historico no calendario |

