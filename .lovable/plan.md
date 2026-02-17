
# Painel Completo de Gestao de Usuarios no Admin

## Problema Atual

Hoje a tela de Usuarios no admin so mostra a listagem com filtros e um botao de travar/liberar acesso. Para adicionar um usuario manualmente, foi preciso criar uma edge function temporaria, executar e deletar -- um processo tecnico e inseguro. Nao existe importacao em massa de usuarios nem edicao de dados do perfil pelo admin.

## O que sera implementado

### 1. Adicionar Usuario Manualmente (Formulario)

Um formulario no topo da pagina de Usuarios com campos:
- Email (obrigatorio)
- Senha (obrigatorio, minimo 6 caracteres)
- Nome de exibicao (opcional)
- Marcar como Premium (checkbox)
- Marcar como Admin (checkbox)

Ao salvar, uma edge function segura cria o usuario no sistema de autenticacao, o perfil e opcionalmente a role de admin -- tudo numa unica chamada.

### 2. Importacao de Usuarios em Massa (JSON)

Similar ao importador de rituais que ja existe, mas para usuarios. O admin cola um JSON com uma lista de usuarios:

```text
[
  { "email": "aluno1@email.com", "password": "Senha123", "display_name": "Maria", "is_premium": true },
  { "email": "aluno2@email.com", "password": "Senha456", "display_name": "Joao" }
]
```

A edge function processa cada usuario, criando conta + perfil, e retorna um relatorio de sucesso/falha por email.

### 3. Acoes Expandidas por Usuario

Alem do botao de travar/liberar, cada usuario tera:
- Botao de editar (abre modal com nome, genero, religiao, dia de cuidado, status da assinatura, data de expiracao)
- Botao de excluir (com confirmacao dupla)
- Botao de tornar/remover admin

### 4. Edge Function: admin-manage-users

Uma unica edge function que recebe acoes diferentes:
- `create_single`: cria um usuario
- `create_bulk`: cria varios usuarios de uma vez
- `delete_user`: remove usuario do sistema de autenticacao
- `toggle_admin`: adiciona ou remove role de admin

Essa funcao valida que quem esta chamando e admin antes de executar qualquer acao.

## Alteracoes por arquivo

| Arquivo | Acao |
|---|---|
| `supabase/functions/admin-manage-users/index.ts` | Nova edge function para criar, importar em massa, excluir e gerenciar roles |
| `supabase/config.toml` | Registrar a nova edge function com verify_jwt = false |
| `src/components/admin/AdminUsers.tsx` | Reescrever com formulario de criacao, importador JSON, acoes expandidas e modal de edicao |
| `src/hooks/useAdminData.ts` | Sem alteracao (ja tem o que precisa) |

## Detalhes Tecnicos

### Edge Function: admin-manage-users

Responsabilidades:

**create_single / create_bulk:**
- Usa `supabase.auth.admin.createUser()` com `email_confirm: true`
- Cria registro em `profiles` com `display_name`, `is_premium`, `subscription_status`
- Se marcado como admin, insere em `user_roles`
- Para bulk, processa em loop e retorna relatorio: `{ success: [...], failed: [...] }`

**delete_user:**
- Usa `supabase.auth.admin.deleteUser()` para remover da autenticacao
- Os registros em `profiles`, `user_roles`, etc. sao removidos automaticamente pelo `ON DELETE CASCADE`

**toggle_admin:**
- Verifica se ja tem role admin: se sim, remove; se nao, insere

**Seguranca:**
- Extrai o token JWT do header Authorization
- Verifica se o usuario que esta chamando tem role admin usando `has_role()`
- Usa `SUPABASE_SERVICE_ROLE_KEY` apenas para operacoes de auth admin

### AdminUsers.tsx - Novo Layout

A pagina tera 3 secoes visiveis:

1. **Barra de acoes**: Botao "Adicionar Usuario" e "Importar em Massa" no topo
2. **Formulario colapsavel**: Abre ao clicar em "Adicionar Usuario" com os campos listados acima
3. **Importador colapsavel**: Abre ao clicar em "Importar em Massa" com textarea para JSON
4. **Tabela de usuarios**: A tabela existente com colunas extras de acoes

Cada linha da tabela tera um menu de acoes (dropdown) com:
- Editar perfil
- Liberar/Travar premium
- Tornar/Remover admin
- Excluir usuario

### Modal de Edicao

Ao clicar em "Editar", abre um Dialog com:
- Nome de exibicao
- Genero (select)
- Religiao (select)
- Dia de cuidado (select com dias da semana)
- Status da assinatura (select: free, active, overdue, cancelled)
- Data de expiracao (input date)
- Salvamento direto na tabela profiles via Supabase client

## Fluxo de Uso

```text
Admin abre painel > Usuarios
         |
    +---------+---------+
    |         |         |
  Adicionar  Importar  Tabela
  manual     em massa  existente
    |         |         |
  Preenche   Cola JSON  Ve lista
  formulario            com acoes
    |         |         |
  Edge fn    Edge fn   Editar/Excluir/
  cria 1     cria N    Toggle Admin
  usuario    usuarios
    |         |         |
  Tabela atualiza automaticamente
```

## Resultado Esperado

1. O admin pode criar qualquer usuario direto pelo painel, sem precisar de intervencao tecnica
2. Pode importar dezenas/centenas de usuarios de uma vez colando um JSON
3. Pode editar dados de qualquer usuario (nome, genero, religiao, assinatura)
4. Pode promover ou rebaixar admins
5. Pode excluir usuarios que nao deveriam estar no sistema
6. Todas as acoes sao protegidas -- so admins autenticados podem executar
