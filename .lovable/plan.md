

# Cadastro Completo das Caidas do Obi (CRUD)

## O que sera feito

Criar uma tela completa no painel admin para gerenciar as caidas do Obi (tabela `oracle_configs`), permitindo visualizar, editar, criar novas e excluir. As 5 caidas existentes (Apotaku, Okaran, Ejikorere, Etaiwa, Alafia) serao preservadas com os nomes que voce ja alterou.

## Alteracoes

### 1. Hook: `src/hooks/useOracleConfig.ts`
Adicionar duas mutations que estao faltando:
- `useCreateOracleConfig` -- insere um novo registro na tabela `oracle_configs`
- `useDeleteOracleConfig` -- deleta um registro pelo `id`

### 2. Novo componente: `src/components/admin/AdminOracleConfigs.tsx`
Tela CRUD completa com:
- **Lista** de todas as caidas, ordenadas por `display_order`, mostrando nome, result_key, cor e ordem
- **Botao "Nova Caida"** que abre formulario de criacao
- **Botao de Editar** em cada item, abrindo formulario preenchido
- **Botao de Excluir** em cada item, com confirmacao

O formulario (inline ou modal) tera os campos:
- `name` (ex: "Alafia")
- `result_key` (ex: "alafia") -- identificador tecnico
- `meaning` (ex: "Todos abertos -- PAZ")
- `description_ire` e `description_ibi` -- textos para cada cenario
- `default_ire_ibi` -- select com "ire" ou "ibi"
- `color_type` -- select com opcoes (success, warning, danger, accent)
- `guidance_message` -- orientacao do mascote
- `guidance_audio_url` -- URL de audio (opcional)
- `display_order` -- numero de ordenacao

### 3. Sidebar: `src/components/admin/AdminSidebar.tsx`
Adicionar item "Caidas do Obi" no menu, com icone `Dices` ou `Sparkles`, usando uma nova section key `oracle_configs`.

### 4. Pagina Admin: `src/pages/Admin.tsx`
Adicionar renderizacao de `AdminOracleConfigs` quando `activeSection === "oracle_configs"`.

## Detalhes tecnicos

- Nenhuma mudanca no banco de dados -- a tabela `oracle_configs` ja tem todos os campos necessarios e RLS configurado para admins
- O tipo `AdminSection` sera estendido com `"oracle_configs"`
- Os dados existentes serao preservados intactos
- 4 arquivos modificados/criados

