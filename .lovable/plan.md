

# Posts Fixados pelo Admin ("Recado do Oluwo")

## O que sera implementado

O admin podera fixar posts no topo do feed da comunidade. Posts fixados aparecem com visual diferenciado (borda dourada, icone de pin, label "Recado do Oluwo") e ficam sempre no topo, separados do feed cronologico.

## Mudancas no banco de dados

Adicionar coluna `is_pinned` na tabela `community_posts`:

```text
ALTER TABLE community_posts ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
```

Nenhuma tabela nova. A policy de UPDATE existente ja permite que admins modifiquem posts (via RLS "Users can update own posts"). Porem, como o admin precisa fixar posts de OUTROS usuarios, sera necessario adicionar uma policy de UPDATE para admins:

```text
CREATE POLICY "Admins can update any post"
ON community_posts FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
```

## Mudancas nos arquivos

### 1. `src/hooks/useCommunity.ts`
- Adicionar `is_pinned` na interface `CommunityPost`
- No `usePosts`, ordenar posts fixados primeiro (is_pinned DESC, created_at DESC)
- Criar hook `useTogglePin` que faz UPDATE do campo `is_pinned` no post

### 2. `src/components/community/CommunityPost.tsx`
- Se `post.is_pinned === true`, renderizar visual diferenciado:
  - Borda dourada (border-2 border-yellow-500/60)
  - Badge "Recado do Oluwo" com icone Pin no topo
  - Background levemente dourado (bg-yellow-50/30 dark:bg-yellow-900/10)
- Se o usuario e admin, mostrar botao de pin/unpin ao lado do botao de deletar

### 3. `src/pages/Community.tsx`
- Separar posts fixados dos normais no feed
- Posts fixados aparecem primeiro, em secao propria com label sutil
- Posts normais aparecem abaixo

### 4. `src/components/admin/AdminCommunity.tsx`
- Adicionar coluna "Fixado" na tabela
- Adicionar botao de toggle pin (icone Pin) ao lado do botao de deletar
- Posts fixados aparecem com indicador visual na tabela

## Resultado esperado

- Admin pode fixar/desfixar posts tanto pelo feed da comunidade quanto pelo painel admin
- Posts fixados aparecem sempre no topo com visual dourado e label "Recado do Oluwo"
- Maximo de posts fixados: sem limite tecnico, mas visualmente ficam destacados no topo
- Usuarios comuns veem os posts fixados mas nao podem fixar/desfixar

**Total: 1 coluna nova, 1 policy nova, 4 arquivos modificados**

