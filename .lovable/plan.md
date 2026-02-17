

# Flow Builder como Unica Fonte de Verdade -- Plano Completo e Definitivo

## Resumo

Tornar o Flow Builder o **unico** lugar onde voce configura absolutamente tudo sobre a consulta do Oraculo: nomes dos fluxos (que aparecem como opcoes na tela "Como posso te ajudar hoje?"), descricoes, titulos de cada etapa, mensagens de orientacao do mestre com audio, vinculacao de rituais, oracoes e oferendas, e a logica de diagnostico com geracao de tarefas. Remover todo codigo hardcoded e todas as secoes duplicadas do admin.

---

## 1. O Fluxo Controla Tudo -- Inclusive a Tela Inicial

### Hoje
A tela "Como posso te ajudar hoje?" tem duas opcoes hardcoded: "Cuidado Espiritual Semanal" e "Quero uma Orientacao". Isso e rigido.

### Depois
- A tela inicial do Oraculo lista todos os **fluxos ativos** do banco de dados
- O **nome** do fluxo vira o titulo da opcao (ex: "Cuidado Espiritual Semanal")
- A **descricao** do fluxo vira o subtexto (ex: "Rotina de manutencao e protecao")
- Um novo campo **icone** (config.icon) define o icone visual
- Ao clicar, o usuario entra naquele fluxo especifico
- Se houver apenas 1 fluxo ativo, ele inicia direto (sem tela de selecao)

### Alteracao no banco
Nenhuma nova tabela. O campo `description` de `oracle_flows` ja existe e sera usado. Um campo `icon` opcional sera armazenado no fluxo (ou no config do Start node).

---

## 2. Campos Universais em TODOS os Blocos

Todo bloco do Flow Builder tera estes campos configuráveis no NodeConfigPanel:

| Campo | Descricao | Onde aparece para o usuario |
|---|---|---|
| **Titulo** (label) | Titulo da etapa | Titulo principal na tela |
| **Descricao** (config.description) | Texto explicativo | Subtitulo abaixo do titulo |
| **Mensagem do Mestre** (config.guidance_message) | Orientacao personalizada | Balao do mestre (GuidanceBubble) |
| **Audio do Mestre** (config.guidance_audio_url) | Audio do mestre | Botao de play no balao |
| **Ritual vinculado** (config.ritual_id) | Ritual/oracao sugerido | Botao "Ver Ritual" ou link de ajuda |
| **Oferenda vinculada** (config.offering_id) | Oferenda sugerida | Botao "Ver Oferenda" |

### Blocos especificos tem campos adicionais

**Mensagem**: texto da mensagem (config.message), audio da mensagem (config.audio_url)

**Sim/Nao**: pergunta (config.question), textos dos botoes personalizaveis (config.yes_label, config.no_label, config.yes_description, config.no_description)

**Escolha Multipla**: pergunta (config.question), lista de opcoes com label + descricao (config.options como array de objetos {label, description, ritual_id?, offering_id?})

**Obi**: usa dados da tabela `oracle_configs` como referencia, mostrando nomes e significados. Campo config.use_db_configs = true por padrao

**Ire/Ibi**: usa dados da tabela `ire_ibi_types` como referencia. Campo config.use_db_types = true por padrao

**Diagnostico**: campos para definir as tarefas que serao geradas (ver secao 3)

---

## 3. Bloco Diagnostico -- Geracao de Tarefas pelo Fluxo

O bloco de diagnostico precisa gerar o checklist de tarefas. Hoje isso e feito pela tabela `oracle_task_templates` com condicoes hardcoded (ebo_not_done, ori_needs, etc.).

### Nova abordagem: Tarefas inline no fluxo

Cada bloco de Diagnostico tera uma lista de **tarefas configuráveis** (config.tasks) com:

| Campo | Descricao |
|---|---|
| task_title | Titulo da tarefa (ex: "Fazer Ebo de Limpeza") |
| task_type | Tipo (ebo, ibori, oracao_ori, etc.) |
| category | Categoria para imagem/label |
| ritual_id | Ritual vinculado (opcional) |
| offering_id | Oferenda vinculada (opcional) |
| guidance_message | Orientacao do mestre para esta tarefa |
| guidance_audio_url | Audio do mestre para esta tarefa |
| condition | Condicao baseada nas respostas do fluxo (ver abaixo) |

