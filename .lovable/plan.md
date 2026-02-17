

# Plano: Orientacao do Mestre em Todo o Fluxo do Oraculo

## Resumo

Adicionar campos de orientacao (mensagem + audio) e links de ritual/oferenda em todos os pontos de decisao do oraculo, dando ao admin total flexibilidade para conduzir o aluno em cada escolha.

## O que muda

### 1. Tipos de Ire/Ibi - Orientacao + Link

Hoje os subtipos de Ire e Ibi (ex: Ire Aje, Ibi Iku) so tem nome e descricao. Vamos adicionar:

- `guidance_message` (texto de orientacao do mestre)
- `guidance_audio_url` (audio opcional)
- `ritual_id` (link para uma reza/ritual)
- `offering_id` (link para uma oferenda)

**No app:** Quando o usuario selecionar um subtipo (ex: "Ire Aje"), antes de avancar, aparece o balao do mestre com a orientacao e os links para reza/oferenda sugerida -- mesmo padrao que ja funciona no resultado do Obi.

**No admin:** O formulario de Tipos de Ire/Ibi ganha os campos extras.

### 2. Sub-etapas do Ebo - Orientacao

Hoje ao selecionar "Sim, ja sei qual ebo" e escolher o tipo (Limpeza, Prosperidade, etc.), nao aparece nenhuma orientacao. Vamos adicionar um GuidanceBubble para cada sub-etapa:

- `oracle_step_ebo_types` (orientacao na tela de selecao de tipo de ebo)

### 3. Sub-etapas do Ori - Orientacao

Mesmo caso: ao selecionar "Sim, precisa de cuidado" e escolher Ibori/Oracao/Ambos, nao aparece orientacao. Vamos adicionar:

- `oracle_step_ori_actions` (orientacao na tela de selecao de acao do Ori)

### 4. Egbe Orun - Orientacao

A tela do Egbe Orun nao tem GuidanceBubble. Vamos adicionar:

- `oracle_step_egbe` (orientacao na tela do Egbe Orun)

## Alteracoes por arquivo

| Arquivo | Acao |
|---|---|
| Migration SQL | Adicionar `guidance_message`, `guidance_audio_url`, `ritual_id`, `offering_id` na tabela `ire_ibi_types` |
| `src/hooks/useIreIbiTypes.ts` | Atualizar interface com novos campos |
| `src/components/admin/AdminIreIbiTypes.tsx` | Adicionar campos de orientacao, ritual e oferenda no formulario |
| `src/components/oracle/StepIreIbi.tsx` | Mostrar orientacao do mestre + links apos selecionar subtipo (mesmo padrao StepObiResult) |
| `src/components/oracle/StepEbo.tsx` | Adicionar GuidanceBubble na sub-tela de tipos de ebo |
| `src/components/oracle/StepOri.tsx` | Adicionar GuidanceBubble na sub-tela de acoes do Ori |
| `src/components/oracle/StepIyamiEgbe.tsx` | Adicionar GuidanceBubble na sub-tela do Egbe Orun |

## Detalhes Tecnicos

### Migration SQL

```text
ALTER TABLE public.ire_ibi_types
  ADD COLUMN guidance_message text NOT NULL DEFAULT '',
  ADD COLUMN guidance_audio_url text,
  ADD COLUMN ritual_id uuid REFERENCES public.rituals(id) ON DELETE SET NULL,
  ADD COLUMN offering_id uuid REFERENCES public.offerings(id) ON DELETE SET NULL;
```

### StepIreIbi - Fluxo com orientacao

Mesmo padrao do StepObiResult:
1. Usuario clica em um subtipo (ex: "Ire Aje")
2. Se tiver `guidance_message`, mostra tela intermediaria com:
   - Nome e descricao do subtipo
   - Balao do mestre com orientacao
   - Link para ritual vinculado (se houver)
   - Link para oferenda vinculada (se houver)
   - Botao "Continuar" para avancar
3. Se nao tiver orientacao, avanca direto (comportamento atual)

### AdminIreIbiTypes - Novos campos

No formulario de edicao, adicionar:
- Textarea "Orientacao do Mestre" (guidance_message)
- Input "URL do Audio" (guidance_audio_url)
- RitualCombobox para vincular ritual
- OfferingCombobox para vincular oferenda

### GuidanceBubble nas sub-etapas

Adicionar o componente GuidanceBubble ja existente com point_keys novos:
- `oracle_step_ebo_types` - tela de selecao do tipo de ebo
- `oracle_step_ori_actions` - tela de selecao da acao do Ori
- `oracle_step_egbe` - tela do Egbe Orun

Esses point_keys podem ser configurados pelo admin na secao "Orientacao" do painel, sem necessidade de nova tabela.

## Resultado Esperado

1. O admin cadastra orientacao, reza e oferenda em cada subtipo de Ire/Ibi
2. Em cada ponto de decisao do oraculo, o aluno ve a orientacao do mestre antes de avancar
3. As sub-etapas (tipo de ebo, acao do ori, egbe orun) tambem mostram a orientacao contextual
4. Total flexibilidade para o admin conduzir o aluno em todo o fluxo

