

# Implementar campo "Status em Ifa" (continuacao do plano aprovado)

O plano ja foi aprovado anteriormente. Aqui esta o resumo completo para execucao imediata.

## 1. Migracao SQL

Adicionar coluna `ifa_status text DEFAULT NULL` nas tabelas `user_knowledge` e `profiles`. Recriar as funcoes RPC `admin_list_profiles` e `admin_get_knowledge_stats` para incluir o novo campo e estatisticas.

```sql
ALTER TABLE public.user_knowledge ADD COLUMN ifa_status text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN ifa_status text DEFAULT NULL;
```

Recriar `admin_list_profiles` adicionando `COALESCE(uk.ifa_status, p.ifa_status) as ifa_status` ao SELECT e ao RETURNS TABLE.

Recriar `admin_get_knowledge_stats` adicionando contadores:
- `total_babalawo`
- `total_iyanifa`
- `total_omo_ifa`
- `total_sem_ifa`

## 2. Hook de Onboarding (`src/hooks/useOnboarding.ts`)

- Adicionar `ifa_status: string | null` ao tipo `UserKnowledge`
- Salvar `ifa_status` tanto em `user_knowledge` quanto em `profiles`

## 3. Wizard de Onboarding (`src/components/onboarding/OnboardingWizard.tsx`)

- Adicionar estado `ifaStatus`
- No Step 1, mostrar pergunta condicional "Voce tem Ifa?" com 4 opcoes (Babalawo, Iyanifa, Omo Ifa/Isefa, Nao tenho Ifa) -- so aparece se religiao for `candomble`, `ifa` ou `umbanda`
- Passar `ifa_status` ao `saveOnboarding`

## 4. Hook de Perfil (`src/hooks/useProfile.ts`)

- Adicionar `ifa_status: string | null` ao tipo `Profile`
- Adicionar `ifa_status` ao `useUpdateProfile`

## 5. Formulario de Perfil (`src/components/profile/ProfileForm.tsx`)

- Adicionar estado `ifaStatus` e Select com as 4 opcoes
- Visivel apenas quando religiao for `candomble`, `ifa` ou `umbanda`
- Incluir no `handleSave`

## 6. Hook Admin (`src/hooks/useAdminData.ts`)

- Adicionar `ifa_status: string | null` ao `AdminProfile`
- Adicionar `total_babalawo`, `total_iyanifa`, `total_omo_ifa`, `total_sem_ifa` ao `KnowledgeStats`

## 7. Dashboard Admin (`src/components/admin/AdminDashboard.tsx`)

- Adicionar grafico de pizza com distribuicao dos titulos Ifa
- Adicionar barra "Ifa" ao grafico de lacunas de conhecimento

## 8. Tabela Admin Users (`src/components/admin/AdminUsers.tsx`)

- Mostrar badge com titulo Ifa na coluna de conhecimento
- Adicionar filtro "Nao tem Ifa" no dropdown de filtros

## Opcoes no formulario

| Label | Valor |
|---|---|
| Babalawo | `babalawo` |
| Iyanifa | `iyanifa` |
| Omo Ifa (Isefa) | `omo_ifa` |
| Nao tenho Ifa | `nao` |

## Logica condicional

A pergunta so aparece quando `religion` esta em `['candomble', 'ifa', 'umbanda']`. Se mudar para outra religiao, o valor reseta para `null`.

## Arquivos modificados (8 no total)

1. Migracao SQL (2 ALTER TABLE + 2 funcoes RPC)
2. `src/hooks/useOnboarding.ts`
3. `src/components/onboarding/OnboardingWizard.tsx`
4. `src/hooks/useProfile.ts`
5. `src/components/profile/ProfileForm.tsx`
6. `src/hooks/useAdminData.ts`
7. `src/components/admin/AdminDashboard.tsx`
8. `src/components/admin/AdminUsers.tsx`
