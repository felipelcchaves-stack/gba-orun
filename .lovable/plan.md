

# Adicionar campo "Tem Ifa" com titulos corretos ao perfil

## Objetivo

Coletar se o usuario ja e iniciado em Ifa, permitindo segmentacao de marketing. A pergunta oferecera as opcoes corretas: **Babalawo**, **Iyanifa**, **Omo Ifa (Isefa)** ou **Nao tenho Ifa**.

## Mudanca de abordagem

Em vez de um simples boolean `has_ifa`, usaremos um campo texto `ifa_status` que armazena o titulo especifico do usuario. Valores possiveis:
- `babalawo` - Babalawo
- `iyanifa` - Iyanifa
- `omo_ifa` - Omo Ifa (Isefa)
- `nao` - Nao tem Ifa
- `null` - Nao respondeu ainda

## Alteracoes

### 1. Banco de dados (migracao SQL)

- Adicionar coluna `ifa_status text DEFAULT NULL` na tabela `user_knowledge`
- Adicionar coluna `ifa_status text DEFAULT NULL` na tabela `profiles`
- Atualizar funcao `admin_list_profiles` para incluir `ifa_status`
- Atualizar funcao `admin_get_knowledge_stats` para incluir contagem de cada status

### 2. Onboarding Wizard

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useOnboarding.ts` | Adicionar `ifa_status: string` ao `UserKnowledge`. Salvar em `user_knowledge` e em `profiles`. |
| `src/components/onboarding/OnboardingWizard.tsx` | Adicionar pergunta condicional no Step 1: "Voce tem Ifa?" com 4 opcoes (Babalawo, Iyanifa, Omo Ifa, Nao). So aparece se religiao for `candomble`, `ifa` ou `umbanda`. |

### 3. Perfil do usuario

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useProfile.ts` | Adicionar `ifa_status` ao tipo `Profile` e ao `useUpdateProfile`. |
| `src/components/profile/ProfileForm.tsx` | Adicionar Select "Status em Ifa" com as 4 opcoes, visivel quando religiao for relevante. |

### 4. Dashboard Admin

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useAdminData.ts` | Adicionar `ifa_status` ao `AdminProfile`. Adicionar contadores ao `KnowledgeStats`: `total_babalawo`, `total_iyanifa`, `total_omo_ifa`, `total_sem_ifa`. |
| `src/components/admin/AdminDashboard.tsx` | Adicionar KPI cards e grafico de pizza com distribuicao dos titulos Ifa. |
| `src/components/admin/AdminUsers.tsx` | Mostrar badge com titulo Ifa na tabela de usuarios. |

## Detalhe tecnico

### Migracao SQL

```sql
ALTER TABLE public.user_knowledge ADD COLUMN ifa_status text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN ifa_status text DEFAULT NULL;
```

### Funcao admin_list_profiles (adicionar ao SELECT)

```sql
COALESCE(uk.ifa_status, p.ifa_status) as ifa_status
```

### Funcao admin_get_knowledge_stats (adicionar ao SELECT)

```sql
count(*) FILTER (WHERE ifa_status = 'babalawo') as total_babalawo,
count(*) FILTER (WHERE ifa_status = 'iyanifa') as total_iyanifa,
count(*) FILTER (WHERE ifa_status = 'omo_ifa') as total_omo_ifa,
count(*) FILTER (WHERE ifa_status = 'nao' OR ifa_status IS NULL) as total_sem_ifa
```

### Opcoes no formulario

```text
Babalawo       -> valor: "babalawo"
Iyanifa        -> valor: "iyanifa"
Omo Ifa (Isefa) -> valor: "omo_ifa"
Nao tenho Ifa  -> valor: "nao"
```

### Logica condicional

A pergunta so aparece quando `religion` for `candomble`, `ifa` ou `umbanda`. Se o usuario mudar a religiao para outra, o valor e resetado para `null`.

### Arquivos modificados (8 no total)

1. Migracao SQL (2 ALTER TABLE + 2 funcoes RPC recriadas)
2. `src/hooks/useOnboarding.ts`
3. `src/components/onboarding/OnboardingWizard.tsx`
4. `src/hooks/useProfile.ts`
5. `src/components/profile/ProfileForm.tsx`
6. `src/hooks/useAdminData.ts`
7. `src/components/admin/AdminDashboard.tsx`
8. `src/components/admin/AdminUsers.tsx`
