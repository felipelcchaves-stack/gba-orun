
# Alerta de Confirmacao no Bloco Sim/Nao

## Problema

Quando o aluno responde "Nao" para perguntas importantes (Ebo, Iyami, Egbe Orun, Ori), ele segue direto em frente sem nenhum alerta. O mestre/orientador precisa poder configurar um aviso que aparece antes de confirmar o "Nao", guiando o aluno a reconsiderar.

## Solucao -- Sem criar novo tipo de bloco

Adicionar campos opcionais ao bloco **Sim/Nao** que ativam um alerta de confirmacao quando o aluno clica em "Nao":

| Campo novo no NodeConfigPanel | Descricao |
|---|---|
| **Alerta ao negar** (config.no_alert_enabled) | Toggle liga/desliga |
| **Titulo do alerta** (config.no_alert_title) | Ex: "Tem certeza?" |
| **Mensagem do alerta** (config.no_alert_message) | Ex: "Sem apurar o Ebo, o problema pode persistir..." |
| **Audio do alerta** (config.no_alert_audio_url) | Audio opcional do mestre no alerta |
| **Texto do botao confirmar** (config.no_alert_confirm_label) | Ex: "Tenho certeza, nao quero" |
| **Texto do botao voltar** (config.no_alert_cancel_label) | Ex: "Vou reconsiderar" |

## Comportamento na tela do aluno

1. O aluno clica em "Nao"
2. Se `no_alert_enabled` estiver ativo, em vez de avancar imediatamente, aparece uma tela intermediaria com:
   - O titulo do alerta (ex: "Tem certeza?")
   - A mensagem do mestre com o balao de orientacao (GuidanceBubble)
   - Audio do mestre (se configurado)
   - Dois botoes: "Vou reconsiderar" (volta para a pergunta) e "Tenho certeza" (avanca para o proximo no)
3. Se `no_alert_enabled` nao estiver ativo, funciona como hoje -- avanca direto

## O que o admin controla

- Decidir em QUAIS perguntas Sim/Nao o alerta aparece (pode ser em todas, em nenhuma, ou so em algumas)
- Escrever a mensagem de alerta personalizada para cada pergunta
- Gravar audio de orientacao especifico para o alerta
- Personalizar os textos dos botoes

## Arquivos modificados

| Arquivo | O que muda |
|---|---|
| `src/components/admin/flow-builder/NodeConfigPanel.tsx` | Adicionar campos de alerta na secao do bloco yes_no |
| `src/components/oracle/FlowStepRenderer.tsx` | No bloco yes_no, ao clicar "Nao", verificar se ha alerta configurado e mostrar tela intermediaria antes de avancar |

## Detalhes tecnicos

### NodeConfigPanel -- Novos campos no bloco yes_no

Dentro da secao "Configuracao Especifica" do bloco yes_no, adicionar:
- Checkbox "Ativar alerta ao negar"
- Quando ativo, exibir campos: titulo do alerta, mensagem, URL do audio, textos dos botoes

### FlowStepRenderer -- Logica do alerta

O bloco yes_no ganha um estado local `showNoAlert`. Ao clicar "Nao":
- Se `config.no_alert_enabled` for true: seta `showNoAlert = true` e renderiza a tela de alerta
- Se false: chama `onNext("nao", "nao")` normalmente

Na tela de alerta:
- Botao "Vou reconsiderar": seta `showNoAlert = false` (volta para a pergunta -- o fluxo NAO avanca)
- Botao "Tenho certeza": chama `onNext("nao", "nao")` (avanca normalmente pelo fluxo)

Isso cria o efeito de "looping" que voce quer -- o aluno so sai daquela pergunta se confirmar que realmente quer dizer "Nao", ou se mudar para "Sim".
