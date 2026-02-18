

# Remodelar a Tela de Diagnostico (Resumo da Consulta)

## Problemas identificados

1. **"Vamos assuntar" mostra codigos como "BIQ"**: O resumo exibe as chaves brutas das respostas (IDs de nos ou variable_names como "escolha_1") e valores internos (como "ejife", "sim", "ire:uuid:nome") em vez de texto legivel para o assinante.

2. **"horas sao da manha"**: Texto vindo da descricao configurada no admin com variaveis nao resolvidas (ex: `{{hora}}`). A correcao aqui e no conteudo do admin, mas o sistema pode tratar variaveis ausentes de forma mais elegante.

3. **Botao "Iniciar Rotina" confuso**: O botao salva a jornada e redireciona para a Home, mas o texto sugere que algo novo vai comecar. Precisa de um texto mais claro.

## O que sera feito

### 1. Reescrever o bloco "Resumo da Consulta"

Transformar o resumo de uma lista tecnica de chave/valor em um resumo visual com icones e nomes legiveis:

- **Para respostas do Obi** (valores como "ejife", "alafia"): Buscar o nome legivel na tabela `oracle_configs` e exibir o significado (ex: "Ejife -- SIM").
- **Para respostas Ire/Ibi** (valores como "ire:uuid:Ire Aiku"): Extrair o nome humano da propria string (apos o segundo `:`) e mostrar com o icone adequado.
- **Para respostas Sim/Nao**: Exibir "Sim" ou "Nao" com icone verde/vermelho.
- **Para escolha multipla**: Mostrar a opcao selecionada com o label legivel.
- **Para a label de cada pergunta**: Usar `node.label` ou `config.question` do no de origem, nunca o ID tecnico.

### 2. Filtrar respostas irrelevantes do resumo

Nao exibir no resumo:
- Nos do tipo "start" (Inicio)
- Nos do tipo "message" (Mensagens informativas que nao pedem resposta)
- Nos do tipo "timer" ou "media"

Mostrar apenas nos que representam decisoes do usuario (obi, yes_no, multiple_choice, ire_ibi, open_question).

### 3. Melhorar o botao de acao

Trocar o texto de "Iniciar Rotina" para "Salvar e Ir para Minha Rotina", comunicando claramente o que acontece ao clicar.

### 4. Tratar variaveis nao resolvidas

Na funcao `interpolateVars`, quando uma variavel `{{nome}}` nao for encontrada nas respostas, exibir uma string vazia em vez de manter `{{nome}}` visivel na tela.

---

## Detalhes tecnicos

### Arquivo: `src/components/oracle/FlowStepRenderer.tsx`

**Mudanca 1 -- Funcao `formatAnswerDisplay`** (nova):

Funcao auxiliar que recebe o valor bruto da resposta e o tipo do no, retornando texto legivel:

```text
function formatAnswerDisplay(value: string, nodeType?: string): string {
  // Ire/Ibi: "ire:uuid:Ire Aiku" -> "Ire Aiku"
  if (value.match(/^(ire|ibi):.+:.+$/)) return value.split(":").slice(2).join(":");
  
  // Sim/Nao
  if (value === "sim") return "Sim";
  if (value === "nao") return "Nao";
  
  // Obi results: lookup readable name from oracle_configs (passed as prop)
  // "ejife" -> "Ejife (SIM)"
  
  return value;
}
```

**Mudanca 2 -- Reescrever bloco "Resumo da Consulta"** (linhas 628-641):

- Filtrar `Object.entries(answers)` para excluir nos informativos
- Usar `formatAnswerDisplay` para cada valor
- Exibir icones contextuais (emoji de obi para resultado obi, check/x para sim/nao, estrela para ire/ibi)
- Cada item como card pequeno em vez de texto simples

**Mudanca 3 -- Texto do botao** (linha 703):

Trocar `"Iniciar Rotina"` por `"Salvar e Ir para Minha Rotina"`

**Mudanca 4 -- `interpolateVars`** (linha 191-193):

Trocar `answers[key] || {{key}}` por `answers[key] || ""` para nao exibir variaveis nao resolvidas.

### Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `src/components/oracle/FlowStepRenderer.tsx` | Reescrever resumo, formatar respostas, melhorar botao, tratar variaveis |

**Total: 1 arquivo modificado**

