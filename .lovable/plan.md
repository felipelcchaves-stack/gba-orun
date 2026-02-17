

# Plano: Painel Admin Desktop com Sidebar, Dashboard e Gestao de Usuarios

## Resumo

Transformar a pagina `/admin` de um layout mobile com tabs horizontais para um painel profissional focado em **notebook/desktop**, com menu lateral fixo (sidebar), dashboard com indicadores e gestao de usuarios/assinaturas.

## O Que Vai Mudar

### 1. Layout Desktop com Sidebar

Trocar o layout atual (tabs horizontais, max-w-3xl) por um layout com:
- **Sidebar fixa a esquerda** (~240px) com icones e labels para cada secao
- **Area de conteudo principal** ocupando o resto da tela
- Sem usar o componente BottomNav na rota `/admin`
- A sidebar tera: Dashboard, Usuarios, Rituais, Oraculo, Configuracoes, Importar

### 2. Dashboard (nova secao principal)

A secao inicial ao abrir `/admin` sera um **Dashboard** com cards de indicadores:

| Indicador | Fonte |
|---|---|
| Total de Usuarios | Contagem de `profiles` |
| Usuarios Premium (pagantes) | `profiles` onde `is_premium = true` |
| Usuarios Gratuitos | `profiles` onde `is_premium = false` |
| Consultas ao Oraculo (total) | Contagem de `user_journey` |
| Consultas Hoje | `user_journey` filtrado por data de hoje |
| Rituais Cadastrados | Contagem de `rituals` |

Abaixo dos cards: uma tabela com os **ultimos usuarios cadastrados** (nome, email, religiao, premium sim/nao, data de cadastro).

### 3. Secao "Usuarios" (nova)

Uma pagina de lista de usuarios com:
- Tabela completa: Nome, Email, Religiao, Premium (sim/nao), Dia de Cuidado, Data de Cadastro
- Filtro por status: Todos / Premium / Gratuito
- Badge de cor para status (verde = premium, cinza = gratuito)
- Por ora, dados reais do banco. O "historico de inadimplencia" sera mockup (coluna visual com status fixo)

### 4. Esconder BottomNav no Admin

O `BottomNav` nao aparecera na rota `/admin` -- o admin tera sua propria navegacao pela sidebar.

---

## Migracao de Banco de Dados

Necessaria uma **edge function** (ou query via service role) para listar usuarios, ja que a tabela `profiles` tem RLS restrita ao dono. Vou criar uma **database function** com `SECURITY DEFINER` que so admins podem chamar:

```sql
CREATE FUNCTION admin_list_profiles()
  RETURNS SETOF profiles
  LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT * FROM profiles $$;
```

Com uma RPC call protegida: so funciona se `has_role(auth.uid(), 'admin')`.

Tambem criarei uma funcao para contar stats agregadas (total usuarios, premium, consultas).

---

## Detalhes Tecnicos

### Arquivos a Criar

| Arquivo | Descricao |
|---|---|
| `src/components/admin/AdminSidebar.tsx` | Sidebar fixa com navegacao entre secoes do admin |
| `src/components/admin/AdminDashboard.tsx` | Dashboard com cards KPI e tabela de usuarios recentes |
| `src/components/admin/AdminUsers.tsx` | Lista completa de usuarios com filtros |
| `src/hooks/useAdminData.ts` | Hook para buscar dados administrativos (RPC calls para perfis e stats) |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/pages/Admin.tsx` | Refatorar: layout com sidebar + area de conteudo, adicionar secoes Dashboard e Usuarios |
| `src/components/BottomNav.tsx` | Esconder quando a rota for `/admin` |

### Estrutura do Layout Admin

```text
+------------------+----------------------------------------+
|                  |                                        |
|   SIDEBAR        |   CONTEUDO PRINCIPAL                   |
|                  |                                        |
|   [Logo]         |   Dashboard / Usuarios / Rituais /     |
|   Dashboard      |   Oraculo / Config / Importar          |
|   Usuarios       |                                        |
|   Rituais        |                                        |
|   Oraculo        |                                        |
|   Configuracoes  |                                        |
|   Importar       |                                        |
|                  |                                        |
|   [Sair]         |                                        |
+------------------+----------------------------------------+
```

### Cards do Dashboard

Cada card tera: icone, numero grande, label descritivo e cor de destaque. Usando o componente `Card` do shadcn ja existente.

### Tabela de Usuarios

Usando o componente `Table` do shadcn ja existente. Colunas: Nome, Email, Religiao, Status (badge), Cadastro.

### Database Functions (SQL)

Duas funcoes `SECURITY DEFINER` restritas a admins:

1. `admin_list_profiles()` -- retorna todos os perfis com email do auth.users
2. `admin_get_stats()` -- retorna contagens agregadas (total usuarios, premium, consultas hoje, total consultas)

### Fluxo

1. Admin abre `/admin` -> ve sidebar + dashboard
2. Dashboard carrega stats via `admin_get_stats()` RPC
3. Clica em "Usuarios" na sidebar -> ve tabela completa via `admin_list_profiles()` RPC
4. Filtros de Premium/Gratuito sao client-side sobre os dados ja carregados
5. As secoes existentes (Rituais, Oraculo, Config, Importar) continuam funcionando igual, so mudam de tabs horizontais para itens na sidebar

---

## Resultado Esperado

O admin abre `/admin` no notebook e ve um painel profissional com sidebar fixa, dashboard mostrando KPIs (total usuarios, premium, gratuitos, consultas), tabela de usuarios recentes, e navegacao lateral para todas as secoes de gestao. A experiencia e 100% focada em desktop, sem bottom nav, com uso eficiente do espaco horizontal.

