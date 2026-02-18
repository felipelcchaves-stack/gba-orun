
# Corrigir categorias vazias na tela Aprender

## Problema

A aba "Oferendas" mostra todas as 11 categorias, mas so existem oferendas em 3 delas (ebo, iyami, geral). Ao clicar numa categoria sem oferendas, o usuario ve "Nenhuma oferenda disponivel" -- o que parece um bug.

O mesmo pode acontecer na aba Rituais se alguma categoria nao tiver rituais cadastrados.

## Solucao

Filtrar os cards de categoria para mostrar **apenas as que possuem conteudo**. Cada aba mostra so as categorias relevantes.

## Detalhes Tecnicos

### Arquivo: `src/pages/Learn.tsx`

1. Buscar as categorias distintas que existem em `rituals` e `offerings` usando queries auxiliares
2. No componente `CategoryCards`, receber uma lista de keys validas e filtrar as categorias exibidas
3. Duas abordagens possiveis (vamos com a mais simples):
   - Fazer um SELECT DISTINCT de `category` nas tabelas `rituals` e `offerings`
   - Usar esses resultados para filtrar os cards

Mudancas especificas:
- Adicionar duas queries: uma para buscar categorias distintas de `rituals` e outra de `offerings`
- O componente `CategoryCards` recebe um prop `validKeys: string[]` e filtra `categories` por ele
- Quando `validKeys` esta vazio (carregando), mostra skeleton ou todas as categorias

### Arquivo: `src/hooks/useRituals.ts`

- Adicionar um hook `useRitualCategories()` que faz `SELECT DISTINCT category FROM rituals`

### Arquivo: `src/hooks/useOfferings.ts`

- Adicionar um hook `useOfferingCategories()` que faz `SELECT DISTINCT category FROM offerings`

### Nenhuma mudanca no banco de dados