### Condicoes inteligentes baseadas em respostas

O diagnostico recebe TODAS as respostas acumuladas ao longo do fluxo (o `answers` do DynamicFlowRunner). Cada tarefa pode ter uma condicao:

- **always**: sempre mostra
- **answer_equals:NODE_ID:valor**: mostra se o no X teve resposta = valor
- **answer_not_equals:NODE_ID:valor**: mostra se o no X teve resposta diferente de valor

Isso substitui completamente as condicoes hardcoded (ebo_not_done, ori_needs, etc.) por algo generico que funciona com qualquer pergunta do fluxo.

### Compatibilidade

O `DynamicFlowRunner` passara `answers` + `nodes` para o FlowStepRenderer no diagnostico. O FlowStepRenderer tera toda a logica de filtragem, salvamento no `user_journey` e `journey_tasks`, vinculacao de rituais/oferendas com combobox (exatamente como o StepDiagnosis atual faz).

---

## 4. NodeConfigPanel -- Redesenho Completo

O painel de configuracao sera reorganizado em secoes colapsaveis:

```text
+-- Informacoes Basicas --------+
| Titulo: [____________]        |
| Descricao: [____________]     |
+-------------------------------+

+-- Orientacao do Mestre -------+
| Mensagem: [textarea]         |
| Audio URL: [____________]    |
+-------------------------------+

+-- Vinculos --------------------+
| Ritual: [combobox busca]      |
| Oferenda: [combobox busca]    |
+-------------------------------+

+-- Configuracao Especifica -----+
| (campos do tipo de bloco)     |
+-------------------------------+
```

Todos os tipos de bloco (inclusive Start, Obi, Ire/Ibi, Diagnostico) serao editáveis ao clicar.

---

## 5. Fluxo de Exemplo Pre-populado

Botao "Criar Fluxo Padrao" no AdminFlows que insere automaticamente um fluxo completo com os dados reais atuais do banco:

**Fluxo "Cuidado Espiritual Semanal"** com ~14 nos:
- Inicio -> Mensagem de acolhimento -> Lancamento de Obi -> Ire/Ibi -> Mensagem pos-obi
- Sim/Nao "Ja apurou o Ebo?" -> (Se Sim) Escolha Multipla tipo de Ebo -> continua
- Sim/Nao "O Ori precisa de algo?" -> (Se Sim) Escolha Multipla Ibori/Oracao/Ambos
- Sim/Nao "As Iyami querem algo?" -> Sim/Nao "O Egbe Orun quer algo?"
- Diagnostico Final

Todos os titulos, descricoes e orientacoes serao preenchidos com os textos que ja existem nas tabelas `oracle_step_texts`, `oracle_configs` e `ire_ibi_types`.

Um segundo fluxo "Quero uma Orientacao" tambem sera criado como exemplo mais simples.

---

## 6. Oracle.tsx -- Tela de Selecao de Fluxos

A pagina do Oraculo sera completamente reescrita:

1. Busca todos os fluxos ativos (`is_active = true`)
2. Se houver 1 fluxo: inicia direto
3. Se houver 2+: mostra tela de selecao com cards (nome + descricao do fluxo)
4. Se houver 0: mensagem "Nenhum fluxo configurado"
5. Ao selecionar, renderiza o DynamicFlowRunner com o flowId escolhido

---

## 7. Limpeza Completa -- Remocoes

### Secoes do Admin removidas

| Secao | Motivo |
|---|---|
| "Oraculo" (com sub-abas: Resultados do Obi, Tarefas Sugeridas, Textos das Etapas, Tipos de Ire/Ibi) | Tudo agora e configurado via blocos do Flow Builder |
| "Orientacoes" (guidance_bubbles do oraculo) | As orientacoes agora vivem dentro de cada bloco |

### Arquivos removidos

