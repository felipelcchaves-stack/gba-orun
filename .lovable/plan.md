

# Rastreamento de Conversao de Promocoes

## Como funciona hoje
1. Usuario clica numa promocao -> salva em `promotion_clicks` (user_id + promotion_id + clicked_at)
2. Usuario vai pro checkout da Guru (externo)
3. Guru envia webhook de pagamento -> ativa premium

O problema: o webhook da Guru nao sabe qual promocao o usuario clicou. Mas como ja registramos os cliques, podemos **correlacionar** automaticamente.

## Solucao: Atribuicao por ultimo clique

Quando o webhook da Guru confirmar um pagamento, o sistema busca o clique mais recente do usuario (nos ultimos 7 dias) e marca como "convertido".

### 1. Migracao de banco de dados
Adicionar coluna `converted_at` na tabela `promotion_clicks`:

```text
promotion_clicks
  + converted_at  timestamptz  (nullable, default null)
```

### 2. Atualizar o webhook da Guru
No `supabase/functions/guru-webhook/index.ts`, apos ativar o premium do usuario (tanto para usuario novo quanto existente), buscar o clique mais recente daquele email/user_id e marcar como convertido:

```text
-- Buscar clique mais recente (ultimos 7 dias)
SELECT id FROM promotion_clicks
WHERE user_id = <user_id>
  AND converted_at IS NULL
  AND clicked_at > now() - interval '7 days'
ORDER BY clicked_at DESC
LIMIT 1

-- Marcar como convertido
UPDATE promotion_clicks SET converted_at = now() WHERE id = <click_id>
```

### 3. Frontend - Painel Admin (AdminUsers.tsx)
Na tabela de usuarios, ao expandir ou visualizar um usuario, mostrar a promocao que ele converteu (se houver), buscando de `promotion_clicks` onde `converted_at` nao e nulo.

### 4. Frontend - Estatisticas de Promocoes (AdminPromotions.tsx)
Atualizar o card de estatisticas para mostrar nao so "cliques" mas tambem "conversoes" por promocao. Algo como:

```text
Curso de Ebo         45 cliques  |  3 conversoes
Curso de Iyami       32 cliques  |  1 conversao
```

### 5. RLS
A tabela `promotion_clicks` ja tem politica de SELECT para admins e INSERT para o proprio usuario. Precisamos adicionar uma politica de UPDATE para o service_role (usado pelo webhook). Como o webhook ja usa `SUPABASE_SERVICE_ROLE_KEY`, ele bypassa RLS, entao nao precisa de politica adicional.

## Limitacoes
- A atribuicao e por "ultimo clique em 7 dias". Se o usuario clicou numa promocao e comprou outra coisa pela Guru, pode haver falso positivo.
- Se o usuario nao estava logado quando clicou (modo demo), o clique nao sera registrado.
- Isso nao substitui um rastreamento completo de e-commerce, mas da uma visibilidade boa de qual promocao gerou conversao.

## Resumo das alteracoes
| Arquivo | Alteracao |
|---|---|
| Migracao SQL | Adicionar coluna `converted_at` em `promotion_clicks` |
| `supabase/functions/guru-webhook/index.ts` | Marcar ultimo clique como convertido apos pagamento |
| `src/hooks/usePromotions.ts` | Atualizar query de stats para incluir contagem de conversoes |
| `src/components/admin/AdminPromotions.tsx` | Exibir conversoes ao lado dos cliques |
| `src/components/admin/AdminUsers.tsx` | Mostrar promocao convertida no perfil do usuario |
