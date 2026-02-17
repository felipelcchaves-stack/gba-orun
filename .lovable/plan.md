

# Plano: Cadastro de Oferendas com Link nas Tarefas do Oraculo

## O que e

Criar um sistema completo de cadastro de **Oferendas** (ebo, ipese, oferendas ao Egbe Orun, Iyami, Ori, etc.) que pode ser vinculado as tarefas geradas pelo Oraculo. Hoje, as tarefas so mostram titulo e um ritual/reza opcional. Com oferendas cadastradas, o admin pode especificar exatamente qual oferenda fazer para cada tarefa.

## Estrutura

### 1. Nova tabela `offerings`

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid | PK |
| title | text | Nome da oferenda (ex: "Ebo de Limpeza com Ovo") |
| description | text | Descricao curta |
| ingredients | text | Lista de ingredientes em texto/markdown |
| instructions | text | Modo de preparo/execucao em markdown |
| category | text | Categoria (ebo, ibori, egbe_orun, iyami, oracao_ori, geral) |
| is_premium | boolean | Se e conteudo premium |
| audio_url | text (null) | Audio opcional com instrucoes |
| image_url | text (null) | Foto da oferenda |
| display_order | integer | Ordem de exibicao |
| created_at | timestamptz | Data de criacao |

RLS: Leitura publica, escrita apenas admin (mesmo padrao de `rituals`).

### 2. Nova coluna em `oracle_task_templates`

Adicionar `offering_id` (uuid, nullable) na tabela `oracle_task_templates` para vincular uma oferenda a cada tarefa sugerida.

### 3. Nova coluna em `journey_tasks`

Adicionar `offering_id` (uuid, nullable) na tabela `journey_tasks` para salvar qual oferenda foi vinculada quando o usuario salva a rotina.

### 4. Admin - Nova secao "Oferendas"

- Nova secao no sidebar do admin
- CRUD completo: criar, editar, excluir oferendas
- Campos: titulo, descricao, ingredientes (textarea markdown), instrucoes (textarea markdown), categoria, premium, audio, imagem, ordem
- Listagem com filtro por categoria

### 5. Admin - Tarefas do Oraculo

- Adicionar campo "Oferenda vinculada" no formulario de tarefas (AdminOracleTaskTemplates), ao lado do "Ritual Linkado"
- Select/combobox com as oferendas cadastradas

### 6. Diagnostico (StepDiagnosis)

- Mostrar a oferenda vinculada em cada tarefa (titulo + botao para expandir detalhes)
- Permitir trocar a oferenda manualmente via combobox (mesmo padrao do RitualCombobox)
- Salvar o `offering_id` junto com a tarefa no `journey_tasks`

### 7. Jornada (Journey)

- Exibir a oferenda vinculada em cada tarefa da jornada
- Botao para ver detalhes da oferenda (ingredientes, instrucoes)

## Alteracoes por arquivo

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabela `offerings`, adicionar `offering_id` em `oracle_task_templates` e `journey_tasks` |
| `src/hooks/useOfferings.ts` | Novo hook: CRUD de oferendas |
| `src/components/admin/AdminOfferings.tsx` | Novo componente: CRUD admin de oferendas |
| `src/components/admin/AdminSidebar.tsx` | Adicionar secao "Oferendas" no menu |
| `src/pages/Admin.tsx` | Renderizar AdminOfferings na secao correspondente |
| `src/components/admin/AdminOracleTaskTemplates.tsx` | Adicionar campo "Oferenda vinculada" no form |
| `src/components/OfferingCombobox.tsx` | Novo combobox para selecionar oferendas |
| `src/components/oracle/StepDiagnosis.tsx` | Mostrar oferenda em cada tarefa + combobox + salvar offering_id |
| `src/hooks/useJourney.ts` | Atualizar para incluir offering_id ao criar tasks |
| `src/components/journey/JourneyEntryCard.tsx` | Exibir oferenda vinculada |

## Detalhes Tecnicos

### Migration SQL

```text
-- Tabela de oferendas
CREATE TABLE public.offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  ingredients text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'geral',
  is_premium boolean NOT NULL DEFAULT false,
  audio_url text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offerings are publicly readable"
  ON public.offerings FOR SELECT USING (true);

CREATE POLICY "Admins can manage offerings"
  ON public.offerings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Coluna em oracle_task_templates
ALTER TABLE public.oracle_task_templates
  ADD COLUMN offering_id uuid REFERENCES public.offerings(id) ON DELETE SET NULL;

-- Coluna em journey_tasks
ALTER TABLE public.journey_tasks
  ADD COLUMN offering_id uuid REFERENCES public.offerings(id) ON DELETE SET NULL;
```

### Hook useOfferings

```text
// Padrao identico ao useRituals
export interface Offering {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  category: string;
  is_premium: boolean;
  audio_url: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export const useOfferings = () => useQuery(...)
export const useCreateOffering = () => useMutation(...)
export const useUpdateOffering = () => useMutation(...)
export const useDeleteOffering = () => useMutation(...)
```

### OfferingCombobox

Mesmo padrao visual do RitualCombobox, mas busca da tabela `offerings`. Aceita prop `filterCategory` para filtrar por categoria.

### StepDiagnosis - Exibicao da oferenda

Cada card de tarefa mostra:
- Titulo da tarefa (ja existe)
- Oferenda vinculada (novo): nome + botao "Ver detalhes"
- Ao clicar "Ver detalhes": expande mostrando ingredientes e instrucoes em markdown
- Combobox para trocar a oferenda (mesmo padrao do ritual)

## Resultado Esperado

1. Admin cadastra oferendas com ingredientes e instrucoes detalhadas
2. Admin vincula oferendas as tarefas do Oraculo (templates)
3. Quando o usuario faz uma consulta, cada tarefa ja vem com a oferenda sugerida
4. Usuario pode trocar a oferenda antes de salvar
5. A oferenda fica salva na jornada para consulta futura

