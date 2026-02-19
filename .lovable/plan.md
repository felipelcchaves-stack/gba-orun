

# Correcoes: Dashboard para Usuarios Gratuitos + Tela de Cadastro Ire/Ibi

## Problema 1: Dashboard mostra receita e inadimplencia sem assinantes

O dashboard exibe os cards "Inadimplentes" e "Previsao Receita/Mes" mesmo quando so existem usuarios gratuitos, mostrando R$ 0,00 e 0 inadimplentes. Alem disso, ao desativar o premium manualmente no painel de usuarios (`togglePremium`), o status muda para `"overdue"` -- isso esta errado para quem nunca pagou. Deveria voltar para `"free"`.

### Solucao

**Arquivo: `src/components/admin/AdminDashboard.tsx`**
- Condicionar os cards "Inadimplentes" e "Previsao Receita/Mes": so exibir quando existir pelo menos 1 usuario com `subscription_status` diferente de `"free"` (ou seja, alguem que ja foi ou e assinante)

**Arquivo: `src/components/admin/AdminUsers.tsx` (linha ~167)**
- Corrigir `togglePremium`: ao desativar premium, verificar se o usuario possui `subscription_plan_id` ou `guru_subscription_id`. Se nao possui (nunca foi assinante pago), definir status como `"free"` em vez de `"overdue"`

**Arquivo: `src/components/home/SubscriptionBanner.tsx`**
- Adicionar protecao: so exibir banner de "Acesso suspenso" (overdue) se o usuario tiver `subscription_expires_at` preenchido, indicando que ja teve uma assinatura real

**Arquivo: `src/hooks/usePremium.ts`**
- Incluir `subscription_plan_id` e `guru_subscription_id` na query para poder verificar se o usuario ja teve assinatura antes de mostrar como overdue

## Problema 2: Cadastro de tipos Ire/Ibi sumiu

O hook `useIreIbiTypes.ts` existe com CRUD completo, mas nao ha nenhuma tela no admin para gerenciar esses tipos. Nunca houve uma secao dedicada no sidebar para isso.

### Solucao

**Novo arquivo: `src/components/admin/AdminIreIbiTypes.tsx`**
- Criar tela completa de CRUD para os tipos de Ire e Ibi, com:
  - Lista separada por categoria (Ire / Ibi)
  - Formulario para criar/editar com campos: nome, descricao, categoria (ire/ibi), ordem, ativo, mensagem de orientacao, audio URL, ritual vinculado, oferenda vinculada
  - Botoes de editar, excluir, ativar/desativar
  - Usar os hooks existentes: `useAllIreIbiTypes`, `useCreateIreIbiType`, `useUpdateIreIbiType`, `useDeleteIreIbiType`

**Arquivo: `src/components/admin/AdminSidebar.tsx`**
- Adicionar entrada "Ire/Ibi" no sidebar (nova section `"ire_ibi"`) com icone `ArrowUpDown`
- Atualizar o tipo `AdminSection` para incluir `"ire_ibi"`

**Arquivo: `src/pages/Admin.tsx`**
- Importar e renderizar `AdminIreIbiTypes` quando `activeSection === "ire_ibi"`

## Detalhes Tecnicos

### AdminDashboard.tsx - Cards condicionais

```typescript
const hasAnySubscriber = profiles?.some(p =>
  p.subscription_status === "active" ||
  p.subscription_status === "overdue" ||
  p.subscription_status === "cancelled"
) ?? false;

const KPI_CARDS = [
  { label: "Total de Usuarios", ... },
  { label: "Assinantes Ativos", ... },
  ...(hasAnySubscriber ? [
    { label: "Inadimplentes", ... },
    { label: "Previsao Receita/Mes", ... },
  ] : []),
  // demais cards mantidos
];
```

### AdminUsers.tsx - togglePremium corrigido

```typescript
const togglePremium = async (userId: string, currentPremium: boolean) => {
  const newPremium = !currentPremium;
  const profile = profiles?.find(p => p.user_id === userId);
  const hadSubscription = profile?.subscription_plan_id || profile?.guru_subscription_id;
  const newStatus = newPremium ? "active" : (hadSubscription ? "overdue" : "free");
  // ...
};
```

### usePremium.ts - Protecao contra falso inadimplente

```typescript
// Na query, incluir subscription_plan_id e guru_subscription_id
// Se status === "overdue" mas nao tem plan_id nem guru_id, tratar como "free"
```

### AdminIreIbiTypes.tsx - Estrutura da tela

- Tabela/cards com todos os tipos cadastrados
- Formulario inline ou modal para criar/editar
- Campos: nome, descricao, categoria (select: ire/ibi), display_order, is_active (switch), guidance_message (textarea), guidance_audio_url, ritual_id (combobox), offering_id (combobox)
- Usa os hooks ja existentes em `useIreIbiTypes.ts`

### Arquivos modificados:
- `src/components/admin/AdminDashboard.tsx`: cards condicionais
- `src/components/admin/AdminUsers.tsx`: correcao togglePremium
- `src/components/home/SubscriptionBanner.tsx`: protecao overdue
- `src/hooks/usePremium.ts`: incluir campos de assinatura na query
- `src/components/admin/AdminSidebar.tsx`: nova entrada "Ire/Ibi"
- `src/pages/Admin.tsx`: renderizar AdminIreIbiTypes
- **Novo:** `src/components/admin/AdminIreIbiTypes.tsx`: tela CRUD completa

Nenhuma mudanca no banco de dados -- a tabela `ire_ibi_types` ja existe com todas as colunas necessarias.

