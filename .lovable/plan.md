
# Plano: Balao de Orientacao do Mestre (Speech Bubble com Avatar)

Um componente visual estilo "balao de fala" de desenho animado, com a foto do mestre/orientador, que aparece em cada etapa do oraculo e nos rituais/oracoes. O admin pode configurar o texto e o audio de orientacao para cada ponto do app.

---

## Conceito Visual

O balao sera um card estilizado com:
- Foto/avatar do orientador (configuravel pelo admin) no canto esquerdo, com borda dourada
- Um "rabo" de balao (triangulo CSS) apontando para o avatar, como nos quadrinhos
- Texto da orientacao dentro do balao
- Botao de audio integrado (mini player) quando houver audio disponivel
- Cores suaves (fundo creme/amarelado) para destacar sem competir com o conteudo principal
- Animacao de entrada suave (fade-up)

---

## 1. Tabela de Orientacoes no Banco de Dados

Nova tabela `guidance_bubbles` para armazenar as orientacoes por ponto do app:

```text
guidance_bubbles
- id UUID PK
- point_key TEXT NOT NULL UNIQUE (ex: "oracle_step_intention", "oracle_step_obi", "ritual_reader")
- message TEXT NOT NULL (texto da orientacao)
- audio_url TEXT (URL do audio, opcional)
- is_active BOOLEAN DEFAULT true
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()
```

Uma linha em `app_settings` para armazenar a URL do avatar do mestre: chave `guidance_avatar_url`.

**RLS:**
- SELECT publico (todos podem ler)
- ALL para admin

---

## 2. Componente `GuidanceBubble`

Novo componente reutilizavel: `src/components/GuidanceBubble.tsx`

**Props:**
- `pointKey: string` -- identifica qual orientacao carregar
- `className?: string` -- customizacao opcional

**Comportamento:**
- Busca a orientacao da tabela `guidance_bubbles` onde `point_key` = prop e `is_active = true`
- Busca o avatar do mestre de `app_settings` (chave `guidance_avatar_url`)
- Se nao houver orientacao cadastrada para aquele ponto, nao renderiza nada (retorna null)
- Se houver audio, exibe um mini botao de play ao lado do texto

**Estilo visual:**
- Container com `bg-amber-50 dark:bg-amber-950/30` e `rounded-2xl`
- Avatar circular (48x48) com `ring-2 ring-amber-400` posicionado a esquerda
- Triangulo CSS (pseudo-elemento) criando o efeito de "rabo" do balao
- Texto em tamanho `text-sm` com fonte suave
- Mini player de audio inline (icone de play/pause com barra de progresso compacta)

---

## 3. Pontos de Insercao no App

O componente `GuidanceBubble` sera inserido nos seguintes locais:

### Oraculo (cada etapa do wizard):
| Arquivo | point_key | Posicao |
|---|---|---|
| `StepIntention.tsx` | `oracle_step_intention` | Abaixo do subtitulo, antes das opcoes |
| `StepObiResult.tsx` | `oracle_step_obi` | Abaixo da imagem do Obi, antes das opcoes |
| `StepIreIbi.tsx` | `oracle_step_ire_ibi` | Abaixo da descricao, antes dos botoes Ire/Ibi |
| `StepEbo.tsx` | `oracle_step_ebo` | Abaixo do titulo, antes das perguntas |
| `StepOri.tsx` | `oracle_step_ori` | Abaixo do titulo, antes das perguntas |
| `StepIyamiEgbe.tsx` | `oracle_step_iyami` | Abaixo do titulo, antes das perguntas |
| `StepDiagnosis.tsx` | `oracle_step_diagnosis` | Abaixo do subtitulo, antes do card de resumo |

### Rituais e Oracoes:
| Arquivo | point_key | Posicao |
|---|---|---|
| `RitualReader.tsx` | `ritual_reader` | Acima do conteudo Markdown, abaixo do header |

### Jornada:
| Arquivo | point_key | Posicao |
|---|---|---|
| `JourneyEntryCard.tsx` | `journey_task_card` | Abaixo do progresso, antes das secoes de tarefas |

---

## 4. Hook `useGuidance`

Novo hook: `src/hooks/useGuidance.ts`

- `useGuidanceBubble(pointKey: string)` -- retorna `{ message, audio_url, avatar_url, isLoading }`
- Combina query de `guidance_bubbles` filtrado por `point_key` e `is_active = true` com query de `app_settings` para `guidance_avatar_url`
- Cache agressivo via React Query (staleTime longo, pois esse conteudo muda pouco)

---

## 5. Painel Admin -- Gestao de Orientacoes

Nova secao "Orientacoes" no admin: `src/components/admin/AdminGuidance.tsx`

**Funcionalidades:**
- Campo para definir a URL do avatar do mestre (salva em `app_settings`)
- Lista de todos os `point_key` possiveis com label amigavel (ex: "Etapa 1: Intencao", "Leitor de Ritual")
- Para cada ponto: campo de texto (textarea) e campo de URL de audio
- Toggle ativo/inativo por ponto
- Botao salvar por linha
- Preview do balao em tempo real ao digitar

**Atualizacoes no admin:**
- `AdminSidebar.tsx`: adicionar item "Orientacoes" com icone `MessageCircle`
- `Admin.tsx`: renderizar secao "guidance" com `AdminGuidance`

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabela `guidance_bubbles` com RLS |
| `src/hooks/useGuidance.ts` | Criar: hook para buscar orientacao e avatar |
| `src/components/GuidanceBubble.tsx` | Criar: componente visual do balao |
| `src/components/admin/AdminGuidance.tsx` | Criar: gestao de orientacoes no admin |
| `src/components/admin/AdminSidebar.tsx` | Adicionar item "Orientacoes" |
| `src/pages/Admin.tsx` | Renderizar secao "guidance" |
| `src/components/oracle/StepIntention.tsx` | Inserir `GuidanceBubble` |
| `src/components/oracle/StepObiResult.tsx` | Inserir `GuidanceBubble` |
| `src/components/oracle/StepIreIbi.tsx` | Inserir `GuidanceBubble` |
| `src/components/oracle/StepEbo.tsx` | Inserir `GuidanceBubble` |
| `src/components/oracle/StepOri.tsx` | Inserir `GuidanceBubble` |
| `src/components/oracle/StepIyamiEgbe.tsx` | Inserir `GuidanceBubble` |
| `src/components/oracle/StepDiagnosis.tsx` | Inserir `GuidanceBubble` |
| `src/pages/RitualReader.tsx` | Inserir `GuidanceBubble` |
| `src/components/journey/JourneyEntryCard.tsx` | Inserir `GuidanceBubble` |
