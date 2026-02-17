

# Plano: Links de Rituais em Qualquer Parte do App

## Resumo

Criar uma tabela de configuracao no banco de dados chamada `app_ritual_links` que permite ao admin vincular rituais a "pontos" especificos do app (ex: step do oraculo, tela de Iyami, campo de Ebo, etc.). Quando um ritual estiver vinculado, um botao de ajuda (icone de livro/interrogacao) aparece automaticamente naquele ponto, e ao clicar abre um modal com o conteudo do ritual.

---

## Como Funciona

### Para o Admin

No painel Admin, uma nova secao "Links de Ajuda" com:
- Uma lista de **pontos do app** pre-definidos (ex: "Oraculo - Resultado Obi", "Oraculo - Ire/Ibi", "Oraculo - Ebo", "Oraculo - Ori", "Oraculo - Iyami/Egbe", "Home - Cuidado Espiritual")
- Cada ponto tem um **combobox de ritual** (usando o `RitualCombobox` ja existente)
- Ao salvar, o link fica registrado no banco

### Para o Devoto

- Se o admin vinculou um ritual ao ponto "Oraculo - Ebo", quando o devoto chegar no step de Ebo, aparece um pequeno botao com icone de livro no canto superior direito
- Ao clicar, abre um **Dialog modal** com o titulo do ritual e o conteudo em Markdown (usando `react-markdown` ja instalado)
- Se nao ha ritual vinculado, o botao simplesmente nao aparece

---

## Detalhes Tecnicos

### Migracao SQL

Nova tabela `app_ritual_links`:

```text
- id: uuid (PK)
- app_point: text (unique) -- ex: "oracle_step_obi", "oracle_step_ebo", "oracle_step_ori"
- ritual_id: uuid (FK -> rituals.id, nullable)
- created_at: timestamptz
```

RLS: leitura para todos (authenticated), escrita somente admin.

### Pontos Pre-definidos

| Chave (app_point) | Onde aparece |
|---|---|
| `oracle_step_obi` | StepObiResult - titulo do oraculo |
| `oracle_step_ire_ibi` | StepIreIbi - escolha Ire/Ibi |
| `oracle_step_ebo` | StepEbo - apurou ebo? |
| `oracle_step_ori` | StepOri - cuidado com Ori |
| `oracle_step_iyami_egbe` | StepIyamiEgbe - Iyami e Egbe |
| `oracle_step_diagnosis` | StepDiagnosis - diagnostico final |
| `home_spiritual_care` | Card de cuidado espiritual na Home |
| `home_energy_dashboard` | Dashboard de energias na Home |

### Arquivos a Criar

| Arquivo | Descricao |
|---|---|
| `src/hooks/useRitualLinks.ts` | Hook para buscar/salvar links ritual-ponto do app |
| `src/components/RitualHelpButton.tsx` | Botao de ajuda + modal com conteudo do ritual |
| `src/components/admin/AdminRitualLinks.tsx` | Tela admin para gerenciar os links |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/oracle/StepObiResult.tsx` | Adicionar `<RitualHelpButton point="oracle_step_obi" />` |
| `src/components/oracle/StepIreIbi.tsx` | Adicionar `<RitualHelpButton point="oracle_step_ire_ibi" />` |
| `src/components/oracle/StepEbo.tsx` | Adicionar `<RitualHelpButton point="oracle_step_ebo" />` |
| `src/components/oracle/StepOri.tsx` | Adicionar `<RitualHelpButton point="oracle_step_ori" />` |
| `src/components/oracle/StepIyamiEgbe.tsx` | Adicionar `<RitualHelpButton point="oracle_step_iyami_egbe" />` |
| `src/components/oracle/StepDiagnosis.tsx` | Adicionar `<RitualHelpButton point="oracle_step_diagnosis" />` |
| `src/pages/Admin.tsx` | Adicionar aba/secao "Links de Ajuda" no sidebar |
| `src/components/admin/AdminSidebar.tsx` | Adicionar item "Links de Ajuda" |

### Componente RitualHelpButton

Recebe uma prop `point` (string). Internamente:
1. Usa o hook `useRitualLinks` para buscar o `ritual_id` vinculado aquele ponto
2. Se nao tem ritual vinculado, retorna `null` (nao renderiza nada)
3. Se tem, renderiza um botao discreto (icone `BookOpen` ou `HelpCircle`)
4. Ao clicar, abre um `Dialog` com:
   - Titulo do ritual
   - Conteudo renderizado com `react-markdown`
   - Player de audio se houver `audio_url`
   - Botao para ir ao ritual completo (`/rituais/{id}`)

### Tela Admin - Links de Ajuda

Lista todos os pontos do app em cards. Cada card tem:
- Nome amigavel do ponto (ex: "Oraculo - Etapa do Ebo")
- Descricao curta do que e aquele ponto
- `RitualCombobox` para selecionar/trocar o ritual vinculado
- Botao "Salvar" por card (ou auto-save ao selecionar)

---

## Resultado Esperado

O admin pode vincular qualquer ritual/reza a pontos estrategicos do app. Quando vinculado, um botao de ajuda aparece automaticamente naquele ponto. O devoto clica e ve o conteudo do ritual em um modal, sem sair da tela em que esta. Se nenhum ritual esta vinculado, o botao nao aparece. O sistema e extensivel -- basta adicionar novas chaves de `app_point` para expandir para outras telas no futuro.

