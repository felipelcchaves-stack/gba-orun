

# Habilitar/Desabilitar Oracoes da Manha e Noite

## O que sera feito

Criar um toggle no painel Admin que permite habilitar ou desabilitar a exibicao das secoes de "Oracoes da Manha" e "Oracoes da Noite" em todo o app. Quando desabilitado:

- A secao de oracoes na **Home** desaparece
- As tarefas de oracao na **Jornada** nao sao agrupadas nas secoes "Manha" e "Noite" (ficam junto com as demais tarefas)

## Solucao

### 1. Criar a configuracao no banco de dados

Inserir uma nova chave `show_daily_prayers` na tabela `app_settings` com valor `"false"` (desabilitado por padrao para o lancamento de cortesia).

### 2. Adicionar toggle no Admin

**Arquivo:** `src/pages/Admin.tsx`

Na area de rituais/oracoes do Admin, adicionar um Switch com label "Exibir Oracoes da Manha/Noite" que atualiza a chave `show_daily_prayers` na tabela `app_settings`. Usa o hook `useUpdateAppSetting` que ja existe.

### 3. Ocultar secao na Home

**Arquivo:** `src/pages/Home.tsx`

Condicionar a secao de "Oracoes da Manha / Noite" ao valor de `settings?.show_daily_prayers === "true"`. Quando `false`, a secao inteira (linhas 125-153) nao sera renderizada.

### 4. Simplificar agrupamento na Jornada

**Arquivo:** `src/components/journey/JourneyEntryCard.tsx`

Ler o `app_settings` via hook e, quando `show_daily_prayers !== "true"`, juntar todas as tarefas em um unico grupo (sem separar Manha/Noite). As tarefas continuam existindo e funcionando, apenas o agrupamento visual muda.

## Resumo dos arquivos alterados

```text
Banco de dados (insert):
  - Inserir chave "show_daily_prayers" = "false" na tabela app_settings

src/pages/Admin.tsx
  - Adicionar Switch para habilitar/desabilitar oracoes diarias

src/pages/Home.tsx
  - Condicionar secao de oracoes ao setting

src/components/journey/JourneyEntryCard.tsx
  - Condicionar agrupamento Manha/Noite ao setting
```
