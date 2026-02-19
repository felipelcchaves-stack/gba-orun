

# Separar Usuarios Cortesia dos Assinantes Reais

## Problema

Usuarios criados manualmente e marcados como "premium/ativo" estao sendo contados na previsao de receita (R$ 59,80), mesmo sem terem passado pelo checkout da Guru. A previsao de receita so deveria considerar assinantes reais (que pagam).

## Solucao

Adicionar um campo `is_courtesy` (booleano) na tabela `profiles`. Usuarios marcados como cortesia terao acesso premium, mas serao excluidos dos calculos financeiros (previsao de receita, contagem de assinantes ativos, inadimplentes).

## Alteracoes

### 1. Banco de dados
Nova coluna na tabela `profiles`:
- `is_courtesy` (boolean, default false) -- indica que o usuario recebeu acesso manualmente, sem pagamento

### 2. Dashboard Admin (`src/components/admin/AdminDashboard.tsx`)
- Filtrar usuarios `is_courtesy = true` fora do calculo de `revenueForecast`
- Nao contar cortesia em "Assinantes Ativos" nem "Inadimplentes"
- Adicionar novo card KPI: "Cortesia" mostrando quantos usuarios tem acesso gratuito concedido

### 3. Gestao de Usuarios (`src/components/admin/AdminUsers.tsx`)
- Adicionar checkbox ou toggle "Cortesia" no formulario de edicao de usuario
- Mostrar badge "Cortesia" na listagem quando `is_courtesy = true`
- Adicionar filtro "Cortesia" na lista de status

### 4. Hook de dados (`src/hooks/useAdminData.ts`)
- Incluir `is_courtesy` no tipo `AdminProfile`

### 5. Funcao RPC `admin_list_profiles`
- Incluir `p.is_courtesy` no SELECT

### 6. Funcao RPC `admin_get_stats`
- Excluir usuarios com `is_courtesy = true` das contagens de `active_subscribers` e `overdue_users`

## Detalhes tecnicos

### Logica de receita atualizada (pseudocodigo)
```text
// Antes: contava todos com status "active"
// Depois: exclui cortesia
for (const p of profiles) {
  if (p.subscription_status === "active" 
      && p.subscription_plan_id 
      && !p.is_courtesy) {      // <-- novo filtro
    total += plan.price;
  }
}
```

### Resumo de arquivos
- 1 migracao SQL (nova coluna + atualizacao das RPCs)
- 3 arquivos editados: AdminDashboard.tsx, AdminUsers.tsx, useAdminData.ts
