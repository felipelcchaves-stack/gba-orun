

# Corrigir botao de conclusao do Diagnostico

## Problema

Apos completar o diagnostico, o botao diz "Salvar e Ir para Minha Rotina", o que confunde o usuario porque nao existe uma tela chamada "Minha Rotina". Alem disso, o redirecionamento vai para `/` (Home) em vez de ir para a pagina de Jornada (`/jornada`), onde o usuario pode acompanhar e marcar as tarefas como concluidas.

## Solucao

Duas mudancas simples no arquivo `src/components/oracle/FlowStepRenderer.tsx`:

1. **Renomear o botao**: de "Salvar e Ir para Minha Rotina" para **"Salvar e Ir para Minha Jornada"**
2. **Corrigir o redirecionamento**: de `navigate("/")` para `navigate("/jornada")`, para que o usuario caia direto na pagina onde vera suas tarefas pendentes

## Detalhes Tecnicos

### Arquivo: `src/components/oracle/FlowStepRenderer.tsx`

- Linha 648: trocar `navigate("/")` por `navigate("/jornada")`
- Linha 748: trocar o texto "Salvar e Ir para Minha Rotina" por "Salvar e Ir para Minha Jornada"

Mudanca de 2 linhas em um unico arquivo. A pagina de Jornada ja exibe as tarefas pendentes do dia com checklist, entao o usuario vai ver imediatamente o que precisa fazer.

