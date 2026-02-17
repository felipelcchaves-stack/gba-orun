

# Construtor Visual de Fluxos do Oraculo (Flow Builder)

## Resumo

Criar um editor visual de arrasta-e-solta no painel admin onde voce pode montar fluxos completos do oraculo como um mind map. Cada etapa (pergunta, mensagem, lancamento de obi, selecao, etc.) sera um "no" no mapa, e as conexoes entre eles definem o caminho que o aluno vai percorrer. O fluxo inteiro fica salvo no banco de dados, e o app do aluno interpreta esse fluxo dinamicamente -- sem precisar mexer em codigo nunca mais.

## Como Funciona para Voce (Admin)

1. Acessa o painel admin na secao "Fluxos"
2. Cria um novo fluxo (ex: "Consulta Padrao", "Consulta Simplificada")
3. Arrasta blocos para a tela:
   - **Mensagem**: texto do mestre com audio opcional (acolhimento, orientacao)
   - **Pergunta Sim/Nao**: ex: "Ja apurou o Ebo?"
   - **Escolha Multipla**: ex: "Que tipo de Ebo?" com N opcoes
   - **Lancamento de Obi**: os 5 resultados (Oyekun, Okaran, etc.)
   - **Selecao Ire/Ibi**: com subtipos do banco
   - **Diagnostico Final**: gera o checklist de tarefas
4. Conecta os blocos com setas -- cada seta pode ter uma condicao (ex: "Se Sim", "Se Ire", "Se Oyekun")
5. Salva e ativa o fluxo
6. O aluno abre o oraculo e percorre exatamente o caminho que voce desenhou

## Tipos de Blocos (Nos)

| Bloco | Funcao | Saidas |
|---|---|---|
| Inicio | Ponto de entrada do fluxo | 1 saida |
| Mensagem | Texto + audio do mestre | 1 saida (botao "Continuar") |
| Pergunta Sim/Nao | Pergunta binaria | 2 saidas (Sim / Nao) |
| Escolha Multipla | Lista de opcoes configuráveis | N saidas (uma por opcao) |
| Lancamento de Obi | Selecao do resultado do Obi | 5 saidas (uma por resultado) |
| Selecao Ire/Ibi | Escolha Ire ou Ibi + subtipo | 2 saidas (Ire / Ibi) |
| Pergunta Aberta | Campo de texto livre | 1 saida |
| Diagnostico | Gera checklist final | Fim do fluxo |

## Tecnologia

A biblioteca **React Flow** (@xyflow/react) sera usada para o editor visual. Ela e a referencia do mercado para editores de nos em React, com suporte completo a arrasta-e-solta, zoom, conexoes visuais e nos customizados.

## Estrutura do Banco de Dados

Duas novas tabelas:

**oracle_flows** -- armazena cada fluxo criado

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | Chave primaria |
| name | text | Nome do fluxo (ex: "Consulta Padrao") |
| description | text | Descricao opcional |
| is_active | boolean | Se esta ativo para os usuarios |
| is_default | boolean | Se e o fluxo padrao (apenas 1) |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

**oracle_flow_nodes** -- armazena cada bloco/no do fluxo

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | Chave primaria |
| flow_id | uuid | FK para oracle_flows |
| node_type | text | Tipo do no (message, yes_no, multiple_choice, obi, ire_ibi, diagnosis, start) |
| label | text | Titulo exibido no no |
| config | jsonb | Configuracao especifica (texto da mensagem, opcoes, audio_url, guidance, etc.) |
| position_x | float | Posicao X no editor |
| position_y | float | Posicao Y no editor |

**oracle_flow_edges** -- armazena as conexoes entre nos

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | Chave primaria |
| flow_id | uuid | FK para oracle_flows |
| source_node_id | uuid | No de origem |
| target_node_id | uuid | No de destino |
| source_handle | text | Identificador da saida (ex: "sim", "nao", "alafia", "ire") |
| label | text | Texto exibido na seta (opcional) |

## Alteracoes no Codigo

### Novos Arquivos

| Arquivo | Funcao |
|---|---|
| `src/components/admin/flow-builder/FlowBuilder.tsx` | Componente principal do editor com React Flow |
| `src/components/admin/flow-builder/nodes/MessageNode.tsx` | No visual de mensagem |
| `src/components/admin/flow-builder/nodes/YesNoNode.tsx` | No visual de pergunta sim/nao |
| `src/components/admin/flow-builder/nodes/MultipleChoiceNode.tsx` | No visual de escolha multipla |
| `src/components/admin/flow-builder/nodes/ObiNode.tsx` | No visual de lancamento de Obi |
| `src/components/admin/flow-builder/nodes/IreIbiNode.tsx` | No visual de selecao Ire/Ibi |
| `src/components/admin/flow-builder/nodes/DiagnosisNode.tsx` | No visual de diagnostico final |
| `src/components/admin/flow-builder/nodes/StartNode.tsx` | No visual de inicio |
| `src/components/admin/flow-builder/NodeConfigPanel.tsx` | Painel lateral para editar configuracao de cada no |
| `src/components/admin/flow-builder/NodePalette.tsx` | Paleta de blocos arrastáveis |
| `src/components/admin/AdminFlows.tsx` | Lista de fluxos no admin |
| `src/hooks/useOracleFlows.ts` | Hook para CRUD de fluxos, nos e edges |
| `src/components/oracle/DynamicFlowRunner.tsx` | Motor que interpreta o fluxo e conduz o usuario |
| `src/components/oracle/FlowStepRenderer.tsx` | Renderiza cada tipo de no para o usuario final |

### Arquivos Modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Oracle.tsx` | Verificar se existe fluxo ativo; se sim, usa DynamicFlowRunner ao inves do wizard hardcoded |
| `src/pages/Admin.tsx` | Adicionar secao "flows" no menu lateral |
| `src/components/admin/AdminSidebar.tsx` | Adicionar item "Fluxos" no menu |

### Nova Dependencia

- `@xyflow/react` -- biblioteca do editor visual de nos

## Como o Motor do Fluxo Funciona (Usuario Final)

1. O app carrega o fluxo ativo (is_default = true) com seus nos e edges
2. Comeca pelo no do tipo "start"
3. Renderiza o no atual de acordo com o tipo (mensagem, pergunta, etc.)
4. Quando o usuario interage (clica em "Continuar", escolhe "Sim", seleciona um resultado), o motor procura o edge correspondente (pelo source_handle)
5. Navega para o no de destino desse edge
6. Repete ate chegar no no de "diagnosis"
7. No diagnostico, coleta todas as respostas acumuladas ao longo do fluxo e gera o checklist

## Compatibilidade

- O wizard hardcoded atual continua funcionando como fallback se nenhum fluxo estiver ativo
- Os fluxos podem ser duplicados, editados e desativados sem risco
- Toda a configuracao existente (oracle_configs, ire_ibi_types, oracle_task_templates) continua valida e pode ser referenciada dentro dos nos do fluxo

## Ordem de Implementacao

1. Criar tabelas no banco (oracle_flows, oracle_flow_nodes, oracle_flow_edges)
2. Criar hook useOracleFlows com CRUD completo
3. Instalar @xyflow/react e criar o editor visual (FlowBuilder + nos customizados)
4. Criar a secao "Fluxos" no admin com lista + editor
5. Criar o DynamicFlowRunner para o usuario final
6. Integrar no Oracle.tsx (fluxo ativo substitui wizard hardcoded)

