
# Corrigir duplo "Voltar" e criar barra de progresso criativa

## Problema 1: Dois botoes "Voltar"

Na screenshot, ha dois links "Voltar" empilhados:
1. O de `Oracle.tsx` (linha 20-25) -- volta para a tela de selecao de fluxos
2. O de `DynamicFlowRunner.tsx` (linha 91-94) -- volta para o passo anterior do fluxo

**Solucao:** Remover o botao "Voltar" do `Oracle.tsx`. O `DynamicFlowRunner` ja tem seu proprio botao de voltar que navega entre os passos. Quando o historico estiver vazio (primeiro passo), o botao de voltar do `DynamicFlowRunner` chamara uma callback `onExit` para retornar a tela de selecao.

## Problema 2: Barra de progresso com numeros em bolinhas

A `OracleProgressBar` atual mostra bolinhas numeradas com labels fixos ("Obi", "Ire/Ibi", etc.) que nao correspondem aos fluxos dinamicos. Alem disso, os numeros nao sao intuitivos.

**Solucao:** Substituir por uma barra de progresso contínua e criativa, sem numeros nem labels fixos:
- Uma barra arredondada unica com preenchimento animado em gradiente (dourado para o marrom terra)
- Um indicador de porcentagem sutil (ex: "Passo 2 de 6")
- Icone decorativo (estrela/brilho) na ponta do progresso que acompanha o avanco
- Transicao suave ao avancar

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Oracle.tsx` | Remover o botao "Voltar" duplicado; passar callback `onExit` para o `DynamicFlowRunner` |
| `src/components/oracle/DynamicFlowRunner.tsx` | Receber prop `onExit`; no primeiro passo, o botao "Voltar" chama `onExit`; remover importacao de `OracleProgressBar` antiga |
| `src/components/oracle/OracleProgressBar.tsx` | Reescrever completamente: barra continua com gradiente dourado-marrom, texto "Passo X de Y", icone brilhante na ponta do progresso, sem bolinhas numeradas |

## Detalhe tecnico

**Oracle.tsx:** Remover linhas 20-25 (botao Voltar). Passar `onExit={() => setSelectedFlowId(null)}` ao `DynamicFlowRunner`.

**DynamicFlowRunner.tsx:**
- Adicionar prop `onExit?: () => void`
- No botao "Voltar" (quando `history.length > 0`), manter `goBack()`
- Quando `history.length === 0` e nao e diagnostico, mostrar botao "Voltar" que chama `onExit()`
- Isso unifica a navegacao em um unico botao

**OracleProgressBar.tsx:** Nova versao:
- Barra arredondada com gradiente `from-[#FFD700] to-[#8B4513]` (dourado para marrom terra, paleta do projeto)
- Texto centralizado abaixo: "Passo {current} de {total}"
- Animacao suave do preenchimento com `transition-all duration-700 ease-out`
- Pequeno icone de brilho (Sparkles) posicionado na ponta da barra
- Sem bolinhas, sem numeros dentro de circulos, sem labels fixos
