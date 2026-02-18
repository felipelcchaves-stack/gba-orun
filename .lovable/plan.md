

# Redesign da Pagina Aprender - Sem Duplicacoes + Aba Oferendas

## Problemas identificados

1. **Duplicacao massiva**: A pagina Aprender (`/aprender`) e a pagina Rituais (`/rituais`) sao quase identicas - mesma fonte de dados (`useRituals`), mesmos filtros, mesmo layout de cards. O usuario ve a mesma coisa em dois lugares.
2. **Duas navegacoes sobrepostas na mesma pagina**: Os icones tematicos (THEMED_ICONS) e os chips de filtro (FILTER_CATEGORIES) fazem a mesma coisa - filtrar por categoria. Isso polui a tela.
3. **Icone "Obi" fora de contexto**: Um atalho para o Oraculo dentro de uma pagina de estudo nao faz sentido.
4. **Oferendas ausentes**: O sistema de oferendas (`useOfferings`) existe no codigo mas nao tem aba na pagina.
5. **Visual monotono**: Lista simples sem hierarquia, sem destaque visual por categoria.

## Solucao

Transformar o Aprender em um hub de conteudo com **duas abas** (Rituais e Oferendas), remover duplicacoes internas, e melhorar o visual.

## Estrutura da nova pagina

### 1. Header
- Titulo: **"Aprender"**
- Subtitulo: "Sabedoria ancestral ao seu alcance"

### 2. Tabs (Rituais | Oferendas)
- Usar o componente Tabs do Radix ja instalado
- Visual com fundo suave e indicador ativo em foreground
- Aba "Rituais" como padrao

### 3. Aba Rituais
- **Remover** os THEMED_ICONS (duplicam os chips)
- **Manter** apenas os chips de filtro por categoria (FILTER_CATEGORIES) - simplificados
- Lista de rituais com visual melhorado:
  - Imagem arredondada
  - Titulo, categoria, badges (Premium, Audio)
  - Sem icone Bookmark solto (nao tem funcionalidade de favoritos implementada)

### 4. Aba Oferendas (NOVA)
- Mesmos chips de filtro por categoria (reutilizar)
- Lista de oferendas usando `useOfferings`
- Card similar ao de rituais mas com icone de UtensilsCrossed
- Cada oferenda linka para um reader (por enquanto, abre um dialog/modal com detalhes em Markdown)

### 5. Pagina Rituais (`/rituais`)
- Manter como esta, pois serve como ponto de entrada direto (links do Oraculo apontam para `/rituais?cat=X`)
- Nenhuma mudanca necessaria nela

## Mudancas nos arquivos

| Arquivo | Mudanca |
|---|---|
| `src/pages/Learn.tsx` | Rewrite: adicionar Tabs (Rituais/Oferendas), remover THEMED_ICONS, remover chips duplicados, adicionar aba Oferendas |
| `src/components/learn/OfferingCard.tsx` | Novo: card para exibir oferenda na lista |
| `src/components/learn/OfferingDetailModal.tsx` | Novo: modal para exibir detalhes da oferenda (ingredientes, instrucoes em Markdown) |

## Detalhes tecnicos

### Learn.tsx - Nova estrutura

```text
+---------------------------+
|  Aprender                 |
|  Sabedoria ancestral...   |
+---------------------------+
| [Rituais]  [Oferendas]    |  <-- Tabs
+---------------------------+
| Todos | Oriki | Ibori |.. |  <-- Chips filtro
+---------------------------+
| [img] Titulo do Ritual    |
|       Categoria  Premium  |
+---------------------------+
| [img] Titulo do Ritual 2  |
|       Categoria  Audio    |
+---------------------------+
```

### OfferingCard.tsx
- Exibe: imagem, titulo, categoria, badge premium
- Ao clicar: abre OfferingDetailModal (se free) ou PremiumLockModal (se premium e usuario free)

### OfferingDetailModal.tsx
- Dialog com scroll
- Mostra: titulo, descricao, ingredientes (Markdown), instrucoes (Markdown)
- Player de audio se disponivel

### Hooks reutilizados
- `useRituals` (ja existe)
- `useOfferings` (ja existe)
- `usePremium` (ja existe)

### Nenhuma mudanca no banco de dados

