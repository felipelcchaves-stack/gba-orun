

# Restaurar UX do Oraculo + Template "Quero uma Orientacao"

## 1. Oracle.tsx -- Sempre mostrar tela de selecao

Remover o auto-start que pula a tela de selecao quando ha apenas 1 fluxo ativo (linhas 27-35). O usuario sempre vera a tela "Como posso te ajudar hoje?" com os cards dos fluxos ativos, independente de quantos existam. So avanca direto quando o usuario clica em um card.

Tambem adicionar um botao de "Voltar" quando o usuario ja esta dentro de um fluxo, para poder retornar a tela de selecao.

## 2. AdminFlows.tsx -- Novo template "Quero uma Orientacao"

Adicionar um segundo botao de template no admin: **"Criar Fluxo: Quero uma Orientacao"**. Este fluxo sera mais simples e direto, sem lancamento de Obi:

**Estrutura do fluxo:**
- Inicio
- Mensagem de acolhimento: "O que esta tirando sua paz? Vamos buscar uma orientacao juntos."
- Pergunta aberta (multiple_choice): "Qual area da sua vida precisa de atencao?" com opcoes: Saude, Financeiro, Relacionamento, Espiritual, Trabalho
- Sim/Nao: "Ja fez algum cuidado espiritual recentemente?"
- Sim/Nao: "Sente necessidade de uma limpeza espiritual?"
- Sim/Nao: "O Ori precisa de fortalecimento?"
- Diagnostico com tarefas condicionais baseadas nas respostas

**Nos (~8 blocos):**

| Bloco | Tipo | Conteudo |
|---|---|---|
| Inicio | start | Ponto de partida |
| Acolhimento | message | "O que esta tirando sua paz? Vamos buscar uma orientacao juntos." |
| Area de Atencao | multiple_choice | Saude, Financeiro, Relacionamento, Espiritual, Trabalho |
| Cuidado Recente | yes_no | "Ja fez algum cuidado espiritual recentemente?" |
| Limpeza | yes_no | "Sente necessidade de uma limpeza espiritual?" |
| Ori | yes_no | "O Ori precisa de fortalecimento?" |
| Diagnostico | diagnosis | Tarefas condicionais |

**Tarefas do diagnostico:**
- "Ebo de Limpeza" (condicao: limpeza = sim)
- "Ibori de Fortalecimento" (condicao: ori = sim)
- "Oracao da Manha" (condicao: always)
- "Oracao ao Ori" (condicao: ori = sim)

O botao ficara ao lado do botao existente "Criar Fluxo Padrao (Cuidado Semanal)", oferecendo as duas opcoes de template.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Oracle.tsx` | Remover auto-start de 1 fluxo; adicionar botao voltar dentro do fluxo |
| `src/components/admin/AdminFlows.tsx` | Adicionar funcao `handleCreateOrientationFlow` com o template "Quero uma Orientacao" e botao correspondente |

