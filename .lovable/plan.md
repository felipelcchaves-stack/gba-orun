

# Plano: Orientacoes Vinculadas a Tarefas (Guidance por Task Template)

Evoluir o sistema de orientacoes do mestre para que cada tarefa criada no Admin (oracle_task_templates) possa ter sua propria orientacao com texto e audio, alem dos pontos fixos do oraculo.

---

## Problema Atual

As orientacoes (`guidance_bubbles`) so podem ser associadas a pontos fixos do app (ex: "oracle_step_intention", "ritual_reader"). Nao ha como o mestre deixar uma orientacao especifica para uma tarefa como "Fazer Ebo de Limpeza" ou "Ibori de Protecao". Isso limita a capacidade de guiar o aluno em cada atividade da sua rotina espiritual.

---

## Solucao: Orientacoes por Task Template

Adicionar dois campos opcionais na tabela `oracle_task_templates`:

```text
oracle_task_templates (campos novos):
- guidance_message TEXT (orientacao do mestre para essa tarefa)
- guidance_audio_url TEXT (audio do mestre para essa tarefa)
```

Isso elimina a necessidade de criar entradas separadas na tabela `guidance_bubbles` para cada tarefa. A orientacao vive diretamente no template da tarefa.

---

## 1. Migracao do Banco de Dados

Adicionar 2 colunas a tabela `oracle_task_templates`:

```text
ALTER TABLE oracle_task_templates
  ADD COLUMN guidance_message TEXT DEFAULT '',
  ADD COLUMN guidance_audio_url TEXT;
```

Nenhuma tabela nova. Nenhuma mudanca de RLS (a tabela ja tem politicas corretas).

---

## 2. Propagar Orientacao para journey_tasks

Quando o diagnostico salva as tarefas na `journey_tasks`, os campos de orientacao precisam ser salvos junto. Adicionar 2 colunas em `journey_tasks`:

```text
ALTER TABLE journey_tasks
  ADD COLUMN guidance_message TEXT DEFAULT '',
  ADD COLUMN guidance_audio_url TEXT;
```

Assim, quando o `StepDiagnosis` cria as tarefas, copia `guidance_message` e `guidance_audio_url` do template para a tarefa do usuario. Isso "congela" a orientacao no momento da criacao (mesmo que o admin mude depois, o aluno ve o que era valido quando consultou).

---

## 3. Componente TaskGuidanceBubble

Novo componente leve: `src/components/TaskGuidanceBubble.tsx`

Reutiliza o visual do `GuidanceBubble` mas recebe as props diretamente (sem buscar do banco):

```text
Props:
- message: string
- audioUrl?: string
- className?: string
```

Busca o avatar do mestre do `app_settings` (mesmo hook `useAppSettings`). Se `message` estiver vazio, retorna null.

---

## 4. Alteracoes no Admin (oracle_task_templates)

No `AdminOracleTaskTemplates.tsx`, adicionar ao formulario de cada regra:

- Textarea "Orientacao do Mestre" (campo `guidance_message`)
- Input "URL do Audio" (campo `guidance_audio_url`)
- Preview do balao ao lado, em tempo real

Fica integrado no mesmo formulario de criacao/edicao de regra de tarefa, sem precisar ir a outra tela.

---

## 5. Alteracoes no StepDiagnosis

No `StepDiagnosis.tsx`:

- Incluir `guidance_message` e `guidance_audio_url` no mapeamento de templates para `TaskDef`
- Ao salvar as tarefas (`handleSave`), copiar esses campos para cada linha de `journey_tasks`
- Exibir `TaskGuidanceBubble` abaixo de cada card de tarefa no diagnostico, para o aluno ja ver a orientacao antes de iniciar

---

## 6. Alteracoes no JourneyEntryCard

No `JourneyEntryCard.tsx`:

- Para cada tarefa individual na lista, renderizar `TaskGuidanceBubble` abaixo do titulo se `guidance_message` existir
- O balao aparece compacto, integrado ao item da tarefa, com botao de audio se disponivel

---

## Fluxo Completo

```text
1. Admin cria regra de tarefa "Ebo de Limpeza" com orientacao:
   "Separe 1 ovo, mel e azeite de dende..."

2. Usuario consulta o Oraculo -> Diagnostico gera tarefa "Ebo de Limpeza"
   -> Balao do mestre aparece no card da tarefa com a orientacao

3. Usuario vai para Jornada -> Cada tarefa mostra o balao do mestre
   com texto e audio especificos daquela tarefa

4. Orientacao fica "congelada" na journey_task (snapshot do momento)
```

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | ADD COLUMN guidance_message e guidance_audio_url em oracle_task_templates e journey_tasks |
| `src/components/TaskGuidanceBubble.tsx` | Criar: balao de orientacao com props diretas |
| `src/components/admin/AdminOracleTaskTemplates.tsx` | Adicionar campos de orientacao no formulario |
| `src/components/oracle/StepDiagnosis.tsx` | Mapear guidance dos templates; salvar nos tasks; exibir balao |
| `src/components/journey/JourneyEntryCard.tsx` | Exibir balao por tarefa individual |
| `src/integrations/supabase/types.ts` | Atualizado automaticamente apos migracao |

Os pontos fixos existentes (oracle_step_intention, ritual_reader, etc.) continuam funcionando normalmente via `GuidanceBubble`. O novo `TaskGuidanceBubble` e complementar e especifico para tarefas.

