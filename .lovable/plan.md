

# Plano: Oraculo 100% Configuravel pelo Admin

## O Problema

Hoje, tudo no Oraculo esta "cravado" no codigo: os nomes dos Odu (Oyekun, Okaran...), as descricoes dos cards, e as tarefas sugeridas para cada resultado. Se voce quiser mudar o nome de um Odu, trocar uma descricao, ou adicionar um ritual especifico como sugestao quando cair determinado resultado, precisa mexer no codigo.

## A Solucao

Transformar todo o fluxo do Oraculo em dados gerenciados pelo banco de dados, com uma interface administrativa completa (desktop) onde voce podera:

1. **Editar os 5 resultados do Obi** -- nome, significado, descricao do card (os nomes dos Odu voce coloca como quiser)
2. **Configurar as tarefas sugeridas** para cada combinacao de resultado + Ire/Ibi + condicao (ex: "quando cair Okaran em Ibi e o ebo nao foi apurado, sugira o ritual X")
3. **Editar textos das etapas** -- as descricoes contextuais de cada passo do wizard

---

## Novas Tabelas no Banco de Dados

### Tabela: `oracle_configs`
Substitui o array `OBI_RESULTS` hardcoded. Armazena os 5 resultados do Obi.

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | PK |
| result_key | text | Slug unico (ex: "oyekun") |
| name | text | Nome de exibicao (ex: "Oyekun" ou qualquer nome que voce preferir) |
| meaning | text | Significado curto (ex: "Nenhum aberto -- NAO") |
| description_ire | text | Descricao quando vem em Ire |
| description_ibi | text | Descricao quando vem em Ibi |
| color_type | text | "danger", "warning", "success", "accent" (para estilo visual) |
| display_order | integer | Ordem de exibicao (1-5) |

### Tabela: `oracle_task_templates`
Substitui a funcao `generateTasks()` hardcoded. Define quais tarefas sugerir para cada cenario.

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | PK |
| oracle_result_key | text ou null | Slug do resultado (null = aplica a todos) |
| ire_or_ibi | text ou null | "ire", "ibi" ou null (ambos) |
| condition | text | "always", "ebo_not_done", "ebo_done", "ori_needs", "iyami_wants", "egbe_wants" |
| task_title | text | Titulo da tarefa (ex: "Faca o Ebo de Limpeza do Okaran") |
| task_type | text | Tipo (ebo, ibori, oracao_ori, cantiga...) |
| category | text | Categoria para linkar com rituais |
| ritual_id | uuid ou null | Link direto para um ritual especifico (opcional) |
| display_order | integer | Ordem de exibicao |

### Tabela: `oracle_step_texts`
Textos configuráveis para cada etapa do wizard.

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | PK |
| step_key | text | "ire_ibi", "ebo", "ebo_ire", "ebo_ibi", "ori", "ori_ire", "ori_ibi", "iyami", "egbe" |
| title | text | Titulo da etapa |
| description | text | Descricao contextual |

---

## Painel Admin: Nova Aba "Oraculo"

Uma nova aba no painel Admin (ao lado de "Rituais", "Configuracoes", "Importar") com 3 sub-secoes:

### Sub-secao 1: Resultados do Obi
- Lista os 5 resultados em cards editaveis
- Cada card tem: Nome, Significado, Descricao em Ire, Descricao em Ibi, Estilo Visual
- Botao "Salvar" por card
- Voce pode mudar os nomes dos Odu livremente

### Sub-secao 2: Tarefas Sugeridas
- Tabela/lista filtravel por resultado e Ire/Ibi
- Cada linha: Resultado (ou "Todos"), Ire/Ibi (ou "Ambos"), Condicao, Titulo da Tarefa, Categoria, Ritual Linkado
- Botao "Adicionar Regra" para criar novas combinacoes
- Botao "Editar" e "Excluir" em cada linha
- Exemplo de regra: "Quando cair Okaran + Ibi + Ebo nao apurado -> Sugerir 'Faca o Ebo de Limpeza do Okaran' (categoria: ebo, ritual: [dropdown de rituais cadastrados])"

