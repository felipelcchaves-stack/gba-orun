
# Plano: Pergunta de Intenção antes do Oráculo

## O que muda

Hoje o fluxo do oráculo começa direto no resultado do Obi (Step 1). A ideia e adicionar um **Step 0** -- uma tela de "intenção" onde o usuario escolhe entre:

- **Cuidado Espiritual Semanal** -- rotina de manutenção
- **Quero uma Orientação** -- consulta pontual/diagnóstico

Essa escolha (chamada `intention`) sera salva no estado do wizard e propagada para:
1. O fluxo visual (textos contextuais em cada step)
2. A geração de tarefas (filtro por intenção nos templates)
3. O registro da jornada (salvo no campo `context`)

---

## Como funciona para o usuario

1. Ao entrar em `/oraculo`, ve a nova tela com duas opções grandes e bonitas (mesmo estilo dos botões Ire/Ibi)
2. Ao escolher, avança para o Step 1 (resultado do Obi) normalmente
3. Os textos dos steps seguintes podem variar conforme a intenção (via `oracle_step_texts` no banco)
4. No diagnóstico final, as tarefas geradas podem ser filtradas pela intenção (campo `intention` nos templates)

---

## Detalhes Técnicos

### 1. Banco de Dados

**Tabela `oracle_task_templates`** -- adicionar coluna:
```text
intention TEXT DEFAULT NULL
```
- `NULL` = aplica para qualquer intenção (backward compatible)
- `"cuidado_semanal"` = so aparece para cuidado semanal
- `"orientacao"` = so aparece para orientação

**Tabela `oracle_step_texts`** -- sem mudança estrutural. Basta cadastrar novas step_keys como `ebo_cuidado_semanal`, `ori_orientacao` etc. para textos contextuais (opcional, funciona com fallback).

### 2. Novo Componente: `StepIntention.tsx`

- Tela com titulo "Como posso te ajudar hoje?"
- Dois cards: "Cuidado Espiritual Semanal" (icone calendario/escudo) e "Quero uma Orientação" (icone bussola/sparkles)
- Callback `onSelect(intention: "cuidado_semanal" | "orientacao")`

### 3. Alterações no `Oracle.tsx` (página principal)

- Estado `intention` adicionado ao `WizardState`
- Step 0 = StepIntention, Steps 1-6 viram Steps 2-7
- A barra de progresso e o botão "Voltar" se ajustam ao novo total de steps

### 4. Alterações no `StepDiagnosis.tsx`

- O `WizardState` ganha o campo `intention: "cuidado_semanal" | "orientacao"`
- O filtro de templates adiciona: `if (t.intention && t.intention !== state.intention) return false;`
- O `contextJson` salvo inclui a intenção
- As notas do diagnóstico incluem a intenção

### 5. Alterações no `AdminOracleTaskTemplates.tsx`

- Novo campo "Intenção" no formulário de regra (select: Todas / Cuidado Semanal / Orientação)
- Exibição da intenção na listagem de regras

### 6. Ajuste no `OracleProgressBar`

- Atualizar para suportar 7 steps ao inves de 6

### 7. Hook `useOracleConfig.ts`

- Tipo `OracleTaskTemplate` ganha `intention: string | null`

---

## Resumo das alterações

| Arquivo | Ação |
|---|---|
| Migration SQL | Adicionar coluna `intention` em `oracle_task_templates` |
| `src/components/oracle/StepIntention.tsx` | Criar (novo step 0) |
| `src/pages/Oracle.tsx` | Adicionar step 0, ajustar numeração |
| `src/components/oracle/StepDiagnosis.tsx` | Filtrar por intention, salvar no context |
| `src/components/oracle/OracleProgressBar.tsx` | Suportar 7 steps |
| `src/hooks/useOracleConfig.ts` | Adicionar `intention` ao tipo |
| `src/components/admin/AdminOracleTaskTemplates.tsx` | Campo intention no form |
