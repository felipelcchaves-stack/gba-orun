

# Plano: Limpar Home e Criar Banner de Ofertas Condicional

## Problema

A Home tem 3 icones de acesso rapido (Oraculo, Jornada, Ofertas) que sao redundantes com a barra inferior. Alem disso, "Ofertas" deveria aparecer como um banner visual atraente, e somente quando existir alguma oferta ativa com um check especifico habilitado pelo admin.

---

## Solucao

### 1. Remover os icones de acesso rapido

Eliminar o bloco `QUICK_ACCESS` (Oraculo, Jornada, Ofertas) da Home. A navegacao ja esta coberta pela barra inferior.

**Arquivo:** `src/pages/Home.tsx`
- Remover a constante `QUICK_ACCESS` (linhas 16-20)
- Remover o bloco JSX de renderizacao dos icones (linhas 87-108)

---

### 2. Novo campo `show_on_home` na tabela `promotions`

Adicionar uma coluna booleana para o admin controlar quais ofertas aparecem como banner na Home.

```text
ALTER TABLE public.promotions
  ADD COLUMN show_on_home BOOLEAN NOT NULL DEFAULT false;
```

Isso permite que o admin marque especificamente quais promocoes devem virar banner na Home, independente de estarem ativas na pagina de Ofertas.

---

### 3. Componente `PromoBanner`

Novo componente: `src/components/home/PromoBanner.tsx`

- Busca promocoes onde `is_active = true` AND `show_on_home = true`
- Se nenhuma existir, retorna `null` (nao ocupa espaco)
- Se existir uma ou mais, exibe um banner horizontal atraente com:
  - Imagem do banner (se houver) como fundo
  - Titulo e descricao da oferta
  - Botao "Ver Oferta" que leva para `/promocoes` ou abre o link direto
  - Indicador visual (badge "Oferta") no canto
  - Se houver multiplas, exibe apenas a primeira (maior prioridade por `display_order`)
- Rastreia cliques usando o hook `useTrackClick` existente

**Posicao na Home:** Logo abaixo do `SpiritualCareCard`, antes do `SpiritualEnergyDashboard` -- um local de destaque natural.

---

### 4. Atualizar Admin de Promocoes

**Arquivo:** `src/components/admin/AdminPromotions.tsx`

- Adicionar um toggle "Exibir na Home" (`show_on_home`) no formulario de criacao/edicao
- Exibir na tabela de listagem um indicador de quais promocoes estao com banner ativo na Home

---

### 5. Atualizar hook e tipos

**Arquivo:** `src/hooks/usePromotions.ts`

- Adicionar `show_on_home` na interface `Promotion`
- Criar hook `useHomeBannerPromotion()` que busca a primeira promocao ativa com `show_on_home = true`

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | ADD COLUMN `show_on_home` em `promotions` |
| `src/pages/Home.tsx` | Remover `QUICK_ACCESS`; inserir `PromoBanner` |
| `src/components/home/PromoBanner.tsx` | Criar: banner condicional de ofertas |
| `src/hooks/usePromotions.ts` | Adicionar campo e hook `useHomeBannerPromotion` |
| `src/components/admin/AdminPromotions.tsx` | Adicionar toggle "Exibir na Home" |

## Fluxo

```text
1. Admin cria promocao "Curso de Ebo" -> marca "Exibir na Home" = ON
2. Usuario abre o app -> banner atraente aparece na Home
3. Usuario clica -> vai para a pagina de Ofertas (ou checkout direto)
4. Admin desliga o check -> banner some instantaneamente da Home
5. Sem ofertas ativas na Home -> nenhum banner, layout limpo
```
