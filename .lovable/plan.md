

# Implementar campo "Status em Ifa" - Execucao completa

## Situacao atual

As colunas `ifa_status` NAO existem no banco de dados. Nenhuma parte do plano foi implementada ainda.

## O que sera feito

### Passo 1 - Migracao SQL

Adicionar coluna `ifa_status text DEFAULT NULL` nas tabelas `user_knowledge` e `profiles`. Recriar as funcoes RPC `admin_list_profiles` e `admin_get_knowledge_stats` para incluir o novo campo e estatisticas (`total_babalawo`, `total_iyanifa`, `total_omo_ifa`, `total_sem_ifa`).

### Passo 2 - Hook de Onboarding (`src/hooks/useOnboarding.ts`)

Adicionar `ifa_status` ao tipo `UserKnowledge` e salvar em ambas as tabelas.

### Passo 3 - Wizard de Onboarding (`src/components/onboarding/OnboardingWizard.tsx`)

Adicionar pergunta condicional no Step 1: "Voce tem Ifa?" com 4 opcoes:
- Babalawo
- Iyanifa
- Omo Ifa (Isefa)
- Nao tenho Ifa

So aparece se religiao for `candomble`, `ifa` ou `umbanda`.

### Passo 4 - Hook de Perfil (`src/hooks/useProfile.ts`)

Adicionar `ifa_status` ao tipo `Profile` e ao `useUpdateProfile`.

### Passo 5 - Formulario de Perfil (`src/components/profile/ProfileForm.tsx`)

Adicionar Select "Status em Ifa" com as 4 opcoes, visivel quando religiao for relevante.

### Passo 6 - Hook Admin (`src/hooks/useAdminData.ts`)

Adicionar `ifa_status` ao `AdminProfile` e contadores ao `KnowledgeStats`.

### Passo 7 - Dashboard Admin (`src/components/admin/AdminDashboard.tsx`)

Adicionar grafico de pizza com distribuicao dos titulos Ifa e barra no grafico de lacunas.

### Passo 8 - Tabela Admin Users (`src/components/admin/AdminUsers.tsx`)

Mostrar badge com titulo Ifa e adicionar filtro.

## Detalhe tecnico

### SQL da migracao

```sql
ALTER TABLE public.user_knowledge ADD COLUMN ifa_status text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN ifa_status text DEFAULT NULL;
```

Recriar `admin_list_profiles` adicionando:
- `COALESCE(uk.ifa_status, p.ifa_status) as ifa_status` ao SELECT
- `ifa_status text` ao RETURNS TABLE

Recriar `admin_get_knowledge_stats` adicionando:
- `count(*) FILTER (WHERE ifa_status = 'babalawo') as total_babalawo`
- `count(*) FILTER (WHERE ifa_status = 'iyanifa') as total_iyanifa`
- `count(*) FILTER (WHERE ifa_status = 'omo_ifa') as total_omo_ifa`
- `count(*) FILTER (WHERE ifa_status = 'nao' OR ifa_status IS NULL) as total_sem_ifa`

### Valores do campo

| Label | Valor |
|---|---|
| Babalawo | `babalawo` |
| Iyanifa | `iyanifa` |
| Omo Ifa (Isefa) | `omo_ifa` |
| Nao tenho Ifa | `nao` |

### Logica condicional

A pergunta so aparece quando `religion` esta em `['candomble', 'ifa', 'umbanda']`. Se mudar para outra religiao, o valor reseta para `null`.

### Arquivos modificados (8 no total)

1. Migracao SQL (2 ALTER TABLE + 2 funcoes RPC)
2. `src/hooks/useOnboarding.ts`
3. `src/components/onboarding/OnboardingWizard.tsx`
4. `src/hooks/useProfile.ts`
5. `src/components/profile/ProfileForm.tsx`
6. `src/hooks/useAdminData.ts`
7. `src/components/admin/AdminDashboard.tsx`
8. `src/components/admin/AdminUsers.tsx`

