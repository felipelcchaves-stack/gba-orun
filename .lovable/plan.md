

# Plano: Cadastro de Ire/Ibi + Novo Step no Oraculo

## Problema Atual

Hoje, quando o usuario seleciona o resultado do Obi (ex: Ejife), o sistema pula direto pro Ebo usando um campo `default_ire_ibi` fixo da tabela `oracle_configs`. O usuario nunca escolhe se veio em Ire ou Ibi, e nao ve descricoes sobre os tipos de Ire/Ibi. Ja existe um componente `StepIreIbi.tsx` basico, mas ele nao esta no fluxo e nao tem dados cadastraveis.

## O que sera construido

### 1. Tabela `ire_ibi_types` no banco de dados

Armazena os tipos de Ire e Ibi com descricoes que o admin cadastra.

```text
CREATE TABLE public.ire_ibi_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('ire', 'ibi')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais de exemplo:
-- Ire: Ire Aiku (saude), Ire Aje (prosperidade), Ire Omo (filhos), Ire Aya/Oko (casamento)
-- Ibi: Ibi Iku (morte), Ibi Arun (doenca), Ibi Ofo (perda), Ibi Ejo (demanda)
```

RLS: leitura publica, gerenciamento apenas para admins.

### 2. Inserir o Step Ire/Ibi no fluxo do Oraculo

O fluxo atual de 6 passos passa para 7:

```text
ANTES:  Intencao > Obi > Ebo > Ori > Iyami/Egbe > Diagnostico
DEPOIS: Intencao > Obi > Ire/Ibi > Ebo > Ori > Iyami/Egbe > Diagnostico
```

### 3. Reformular o componente StepIreIbi

O componente `StepIreIbi.tsx` sera reescrito para:

- Primeira tela: dois botoes grandes "Ire" e "Ibi" (como ja existe)
- Segunda tela: lista dos tipos cadastrados (vindos do banco) com nome e descricao
- O usuario seleciona o tipo especifico (ex: "Ire Aje - Prosperidade")
- O tipo selecionado e armazenado no estado do wizard

### 4. Atualizar Oracle.tsx

- TOTAL_STEPS muda de 6 para 7
- Step 3 passa a ser StepIreIbi (com selecao de tipo)
- Steps 4-7 se ajustam (Ebo, Ori, Iyami/Egbe, Diagnostico)
- O estado do wizard ganha um campo `ireIbiType` com o id/nome do tipo selecionado

### 5. Atualizar StepDiagnosis (WizardState)

- Adicionar `ireIbiType?: string` ao WizardState
- Exibir o tipo de Ire/Ibi no card de resumo do diagnostico
- Incluir no JSON de contexto salvo na jornada

### 6. Painel Admin para gerenciar Ire/Ibi

Novo componente `AdminIreIbiTypes.tsx` acessivel pelo painel admin, permitindo:

- Listar todos os tipos de Ire e Ibi cadastrados
- Criar novos tipos (nome + descricao + categoria ire/ibi)
- Editar e desativar tipos existentes
- Reordenar por `display_order`

### 7. Hook useIreIbiTypes

Novo hook em `src/hooks/useIreIbiTypes.ts` com:

- `useIreIbiTypes()` - busca todos os tipos ativos ordenados
- `useCreateIreIbiType()` - mutation para criar
- `useUpdateIreIbiType()` - mutation para editar
- `useDeleteIreIbiType()` - mutation para remover

---

## Detalhes Tecnicos

### Migracao SQL

```text
CREATE TABLE public.ire_ibi_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ire_ibi_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ire/Ibi types are publicly readable"
  ON public.ire_ibi_types FOR SELECT USING (true);

CREATE POLICY "Admins can manage ire/ibi types"
  ON public.ire_ibi_types FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Dados iniciais
INSERT INTO public.ire_ibi_types (category, name, description, display_order) VALUES
  ('ire', 'Ire Aiku', 'Ire de saude e longevidade', 1),
  ('ire', 'Ire Aje', 'Ire de prosperidade e riqueza', 2),
  ('ire', 'Ire Omo', 'Ire de filhos e fertilidade', 3),
  ('ire', 'Ire Aya/Oko', 'Ire de casamento e uniao', 4),
  ('ibi', 'Ibi Iku', 'Ibi de morte ou perigo grave', 1),
  ('ibi', 'Ibi Arun', 'Ibi de doenca', 2),
  ('ibi', 'Ibi Ofo', 'Ibi de perda material ou emocional', 3),
  ('ibi', 'Ibi Ejo', 'Ibi de demanda, confusao ou justica', 4);
```

### Fluxo do StepIreIbi reformulado

```text
1. Usuario ve dois botoes: Ire (sol) ou Ibi (alerta)
2. Ao clicar em um, aparece a lista de subtipos daquela categoria
3. Cada subtipo mostra nome e descricao curta
4. Ao selecionar o subtipo, avanca para o proximo step (Ebo)
```

### WizardState atualizado

```text
interface WizardState {
  intention: "cuidado_semanal" | "orientacao";
  result: string;
  ireOrIbi: "ire" | "ibi";
  ireIbiTypeId?: string;    // NOVO - id do tipo selecionado
  ireIbiTypeName?: string;  // NOVO - nome para exibicao
  eboApurado: boolean;
  eboTipo?: string;
  oriPrecisa: boolean;
  oriAcao?: string;
  iyamiQuer: boolean;
  egbeOrunQuer: boolean;
}
```

### Oracle.tsx - Numeracao dos steps

```text
Step 1: StepIntention
Step 2: StepObiResult
Step 3: StepIreIbi (NOVO no fluxo)
Step 4: StepEbo
Step 5: StepOri
Step 6: StepIyamiEgbe
Step 7: StepDiagnosis
```

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabela `ire_ibi_types` com RLS e dados iniciais |
| `src/hooks/useIreIbiTypes.ts` | NOVO - Hook CRUD para tipos de Ire/Ibi |
| `src/components/oracle/StepIreIbi.tsx` | REESCREVER - Selecao de Ire/Ibi com subtipos do banco |
| `src/pages/Oracle.tsx` | Inserir Step 3 (Ire/Ibi), ajustar TOTAL_STEPS para 7 |
| `src/components/oracle/StepDiagnosis.tsx` | Adicionar `ireIbiTypeId`/`ireIbiTypeName` ao WizardState e resumo |
| `src/components/admin/AdminIreIbiTypes.tsx` | NOVO - Painel admin para gerenciar tipos |
| `src/pages/Admin.tsx` | Adicionar aba/secao para Ire/Ibi Types |

