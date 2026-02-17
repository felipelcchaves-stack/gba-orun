

# Plano: Fluxo do Oraculo em Etapas (Bussola Espiritual Completa)

## O Problema Atual

Hoje o Oraculo e uma tela unica: o usuario clica em "Oyekun" e pronto, recebe sugestoes fixas. Na pratica real do Obi, o processo e uma sequencia de perguntas diagnosticas, nao um unico clique.

## O Fluxo Real (5 Etapas)

O novo Oraculo sera um wizard passo-a-passo, como uma consulta real:

```text
Etapa 1: Qual caiu?
   Oyekun / Okaran / Ejife / Etagun / Alafia
          |
Etapa 2: Veio em Ire ou Ibi?
   Ire (positivo) / Ibi (negativo)
          |
Etapa 3: Voce ja apurou o Ebo?
   Sim -> Qual tipo? (Limpeza, Prosperidade, Saude, Protecao)
   Nao -> Sugerir Ebos da categoria
          |
Etapa 4: Voce ja apurou se o Ori precisa de algo?
   Sim -> Registrar / Nao -> Sugerir Ibori + Oracoes de Ori
          |
Etapa 5: Voce ja apurou Iyami / Egbe Orun?
   Sim -> Registrar / Nao -> Sugerir oracoes e rituais
          |
     RESULTADO FINAL
   Diagnostico completo + Checklist de tarefas gerado
```

## Como Vai Funcionar

### Etapa 1 - "Qual caiu no Obi?"
- 5 botoes grandes com os resultados (Oyekun, Okaran, Ejife, Etagun, Alafia)
- Visual identico ao atual, sem mudanca

### Etapa 2 - "Veio em Ire ou Ibi?"
- Dois cards grandes: **Ire** (verde, icone positivo) e **Ibi** (vermelho, icone de alerta)
- Ire = caminho positivo, mas ainda pode precisar de oferendas de agradecimento
- Ibi = caminho negativo, precisa de limpeza e cuidado
- Descrição contextual muda com base no resultado da Etapa 1

### Etapa 3 - "Voce ja apurou o Ebo?"
- Pergunta sim/nao com cards
- Se "Sim": mostra sub-opcoes de tipo de ebo (Limpeza, Prosperidade, Saude, Protecao, Caminho)
- Se "Nao": marca como pendente e sugere ebos relevantes baseados no resultado + ire/ibi
- Se resultado Ejife/Etagun em Ire: sugere ebo de agradecimento em vez de limpeza

### Etapa 4 - "O Ori precisa de algo?"
- Pergunta sim/nao
- Se "Sim": opcoes (Ibori, Oracao de Ori, Ambos)
- Se "Nao": marca como verificado, segue adiante
- A sugestao muda conforme Ire/Ibi: em Ibi, o Ori quase sempre precisa de cuidado

### Etapa 5 - "Iyami e Egbe Orun"
- Duas sub-perguntas em sequencia:
  1. "As Iyami querem algo?" Sim/Nao
  2. "O Egbe Orun quer algo?" Sim/Nao
- Se Sim em qualquer uma: marca tarefas correspondentes

### Tela Final - Diagnostico Completo
- Resumo visual com tudo que foi apurado
- Card com o resultado do Obi + Ire/Ibi
- Lista de tarefas geradas automaticamente (ebo, ibori, oracoes, cantigas)
- Barra de progresso "0 de X tarefas concluidas"
- Botao "Iniciar Rotina" que salva tudo na jornada e redireciona para /jornada

## Logica de Geracao de Tarefas

As tarefas no checklist final sao geradas dinamicamente com base nas respostas:

**Ibi + Ebo nao apurado:**
- Tarefa: "Fazer Ebo de Limpeza" (link para rituais de ebo)
- Tarefa: "Oracao da Noite" (sempre em Ibi)

**Ibi + Ori precisa:**
- Tarefa: "Ibori de Protecao"
- Tarefa: "Oracao de Ori"

**Ibi + Iyami quer algo:**
- Tarefa: "Oracao de Iyami"
- Tarefa: "Cantiga de apaziguamento"

**Ire + Ebo apurado:**
- Tarefa: "Oriki de Agradecimento"
- Tarefa: "Oracao da Manha"

**Ire + Egbe Orun quer algo:**
- Tarefa: "Oferenda ao Egbe Orun"
- Tarefa: "Cantiga Sagrada"

Oracoes da manha sao sempre adicionadas em Ire. Oracoes da noite sao sempre adicionadas em Ibi.

## Detalhes Tecnicos

### Arquivo a Modificar
| Arquivo | Mudanca |
|---|---|
| `src/pages/Oracle.tsx` | Reescrever como wizard multi-etapa com state machine |

### Estado do Wizard
O componente usara um unico `useState` com um objeto que acumula as respostas:

```text
{
  step: 1-6,
  result: "Oyekun" | "Okaran" | ...,
  ireOrIbi: "ire" | "ibi",
  eboApurado: true/false,
  eboTipo: "limpeza" | "prosperidade" | ...,
  oriPrecisa: true/false,
  oriAcao: "ibori" | "oracao" | "ambos",
  iyamiQuer: true/false,
  egbeOrunQuer: true/false,
}
```

### Salvamento no Banco
Apenas na tela final (etapa 6), ao clicar "Iniciar Rotina":
1. Cria entrada em `user_journey` com `oracle_result`, `context` (contendo ire/ibi e respostas), `notes` (resumo textual)
2. Cria `journey_tasks` dinamicamente baseado nas respostas acumuladas
3. Busca rituais por categoria para linkar `ritual_id` quando disponivel
4. Adiciona XP e verifica conquistas

### Indicador de Progresso
Barra de progresso no topo do wizard mostrando "Etapa 2 de 5" com 5 pontos/circulos conectados

### Nenhuma migracao SQL necessaria
Os campos `context` e `notes` em `user_journey` ja existem e sao text, podem armazenar as informacoes do diagnostico

## Resultado Esperado

O aluno vai vivenciar o processo real de consulta do Obi dentro do app: jogar, identificar Ire/Ibi, apurar cada dimensao espiritual (Ebo, Ori, Iyami, Egbe Orun), e receber um plano de acao personalizado. Isso transforma o app em uma verdadeira bussola espiritual que complementa os cursos.

