
# Remover Hardcodes de Odus - Tudo do Banco de Dados

## Problema

O arquivo `FlowStepRenderer.tsx` tem nomes de Odus e logica de Ire/Ibi hardcoded em pelo menos 3 lugares. O banco de dados ja tem os dados corretos (ex: "Ejikorere" em vez de "Ejife", "Apotaku" em vez de "Oyekun"), mas o codigo ignora isso em varios pontos.

### Hardcodes encontrados

| Local | O que esta hardcoded | Deveria vir de |
|---|---|---|
| Linha 412-418 (ObiStep) | Fallback com nomes errados ("Ejife", "Oyekun") | Tabela `oracle_configs` (ja usada, mas fallback mascara erros) |
| Linha 473-474 (IreIbiStep) | Lista de keys para decidir Ire vs Ibi: `["alafia", "ejife", "etagun"]` | Campo `default_ire_ibi` da tabela `oracle_configs` |
| Linha 617 (DiagnosisStep) | Lista de keys para identificar resultado do Obi: `["alafia", "ejife", "etagun", "okaran", "oyekun"]` | Tabela `oracle_configs` (todas as `result_key`) |
| `ObiNode.tsx` (admin) | `OBI_RESULTS = ["alafia", "etawa", "ejife", "okaran", "oyekun"]` | Tabela `oracle_configs` |

## Dados atuais no banco

O banco ja tem tudo configurado corretamente:

| result_key | name (display) | default_ire_ibi |
|---|---|---|
| oyekun | Apotaku | ibi |
| okaran | Okaran | ibi |
| ejife | Ejikorere | ire |
| etagun | Etaiwa | ire |
| alafia | Alafia | ire |

## Solucao

### 1. `FlowStepRenderer.tsx` - ObiStep (linha 410-418)
- **Remover o fallback hardcoded** (linhas 412-418)
- Se `dbConfigs` estiver vazio ou carregando, mostrar loading/erro em vez de dados inventados
- Se o admin nao configurou os Odus no banco, mostrar mensagem "Configure os Odus no painel admin"

### 2. `FlowStepRenderer.tsx` - IreIbiStep (linhas 472-475)
- Em vez de `const ireResults = ["alafia", "ejife", "etagun"]`, buscar de `oracle_configs` usando o campo `default_ire_ibi`
- O hook `useOracleConfigs` ja esta importado neste arquivo
- Logica nova: encontrar o config cujo `result_key` == resposta do Obi, e usar seu `default_ire_ibi`

### 3. `FlowStepRenderer.tsx` - DiagnosisStep (linha 617)
- Em vez de lista hardcoded para identificar o resultado do Obi, usar as `result_key` do `oracle_configs`
- Buscar `oracle_configs` e verificar se alguma resposta do usuario bate com algum `result_key`

### 4. `ObiNode.tsx` (admin, linha 5)
- Buscar os resultados possiveis de `oracle_configs` em vez de hardcode
- Exibir os nomes do banco nos handles do no visual

## Mudancas nos arquivos

| Arquivo | Mudanca |
|---|---|
| `src/components/oracle/FlowStepRenderer.tsx` | Remover fallback hardcoded do ObiStep. Usar `oracle_configs.default_ire_ibi` no IreIbiStep. Usar `oracle_configs.result_key` no DiagnosisStep. |
| `src/components/admin/flow-builder/nodes/ObiNode.tsx` | Buscar result_keys do banco em vez de array hardcoded |

## Detalhes tecnicos

- O hook `useOracleConfigs` ja existe e ja e importado em `FlowStepRenderer.tsx`
- O campo `default_ire_ibi` ja existe na tabela `oracle_configs` e esta preenchido
- Nenhuma mudanca no banco de dados necessaria
- A logica de Ire/Ibi passa de "lista fixa de keys" para "consultar o campo do banco para aquele result_key especifico"
