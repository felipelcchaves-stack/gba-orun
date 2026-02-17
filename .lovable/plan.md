
# Novos Blocos + Clonagem de Fluxos

## 1. Novos Tipos de Bloco

Tres novos blocos para enriquecer a jornada do aluno:

### Bloco Media (imagem/video)
- Permite inserir uma imagem (URL) ou um video do YouTube entre etapas
- Config: `media_url`, `media_type` (image/youtube), `caption`
- No canvas: icone de imagem com preview da URL
- Para o aluno: renderiza imagem com legenda ou embed responsivo do YouTube, com botao "Continuar" abaixo

### Bloco Timer (reflexao/pausa)
- Exibe uma mensagem e um contador regressivo (ex: "Respire fundo por 15 segundos")
- Config: `duration_seconds` (padrao 10), `message`
- No canvas: icone de relogio com a duracao
- Para o aluno: circulo animado preenchendo + contador. Botao "Continuar" aparece somente apos o tempo expirar

### Bloco Condicional (desvio por variavel)
- Permite criar caminhos diferentes baseados no valor de uma variavel anterior (ex: se `resultado_obi` = "alafia", vai para caminho A; se = "oyekun", vai para caminho B)
- Config: `variable_name` (qual variavel avaliar), `conditions` (array de `{ value, handle_id }`)
- No canvas: icone de setas divergentes com badges das condicoes
- Para o aluno: invisivel — o sistema avanca automaticamente pelo caminho correto sem interacao

---

## 2. Clonagem de Fluxos

Botao "Duplicar" ao lado de cada fluxo na lista, que cria uma copia completa (nodes + edges) com o nome "[Nome Original] (copia)".

### Logica
- Buscar todos os nodes e edges do fluxo original
- Criar novo fluxo via `useCreateFlow` com nome + " (copia)"
- Inserir os nodes copiados (com novos IDs temporarios) e edges remapeados
- Reutilizar `useSaveFlowCanvas` que ja faz o mapeamento de IDs

---

## Detalhes tecnicos

### Arquivos novos (3)

1. **`src/components/admin/flow-builder/nodes/MediaNode.tsx`** — Visual do no de midia no canvas (icone Image, mostra URL truncada)
2. **`src/components/admin/flow-builder/nodes/TimerNode.tsx`** — Visual do no de timer no canvas (icone Clock, mostra duracao)
3. **`src/components/admin/flow-builder/nodes/ConditionalNode.tsx`** — Visual do no condicional no canvas (icone GitBranch, mostra variavel avaliada + handles dinamicos por condicao)

### Arquivos modificados (5)

4. **`src/components/admin/flow-builder/NodePalette.tsx`**
   - Adicionar 3 itens: `media` (Image), `timer` (Clock), `conditional` (GitBranch)

5. **`src/components/admin/flow-builder/FlowBuilder.tsx`**
   - Registrar `media`, `timer` e `conditional` em `nodeTypes`
   - Adicionar prefixos de variavel para os novos tipos no `VARIABLE_PREFIXES`

6. **`src/components/admin/flow-builder/NodeConfigPanel.tsx`**
   - Campos para `media`: URL, tipo (image/youtube), legenda
   - Campos para `timer`: duracao em segundos, mensagem durante espera
   - Campos para `conditional`: seletor de variavel, lista de condicoes (valor + handle)

7. **`src/components/oracle/FlowStepRenderer.tsx`**
   - `MediaStep`: renderiza imagem ou iframe do YouTube + legenda + botao continuar
   - `TimerStep`: circulo SVG animado + contador + botao que aparece apos o tempo
   - `ConditionalStep`: avanca automaticamente chamando `onNext` com o handle correto baseado na variavel

8. **`src/components/admin/AdminFlows.tsx`**
   - Adicionar botao "Duplicar" (icone Copy) na lista de fluxos
   - Funcao `handleCloneFlow(flowId)` que:
     1. Busca nodes e edges do fluxo via Supabase
     2. Cria novo fluxo com nome + " (copia)"
     3. Salva nodes/edges copiados via `useSaveFlowCanvas`
     4. Abre o editor do novo fluxo

### Total: 8 arquivos (3 novos, 5 modificados)
### Sem mudancas no banco de dados (nodes e edges ja usam `config` JSONB flexivel)
