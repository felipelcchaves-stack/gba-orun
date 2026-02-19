

# Separar Usuarios Cortesia dos Assinantes Reais

## Problema

Usuarios criados manualmente e marcados como "premium/ativo" estao sendo contados na previsao de receita (R$ 59,80), mesmo sem terem passado pelo checkout da Guru.

## O que sera feito

1. **Banco de dados**: Adicionar coluna `is_courtesy` (boolean, default false) na tabela `profiles`
2. **RPCs**: Atualizar `admin_list_profiles` (incluir `is_courtesy` no SELECT) e `admin_get_stats` (excluir cortesia de `active_subscribers` e `overdue_users`)
3. **Hook** (`src/hooks/useAdminData.ts`): Adicionar `is_courtesy` ao tipo `AdminProfile`
4. **Dashboard** (`src/components/admin/AdminDashboard.tsx`): Filtrar cortesia fora da previsao de receita e adicionar card KPI "Cortesia"
5. **Gestao de Usuarios** (`src/components/admin/AdminUsers.tsx`): Adicionar toggle "Cortesia" no formulario e badge na listagem

## Resumo

- 1 migracao SQL (nova coluna + atualizacao das 2 RPCs)
- 3 arquivos de codigo editados