| Arquivo | Motivo |
|---|---|
| `src/components/oracle/StepIntention.tsx` | Substituido pela tela de selecao de fluxos |
| `src/components/oracle/StepObiResult.tsx` | Substituido pelo bloco "Obi" do fluxo |
| `src/components/oracle/StepIreIbi.tsx` | Substituido pelo bloco "Ire/Ibi" do fluxo |
| `src/components/oracle/StepEbo.tsx` | Substituido por blocos "Sim/Nao" + "Escolha Multipla" |
| `src/components/oracle/StepOri.tsx` | Substituido por blocos "Sim/Nao" + "Escolha Multipla" |
| `src/components/oracle/StepIyamiEgbe.tsx` | Substituido por blocos "Sim/Nao" |
| `src/components/oracle/StepDiagnosis.tsx` | Logica movida para o bloco "Diagnostico" do FlowStepRenderer |
| `src/components/admin/AdminOracleStepTexts.tsx` | Textos agora vivem nos blocos |
| `src/components/admin/AdminOracleConfigs.tsx` | Tabela continua existindo como referencia, mas sem UI dedicada |
| `src/components/admin/AdminOracleTaskTemplates.tsx` | Tarefas agora sao definidas dentro do bloco Diagnostico |
| `src/components/admin/AdminIreIbiTypes.tsx` | Tabela continua existindo como referencia, mas sem UI dedicada |

### AdminSidebar

- Remover item "Oraculo" do menu
- "Fluxos" e o unico ponto de acesso para tudo do oraculo

### Hooks mantidos (dados de referencia)

- `useOracleConfigs` -- bloco Obi do FlowStepRenderer busca nomes/significados
- `useIreIbiTypes` -- bloco Ire/Ibi do FlowStepRenderer busca subtipos
- Hooks de `oracle_step_texts` e `oracle_task_templates` nao serao mais usados pelo fluxo dinamico

---

## 8. FlowBuilder -- Melhorias

- Permitir clicar em **todos** os tipos de no (inclusive Start, Obi, Ire/Ibi, Diagnostico) para configurar
- No Diagnostico: editor inline de tarefas com campos de titulo, tipo, categoria, ritual, oferenda, orientacao e condicao
- Nos de Escolha Multipla: cada opcao tera label + descricao + ritual_id + offering_id opcionais
- Adicionar botao de **deletar no** no NodeConfigPanel

---

## 9. Detalhes Tecnicos -- Arquivos Modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/flow-builder/NodeConfigPanel.tsx` | Redesenho completo com campos universais + campos especificos por tipo + editor de tarefas para diagnostico |
| `src/components/admin/flow-builder/FlowBuilder.tsx` | Permitir clicar em todos os tipos de no |
| `src/components/admin/AdminFlows.tsx` | Adicionar botao "Criar Fluxo Padrao" + campo descricao ao criar fluxo |
| `src/components/oracle/FlowStepRenderer.tsx` | Todos os blocos mostram titulo, descricao e GuidanceBubble inline; bloco Diagnostico com logica completa de tarefas, salvamento e vinculacao |
| `src/components/oracle/DynamicFlowRunner.tsx` | Passar answers + nodes para FlowStepRenderer |
| `src/pages/Oracle.tsx` | Tela de selecao de fluxos ativos + remover wizard hardcoded |
| `src/pages/Admin.tsx` | Remover secao "oracle", remover imports desnecessarios |
| `src/components/admin/AdminSidebar.tsx` | Remover item "Oraculo" |

---

## 10. Ordem de Execucao

1. Melhorar NodeConfigPanel com todos os campos universais + especificos + editor de tarefas do diagnostico
2. Atualizar FlowBuilder para permitir editar todos os tipos de no
3. Melhorar FlowStepRenderer com GuidanceBubble inline, rituais, oferendas e diagnostico completo
4. Atualizar DynamicFlowRunner para passar answers/nodes ao diagnostico
5. Criar botao "Fluxo Padrao" no AdminFlows com dados reais pre-populados
6. Reescrever Oracle.tsx com tela de selecao de fluxos
7. Limpar Admin.tsx e AdminSidebar (remover secao "Oraculo")
8. Remover arquivos Step*.tsx e Admin*Oracle*.tsx

