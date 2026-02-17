

# Plano: Segmentacao Inteligente de Promocoes por Conhecimento do Usuario

## Problema Atual

Hoje, todas as promocoes ativas aparecem para todos os usuarios, sem nenhum filtro. O admin nao consegue direcionar uma promocao de "Curso de Obi" apenas para quem **nao sabe** jogar Obi, nem forcar uma promocao de Black Friday para todos.

## Solucao

Adicionar duas novas colunas na tabela `promotions`:

- `target_knowledge_gaps`: array de texto indicando quais "lacunas de conhecimento" o usuario precisa ter para ver a promocao (ex: `["obi", "ebo"]` = so mostra para quem NAO sabe Obi OU NAO sabe Ebo)
- `force_show_all`: booleano que, quando `true`, ignora qualquer filtro e mostra para todos (caso Black Friday)

A filtragem acontece no frontend, cruzando os dados de `user_knowledge` do usuario logado com os `target_knowledge_gaps` de cada promocao.

## Como funciona a logica

```text
Para cada promocao ativa:
  1. Se force_show_all = true -> MOSTRA para todos
  2. Se target_knowledge_gaps esta vazio/null -> MOSTRA para todos (comportamento atual)
  3. Se target_knowledge_gaps tem valores -> so MOSTRA se o usuario
     NAO sabe pelo menos um dos topicos listados

Exemplo:
  - Promo "Curso de Obi" com target_knowledge_gaps = ["obi"]
    -> So aparece para quem knows_obi = false

  - Promo "Black Friday" com force_show_all = true
    -> Aparece para todos, independente do conhecimento

  - Promo "Pacote Completo" com target_knowledge_gaps = ["obi", "ori", "ebo"]
    -> Aparece para quem nao sabe pelo menos um dos tres
```

## Alteracoes Planejadas

### 1. Migracao SQL

Adicionar duas colunas na tabela `promotions`:

```text
ALTER TABLE public.promotions
  ADD COLUMN target_knowledge_gaps text[] NOT NULL DEFAULT '{}',
  ADD COLUMN force_show_all boolean NOT NULL DEFAULT false;
```

- `target_knowledge_gaps`: array de texto com valores possiveis: `obi`, `ebo`, `ori`, `iyami`, `egbe_orun`
- `force_show_all`: boolean, default false

Nenhuma tabela nova. Nenhuma mudanca de RLS (as policies existentes ja cobrem).

### 2. Hook usePromotions.ts

- Atualizar a interface `Promotion` com os dois novos campos
- Criar um novo hook `useTargetedPromotions()` que:
  - Busca todas as promocoes ativas
  - Busca o `user_knowledge` do usuario logado
  - Filtra no frontend: retorna apenas as promocoes que o usuario deve ver
- Atualizar `useHomeBannerPromotion()` para tambem respeitar a segmentacao
- Manter `usePromotions()` sem filtro (usado pelo admin)

### 3. Pagina Promotions.tsx

- Trocar `usePromotions(true)` por `useTargetedPromotions()`
- O resto da UI nao muda

### 4. Componente PromoBanner.tsx

- Usar a logica de segmentacao para o banner da Home tambem
- Buscar `user_knowledge` e verificar se o promo da Home passa no filtro

### 5. Admin - AdminPromotions.tsx

- Adicionar ao formulario:
  - Checkboxes para selecionar os "gaps de conhecimento" alvo (Obi, Ebo, Ori, Iyami, Egbe Orun)
  - Switch "Forcar para todos" (force_show_all)
- Na tabela de listagem, mostrar uma coluna "Publico" indicando se e segmentada ou para todos
- Atualizar o form state com os novos campos

## Detalhes Tecnicos

### Migracao SQL

```text
ALTER TABLE public.promotions
  ADD COLUMN target_knowledge_gaps text[] NOT NULL DEFAULT '{}',
  ADD COLUMN force_show_all boolean NOT NULL DEFAULT false;
```

### Hook useTargetedPromotions

```text
export const useTargetedPromotions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["promotions", "targeted", user?.id],
    queryFn: async () => {
      // 1. Buscar promocoes ativas
      const { data: promos } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      // 2. Se nao logado, retornar so as force_show_all ou sem filtro
      if (!user) {
        return promos?.filter(p =>
          p.force_show_all || !p.target_knowledge_gaps?.length
        );
      }

      // 3. Buscar conhecimento do usuario
      const { data: knowledge } = await supabase
        .from("user_knowledge")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // 4. Filtrar
      return promos?.filter(p => {
        if (p.force_show_all) return true;
        if (!p.target_knowledge_gaps?.length) return true;
        // Mostra se usuario NAO sabe pelo menos um dos topicos
        const knowledgeMap = {
          obi: knowledge?.knows_obi,
          ebo: knowledge?.knows_ebo,
          ori: knowledge?.knows_ori,
          iyami: knowledge?.knows_iyami,
          egbe_orun: knowledge?.knows_egbe_orun,
        };
        return p.target_knowledge_gaps.some(
          gap => !knowledgeMap[gap]
        );
      });
    },
  });
};
```

### Formulario Admin - Novos campos

```text
Secao "Segmentacao":

[x] Obi    [ ] Ebo    [x] Ori    [ ] Iyami    [ ] Egbe Orun
   "Mostra so para quem NAO sabe os topicos marcados"

[ ] Forcar para todos (ignora segmentacao - ex: Black Friday)
```

### Coluna "Publico" na tabela admin

```text
| Titulo          | Status | Publico              | ...
| Curso de Obi    | Ativa  | Nao sabe: Obi        |
| Black Friday    | Ativa  | Todos (forcado)       |
| Pacote Completo | Ativa  | Nao sabe: Obi,Ori,Ebo|
| Promo generica  | Ativa  | Todos                 |
```

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Adicionar `target_knowledge_gaps` e `force_show_all` na tabela `promotions` |
| `src/hooks/usePromotions.ts` | Atualizar interface, criar `useTargetedPromotions()`, atualizar `useHomeBannerPromotion()` |
| `src/pages/Promotions.tsx` | Usar `useTargetedPromotions()` ao inves de `usePromotions(true)` |
| `src/components/home/PromoBanner.tsx` | Aplicar filtro de segmentacao no banner da Home |
| `src/components/admin/AdminPromotions.tsx` | Adicionar checkboxes de gaps + switch force_show_all no formulario e coluna na tabela |

## Resultado Esperado

1. Admin cria promocao "Curso de Obi" com gap = `["obi"]` -> so aparece para quem nao sabe Obi
2. Admin cria promocao "Black Friday" com `force_show_all = true` -> aparece para todos
3. Admin cria promocao sem nenhum gap marcado -> aparece para todos (comportamento atual preservado)
4. Banner da Home tambem respeita a segmentacao

