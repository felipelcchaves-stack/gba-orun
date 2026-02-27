
# Correcao do Card Premium e Adicao de Ultimo Login

## Problema 1: Card "Premium (Pagantes)" contando cortesia

O card usa `stats.premium_users` que vem da RPC `admin_get_stats`, contando todos os perfis com `is_premium = true`. Como usuarios cortesia tambem tem `is_premium = true`, o numero inclui os 50 cortesia + 5 pagantes = 55.

**Solucao:** No frontend, subtrair a contagem de cortesia do total premium. O calculo fica: `(stats.premium_users - courtesyCount)`. Isso evita alterar a RPC e mantem a simplicidade.

## Problema 2: Adicionar "Ultimo Login"

Hoje so aparece a data de cadastro. A tabela `auth.users` do sistema de autenticacao ja possui o campo `last_sign_in_at` que registra automaticamente cada login.

**Solucao:**

### 1. Migracao de banco de dados
Atualizar a funcao `admin_list_profiles` para incluir `u.last_sign_in_at` no retorno, ja que ela faz JOIN com a tabela de autenticacao.

### 2. Frontend - useAdminData.ts
Adicionar `last_sign_in_at: string | null` na interface `AdminProfile`.

### 3. Frontend - AdminDashboard.tsx
- Corrigir o card Premium: `value: (stats?.premium_users ?? 0) - courtesyCount`
- Renomear label para "Premium Pagantes" (sem parentesis)
- Na tabela "Ultimos Usuarios", adicionar coluna "Ultimo Login"

### 4. Frontend - AdminUsers.tsx
- Adicionar coluna "Ultimo Login" na tabela de usuarios, exibindo a data formatada ou "Nunca" se nulo
