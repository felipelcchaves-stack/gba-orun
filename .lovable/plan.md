

# Categorias Dinamicas + Navegacao por Categorias na Tela Aprender

## Visao Geral

Dois objetivos combinados:
1. **Categorias dinamicas**: Mover as categorias de hardcode para o banco de dados, com CRUD completo no painel admin
2. **Navegacao por categorias**: A tela Aprender mostra categorias como cards com imagem, e ao clicar mostra os itens daquela categoria tambem como cards

## Parte 1: Banco de Dados

### Nova tabela: `categories`

Campos:
- `id` (uuid, PK)
- `key` (text, unico) -- ex: "oriki", "ibori", "ebo"
- `label` (text) -- ex: "Orikis", "Ibori"
- `description` (text) -- ex: "Louvacoes aos Orixas"
- `icon_name` (text) -- nome do icone Lucide (ex: "Sparkles", "Heart")
- `image_url` (text, nullable) -- URL da imagem do banner
- `display_order` (integer, default 0) -- para ordenacao
- `is_active` (boolean, default true) -- para desativar sem excluir
- `created_at` (timestamptz)

RLS: Leitura publica, escrita apenas para admin.

### Migracao de dados

Um INSERT com as 11 categorias atuais sera feito automaticamente, preservando as mesmas keys que ja existem nos campos `category` das tabelas `rituals`, `offerings`, `journey_tasks`, etc. Nenhum dado existente sera perdido.

As imagens hardcoded (ebo-category.jpg, ibori-category.jpg, etc.) serao referenciadas por caminho relativo na coluna `image_url` ate que o admin suba imagens proprias.

## Parte 2: Hook e Lib de Categorias

### Novo hook: `src/hooks/useCategories.ts`
- `useCategories()`: busca todas as categorias ativas, ordenadas por `display_order`
- Cache com `staleTime` alto (5 minutos) para evitar re-fetches desnecessarios
- Exporta funcoes utilitarias: `getCategoryLabel(key)`, `getCategoryImage(key)` que usam os dados do cache

### Atualizar: `src/lib/categories.ts`
- Manter as constantes como **fallback** para quando os dados do banco ainda nao carregaram
- Exportar um mapa de fallback com as mesmas keys para garantir que o app nunca quebre durante o carregamento

## Parte 3: Painel Admin -- CRUD de Categorias

### Nova secao no sidebar: "Categorias" (icone FolderOpen)

Tela com:
- Lista de categorias existentes em formato de tabela/cards
- Cada linha mostra: imagem miniatura, key, label, descricao, ordem, status (ativo/inativo)
- Botoes de acao: Editar, Desativar/Ativar
- Botao "Nova Categoria" no topo
- Formulario modal/inline com todos os campos
- Protecao contra exclusao: categorias com rituais/oferendas vinculados mostram aviso e permitem apenas desativar (nao excluir)
- Reordenacao por campo `display_order`

### Secao admin no sidebar
Adicionar "Categorias" entre "Planos" e "Rituais e Oracoes" no `AdminSidebar.tsx`.

## Parte 4: Tela Aprender -- Navegacao em 2 Niveis

### Nivel 1: Cards de Categoria (visao padrao)
- Remover chips de filtro (CategoryChips)
- Mostrar apenas os cards com imagem das categorias ativas (vindas do banco)
- Cada card: imagem na direita, label + descricao na esquerda, `h-[90px]`, `rounded-2xl`
- Ao clicar: vai para o Nivel 2

### Nivel 2: Itens da Categoria
- Header com botao voltar (ArrowLeft) + nome da categoria
- Lista de rituais/oferendas como cards com imagem (nao lista simples)
- Cada item: `rounded-2xl`, `bg-card`, `h-[80px]`, imagem `w-[80px]` na direita
- Badges de Premium e Audio sobre o card
- Ao clicar: abre o ritual (`/rituais/:id`) ou modal de oferenda

## Parte 5: Atualizacao dos Arquivos Consumidores

Todos os 13+ arquivos que importam de `src/lib/categories.ts` serao atualizados para usar o hook `useCategories()` ou as funcoes utilitarias que consultam os dados do banco. Lista dos principais:

- `src/pages/Learn.tsx` -- cards de categoria + itens
- `src/pages/Rituals.tsx` -- banners e filtros
- `src/pages/Admin.tsx` -- filtros de rituais
- `src/components/admin/AdminRitualForm.tsx` -- select de categoria
- `src/components/admin/FlowWizard.tsx` -- select de categoria nas tarefas
- `src/components/oracle/FlowStepRenderer.tsx` -- imagem e label
- `src/components/journey/JourneyEntryCard.tsx` -- label e imagem
- `src/components/RitualCombobox.tsx` -- agrupamento por categoria
- `src/components/MultiRitualCombobox.tsx` -- agrupamento por categoria
- `src/components/RitualHelpButton.tsx` -- imagem de fallback
- `src/components/learn/OfferingCard.tsx` -- layout de card com imagem

## Detalhes Tecnicos

### Tabela SQL

```text
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'BookOpen',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS: leitura publica, escrita admin
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed com as 11 categorias existentes
INSERT INTO public.categories (key, label, description, icon_name, display_order) VALUES
  ('oriki', 'Orikis', 'Louvacoes aos Orixas', 'Sparkles', 1),
  ('ibori', 'Ibori', 'Cuidados com o Ori', 'Heart', 2),
  ('ebo', 'Ebo', 'Oferendas e limpezas', 'Shield', 3),
  ('oracao_manha', 'Oracoes da Manha', 'Oracoes para iniciar o dia', 'Sunrise', 4),
  ('oracao_noite', 'Oracoes da Noite', 'Oracoes antes de dormir', 'Moon', 5),
  ('oracao_ori', 'Oracoes de Ori', 'Oracoes especificas para o Ori', 'Sun', 6),
  ('oracao_iyami', 'Oracoes de Iyami', 'Oracoes para apaziguar Iyami', 'AlertTriangle', 7),
  ('cantiga', 'Cantigas', 'Cantigas sagradas', 'Music', 8),
  ('egbe_orun', 'Egbe Orun', 'Ancestralidade e comunidade', 'Users', 9),
  ('iyami', 'Iyami', 'Rituais de Iyami Osoronga', 'AlertTriangle', 10),
  ('geral', 'Fundamentos', 'Conteudo geral', 'BookOpen', 11);
```

### Hook useCategories

- Query key: `["categories"]`
- `staleTime`: 5 minutos
- Retorna array de categorias + funcoes helper (`getLabelByKey`, `getImageByKey`)
- Fallback para constantes hardcoded enquanto dados nao carregam

### Componente AdminCategories

- CRUD completo com formulario inline
- Campo de upload de imagem (ou URL)
- Validacao: key so aceita letras minusculas e underscore
- Protecao contra exclusao de categorias em uso (consulta count de rituals + offerings com aquela key)

### Nenhuma alteracao nas tabelas existentes
- As tabelas `rituals`, `offerings`, `journey_tasks`, etc. continuam usando `category text` -- nao sera criada foreign key para manter flexibilidade e retrocompatibilidade

