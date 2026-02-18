

# Wizard Completo de Criacao de Fluxos

## O que sera construido

Um wizard de tela cheia com 6 passos que cobre **todos os campos** do sistema de fluxos, permitindo criar um fluxo pronto para uso sem precisar abrir o editor visual depois.

## Os 6 Passos do Wizard

### Passo 1: Informacoes Basicas
- Nome do fluxo (obrigatorio)
- Descricao (aparece na selecao do aluno)
- Mensagem de acolhimento (texto que o aluno ve ao iniciar)
- URL de audio da mensagem de acolhimento
- Orientacao do Mestre para a mensagem inicial (texto + audio URL)

### Passo 2: Estrutura do Oraculo
- Toggle: "Incluir lancamento de Obi?" (padrao: Sim)
  - Se Sim: campo de orientacao do mestre para o Obi (texto + audio URL)
  - Apelido da variavel (pre-preenchido: "resultado_obi")
- Toggle: "Incluir Ire/Ibi?" (padrao: Sim)
  - Se Sim: campo de orientacao do mestre (texto + audio URL)
  - Apelido da variavel (pre-preenchido: "resultado_ire_ibi")

### Passo 3: Perguntas Personalizadas
Lista dinamica onde cada pergunta tem **todos os campos** do NodeConfigPanel:
- Tipo: Sim/Nao ou Multipla Escolha (select)
- Pergunta (texto)
- Apelido da variavel (auto-gerado: pergunta_1, pergunta_2...)
- Orientacao do mestre (texto + audio URL)
- Vinculos: Rituais (MultiRitualCombobox) + Oferenda (OfferingCombobox)

**Para Sim/Nao:**
- Label "Sim" e Label "Nao" (editaveis)
- Descricao do Sim e Descricao do Nao (opcionais)
- Toggle "Alerta ao negar" com sub-campos:
  - Titulo do alerta, mensagem, audio URL
  - Texto dos botoes confirmar/cancelar

**Para Multipla Escolha:**
- Lista de opcoes (label + descricao)
- Botao "Adicionar opcao"

Cada pergunta pode ser reordenada (setas cima/baixo) e removida.

### Passo 4: Tarefas do Diagnostico
Lista de tarefas que o aluno recebera ao final. Cada tarefa tem:
- Titulo da tarefa
- Tipo (text input) e Categoria (select com as 11 categorias: oriki, ibori, ebo, oracao_manha, oracao_noite, oracao_ori, oracao_iyami, cantiga, egbe_orun, iyami, geral)
- Condicao (select inteligente):
  - "Sempre"
  - "Quando responder SIM a [pergunta X]" (dropdown populado com perguntas do Passo 3)
  - "Quando responder NAO a [pergunta X]"
  - "Quando responder [valor] a [pergunta X]" (para multipla escolha)
- Orientacao do mestre (texto + audio URL)
- Rituais vinculados (MultiRitualCombobox)
- Oferenda vinculada (OfferingCombobox)

Botao "Adicionar tarefas padrao" que pre-popula com: Ebo, Ibori, Oracao da Manha, Oracao de Ori, Oracao de Iyami, Egbe Orun.

### Passo 5: Configuracoes do Diagnostico
- Descricao geral do diagnostico (texto que aparece no topo do resumo)
- Orientacao do mestre para o diagnostico (texto + audio URL)

### Passo 6: Revisao e Criacao
- Resumo visual do fluxo:
  - Sequencia: Inicio -> Acolhimento -> (Obi?) -> (Ire/Ibi?) -> Pergunta 1 -> ... -> Diagnostico
  - Contagem: "X blocos, Y tarefas"
  - Lista de tarefas com condicoes resumidas
- Botao "Criar Fluxo"
- Apos criar: botao "Abrir no Editor" para ajustes finos

## Logica de Geracao Automatica

O wizard monta os arrays de nodes e edges automaticamente:

```text
Posicao Y = 0, 140, 280, 420... (incremento de 140px por no)

Nodes gerados:
1. start (sempre)
2. message (sempre, com texto de acolhimento)
3. obi (se ativado)
4. ire_ibi (se ativado)
5. yes_no ou multiple_choice (para cada pergunta)
6. diagnosis (sempre, com tarefas configuradas)

Edges gerados:
- start -> message: handle "default"
- message -> proximo: handle "default"
- obi -> proximo: todas as 5 saidas (alafia, ejife, etagun, okaran, oyekun) do oracle_configs
- ire_ibi -> proximo: handles "ire" e "ibi"
- yes_no -> proximo: handles "sim" e "nao"
- multiple_choice -> proximo: handle "default"
```

Usa os hooks existentes `useCreateFlow` e `useSaveFlowCanvas` para salvar.

## Arquivos

### Novo: `src/components/admin/FlowWizard.tsx`
- Componente modal de tela cheia com os 6 passos
- Navegacao por stepper (Anterior / Proximo / Criar)
- Validacao por passo (nome obrigatorio no passo 1, pelo menos 1 tarefa no passo 4)
- Reutiliza: MultiRitualCombobox, OfferingCombobox, Input, Textarea, Select
- Importa CATEGORIES_MAP de `src/lib/categories.ts` para popular selects
- Usa `useOracleConfigs` para buscar os result_keys do Obi dinamicamente

### Modificar: `src/components/admin/AdminFlows.tsx`
- Adicionar botao "Criar com Wizard" (icone Wand2) ao lado de "Criar Fluxo"
- State `showWizard` booleano
- Callback `onComplete(flowId)` que fecha o wizard e abre o editor

### Nenhuma mudanca no banco de dados
- Usa as mesmas tabelas e hooks existentes