### Sub-secao 3: Textos das Etapas
- Lista de textos editaveis para cada etapa do wizard
- Titulo e descricao de cada passo (Ire/Ibi, Ebo, Ori, Iyami, Egbe)

---

## Como o Oraculo Vai Funcionar (Frontend)

### Etapa 1 - Resultado do Obi
- Busca os 5 resultados de `oracle_configs` (ordenados por `display_order`)
- Exibe com os nomes, significados e estilos do banco
- Nada mais hardcoded

### Etapa 2 - Ire ou Ibi
- Mostra descricao contextual vinda de `oracle_configs.description_ire` ou `description_ibi` conforme o resultado selecionado
- Textos do titulo/subtitulo vindos de `oracle_step_texts`

### Etapas 3-5 - Ebo, Ori, Iyami/Egbe
- Titulos e descricoes contextuais vindos de `oracle_step_texts`
- Fluxo identico ao atual (sim/nao, sub-opcoes)

### Etapa 6 - Diagnostico
- Busca em `oracle_task_templates` todas as regras que correspondem a:
  - `oracle_result_key` = resultado selecionado (ou null para regras globais)
  - `ire_or_ibi` = ire/ibi selecionado (ou null para ambos)
  - `condition` satisfeita pelas respostas do wizard
- Monta o checklist dinamicamente
- Se a regra tem `ritual_id`, linka direto ao ritual

---

## Exemplo Pratico

Voce quer que quando cair **Okaran em Ibi** e o usuario **nao apurou o Ebo**, apareca a tarefa "Faca o Ritual de Limpeza do Okaran" apontando para um ritual especifico que voce ja cadastrou:

1. Va ao Admin > Oraculo > Tarefas Sugeridas
2. Clique "Adicionar Regra"
3. Preencha:
   - Resultado: Okaran
   - Ire/Ibi: Ibi
   - Condicao: Ebo nao apurado
   - Titulo: "Faca o Ritual de Limpeza do Okaran"
   - Categoria: Ebo
   - Ritual: (selecione no dropdown o ritual "Limpeza do Okaran" que voce ja cadastrou)
4. Salve

Pronto! Na proxima vez que um aluno selecionar Okaran + Ibi + Ebo nao apurado, ele vera essa tarefa especifica com link direto para o ritual.

---

## Detalhes Tecnicos

### Migracao SQL
Criar 3 tabelas novas: `oracle_configs`, `oracle_task_templates`, `oracle_step_texts`, com RLS para admin gerenciar e leitura publica.

Seed inicial: popular `oracle_configs` com os 5 resultados atuais e `oracle_task_templates` com as regras que hoje estao hardcoded em `generateTasks()`, e `oracle_step_texts` com os textos atuais das etapas.

### Arquivos a Criar
| Arquivo | Descricao |
|---|---|
| `src/hooks/useOracleConfig.ts` | Hooks para buscar configs, templates e textos do oraculo |
| `src/components/admin/AdminOracleConfigs.tsx` | Editor dos 5 resultados do Obi |
| `src/components/admin/AdminOracleTaskTemplates.tsx` | Editor das regras de tarefas |
| `src/components/admin/AdminOracleStepTexts.tsx` | Editor dos textos das etapas |

### Arquivos a Modificar
| Arquivo | Mudanca |
|---|---|
| `src/pages/Admin.tsx` | Nova aba "Oraculo" com as 3 sub-secoes |
| `src/components/oracle/StepObiResult.tsx` | Buscar resultados do banco em vez de array hardcoded |
| `src/components/oracle/StepIreIbi.tsx` | Usar descricoes do banco |
| `src/components/oracle/StepEbo.tsx` | Usar textos do banco |
| `src/components/oracle/StepOri.tsx` | Usar textos do banco |
| `src/components/oracle/StepIyamiEgbe.tsx` | Usar textos do banco |
| `src/components/oracle/StepDiagnosis.tsx` | Gerar tarefas a partir de `oracle_task_templates` em vez de funcao hardcoded |

### Fallback de Seguranca
Se o banco estiver vazio (nenhuma config cadastrada), o sistema usara os valores hardcoded atuais como fallback, garantindo que o app nunca quebre.

