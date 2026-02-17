
# Plano: Dados Demograficos, Moderacao da Comunidade e Lembrete de Cuidado

Tres melhorias que dao ao admin mais controle e ao usuario uma experiencia mais personalizada.

---

## Parte 1: Novos Campos no Perfil (Genero e Idade)

### O que muda para o usuario
- No formulario de perfil, dois novos campos aparecem: **Genero** (select) e **Data de Nascimento** (input date)
- Esses dados sao opcionais e privados

### Detalhes Tecnicos

**1. Migration SQL**
- Adicionar duas colunas na tabela `profiles`:
  - `gender TEXT NULL` (valores: masculino, feminino, nao_binario, prefiro_nao_dizer)
  - `birth_date DATE NULL` (para calcular idade)
- Atualizar a funcao `admin_list_profiles` para retornar os novos campos
- Atualizar a funcao `admin_get_stats` para incluir contagens por genero e por religiao

**2. ProfileForm.tsx**
- Adicionar campo Select para Genero (Masculino, Feminino, Nao-binario, Prefiro nao dizer)
- Adicionar campo Input type="date" para Data de Nascimento
- Incluir os novos campos no `handleSave`

**3. useProfile.ts**
- Adicionar `gender` e `birth_date` ao tipo `Profile`

**4. useAdminData.ts**
- Adicionar `gender` e `birth_date` ao tipo `AdminProfile`
- Expandir `AdminStats` com `gender_counts` e `religion_counts`

---

## Parte 2: Dashboard Admin com Demograficos

### O que muda para o admin
- KPI cards mostram distribuicao por genero e por religiao
- Tabela de usuarios mostra colunas de Genero e Idade
- Graficos simples de pizza/barra com Recharts mostrando a distribuicao

### Detalhes Tecnicos

**1. AdminDashboard.tsx**
- Adicionar secao "Demografia" com dois graficos Recharts (PieChart):
  - Distribuicao por Genero
  - Distribuicao por Religiao
- Calcular os dados a partir da lista de profiles (ja carregada)

**2. AdminUsers.tsx**
- Adicionar colunas "Genero" e "Idade" na tabela
- Calcular idade a partir de `birth_date`
- Adicionar filtro por genero e religiao alem do filtro premium/gratuito existente

---

## Parte 3: Moderacao da Comunidade no Admin

### O que muda para o admin
- Nova secao "Comunidade" no sidebar do Admin
- Lista todos os posts com autor, conteudo (preview), data e botao de excluir
- Ao clicar num post, expande as respostas com opcao de excluir individualmente
- Contagem total de posts e respostas como KPI no dashboard

### Detalhes Tecnicos

**1. AdminSidebar.tsx**
- Adicionar item "Comunidade" com icone `MessageCircle` ao menu
- Expandir o tipo `AdminSection` para incluir `"community"`

**2. Novo componente: AdminCommunity.tsx**
- Busca todos os posts via `supabase.from("community_posts").select("*")` (admin tem permissao de SELECT via RLS)
- Busca profiles para mapear nomes e avatares
- Lista com: avatar, nome do autor, preview do conteudo (100 chars), data, botao de excluir
- Ao clicar num post, carrega e exibe as respostas com botao de excluir
- Usa os hooks `useDeletePost` e `useDeleteReply` do `useCommunity.ts`

**3. Admin.tsx**
- Adicionar a secao "community" ao render condicional

**4. AdminDashboard.tsx**
- Adicionar KPI "Posts na Comunidade" e "Respostas" ao dashboard
- Buscar contagens via query simples (ou adicionar ao `admin_get_stats`)

**5. Migration SQL**
- Atualizar `admin_get_stats` para incluir `total_posts` e `total_replies`

---

## Parte 4: Lembrete de Cuidado Espiritual

### O que muda para o usuario
- O card "Dia de Cuidado Espiritual" ja existe na Home e funciona bem (`SpiritualCareCard`)
- Nova funcionalidade: **Notificacao do navegador (Web Push simplificado)**
  - Ao definir o dia de cuidado no perfil, o app pede permissao para notificacoes
  - No dia do cuidado, ao abrir o app, aparece um banner toast destacado lembrando
  - Se o navegador suportar, usa a Notification API para enviar um lembrete local

### Detalhes Tecnicos

**1. Hook: useCareReminder.ts**
- Verifica se hoje e o dia de cuidado do usuario
- Se for, dispara um toast especial na primeira visita do dia
- Verifica se o navegador suporta `Notification` API e pede permissao
- Usa `localStorage` para controlar se ja notificou hoje (evitar spam)

**2. ProfileForm.tsx**
- Ao salvar o dia de cuidado, solicitar permissao de notificacao do navegador (`Notification.requestPermission()`)
- Mostrar feedback visual se o usuario aceitou ou nao

**3. App.tsx ou Home.tsx**
- Integrar o hook `useCareReminder` para disparar o lembrete ao entrar no app

**4. Service Worker (PWA)**
- O service worker do PWA ja esta configurado via `vite-plugin-pwa`
- Adicionar logica de periodic sync ou notification scheduling se suportado pelo navegador (fallback: notificacao local ao abrir o app)

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Colunas `gender` e `birth_date` em profiles; atualizar `admin_list_profiles` e `admin_get_stats` |
| `src/hooks/useProfile.ts` | Adicionar novos campos ao tipo |
| `src/components/profile/ProfileForm.tsx` | Campos de genero e data de nascimento |
| `src/hooks/useAdminData.ts` | Expandir tipos com novos campos |
| `src/components/admin/AdminDashboard.tsx` | Graficos demograficos + KPIs comunidade |
| `src/components/admin/AdminUsers.tsx` | Colunas genero e idade + filtros |
| `src/components/admin/AdminSidebar.tsx` | Novo item "Comunidade" |
| `src/components/admin/AdminCommunity.tsx` | Criar: lista de posts e moderacao |
| `src/pages/Admin.tsx` | Adicionar secao community |
| `src/hooks/useCareReminder.ts` | Criar: logica de lembrete local |
| `src/components/profile/ProfileForm.tsx` | Pedir permissao de notificacao |
| `src/pages/Home.tsx` ou `src/App.tsx` | Integrar lembrete |
