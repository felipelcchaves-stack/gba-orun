
# Painel de Recuperacao de Vendas

## O que e
Uma nova secao no painel admin chamada "Recuperacao de Vendas" que lista usuarios que clicaram em promocoes mas nao compraram. Isso permite ao admin identificar leads quentes e fazer follow-up manual (WhatsApp, email, etc).

## Como funciona

### Dados que ja temos
- `promotion_clicks`: registra cada clique com `user_id`, `promotion_id`, `clicked_at` e `converted_at`
- `profiles`: tem o email e nome do usuario
- Se `converted_at` e NULL, o usuario clicou mas nao comprou

### O que sera criado

**1. Nova secao "Recuperacao" no menu lateral do admin**
- Icone de "target" ou "refresh" para representar recuperacao
- Aparece entre "Promocoes" e "Orientacoes" no menu

**2. Componente AdminSalesRecovery**
Uma tela com:
- **Filtros**: por promocao especifica, por periodo (ultimos 7 dias, 30 dias, todos)
- **Tabela principal** com colunas:
  - Nome do usuario
  - Email (para contato)
  - Promocao clicada
  - Data do clique
  - Quantidade de cliques (demonstra nivel de interesse)
  - Status (Nao converteu / Converteu depois)
- **Indicadores no topo**: Total de leads nao convertidos, taxa de conversao geral
- Agrupamento por usuario (se clicou varias vezes, mostra o total de cliques e a promocao mais recente)

**3. Hook useRecoveryLeads**
Busca em `promotion_clicks` fazendo JOIN com `profiles` e `promotions` para trazer nome, email e titulo da promocao. Filtra por `converted_at IS NULL` para mostrar apenas quem nao comprou.

### Detalhes tecnicos

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | Adicionar item "Recuperacao" ao menu |
| `src/components/admin/AdminSalesRecovery.tsx` | Novo componente com tabela e filtros |
| `src/hooks/useRecoveryLeads.ts` | Novo hook para buscar leads nao convertidos |
| `src/pages/Admin.tsx` | Renderizar a nova secao |

### Nao precisa de migracao
Todos os dados necessarios ja existem nas tabelas atuais. A query simplesmente cruza `promotion_clicks` (where converted_at IS NULL) com `profiles` e `promotions`.

### Limitacoes
- O email so estara disponivel se a RPC `admin_list_profiles` for usada, pois o email vem de `auth.users`. A alternativa e criar uma RPC dedicada ou buscar os perfis separadamente e cruzar no frontend.
- Somente usuarios logados que clicaram serao listados (cliques no modo demo nao sao registrados).
