
# Campo de Texto Livre no Bloco de Mensagem + Toggle "Aparece no Diagnostico"

## Resumo

Duas melhorias no Flow Builder que dao mais controle ao admin sobre o que o assinante ve e responde durante o fluxo:

1. **Texto livre opcional no bloco Mensagem**: O admin pode ativar um campo de texto no bloco de mensagem para que o assinante escreva algo (ex: uma intencao, um pedido). Esse texto fica salvo como variavel e aparece no diagnostico.

2. **Toggle "Aparece no diagnostico?"**: Todos os blocos que geram resposta ganham um checkbox na config. Quando desmarcado, aquele bloco nao aparece no resumo do diagnostico. Quando marcado, aparece. Por padrao, os blocos que ja aparecem hoje (obi, ire_ibi, yes_no, multiple_choice, open_question) vem marcados, e os demais (message, timer, media) vem desmarcados.

## Detalhes Tecnicos

### 1. Toggle "Aparece no diagnostico?" (config.show_in_diagnosis)

**Arquivo: `src/components/admin/flow-builder/NodeConfigPanel.tsx`**
- Na secao "Informacoes Basicas", para todos os tipos exceto `start` e `diagnosis`, adicionar um checkbox:
  - Label: "Exibir no diagnostico?"
  - Campo: `config.show_in_diagnosis` (boolean)
  - Default: `true` para obi, ire_ibi, yes_no, multiple_choice, open_question; `false` para message, timer, media, conditional

**Arquivo: `src/components/oracle/FlowStepRenderer.tsx`**
- No `DiagnosisStep`, alterar o filtro de respostas (linha ~663):
  - Em vez de filtrar por `skipTypes`, verificar `srcNode.config.show_in_diagnosis`
  - Se o campo nao existir (fluxos antigos), manter o comportamento atual como fallback (skipTypes)

### 2. Campo de texto livre no bloco Mensagem (config.enable_text_input)

**Arquivo: `src/components/admin/flow-builder/NodeConfigPanel.tsx`**
- Na secao de configuracao especifica do tipo `message`, adicionar:
  - Checkbox: "Habilitar campo de texto para o assinante"
  - Campo: `config.enable_text_input` (boolean)
  - Input: "Placeholder do campo" (`config.text_input_placeholder`, string, ex: "Escreva sua intencao...")

**Arquivo: `src/components/oracle/FlowStepRenderer.tsx`**
- No bloco `MESSAGE`, quando `config.enable_text_input === true`:
  - Exibir um `<textarea>` abaixo da mensagem
  - O botao "Continuar" so fica ativo quando o usuario digitar algo
  - Ao clicar, salvar o texto como `answer` (usando o `variable_name` do bloco)
  - Isso faz o texto aparecer automaticamente no diagnostico (desde que `show_in_diagnosis` esteja ativo)

**Arquivo: `src/components/admin/flow-builder/nodes/MessageNode.tsx`**
- Adicionar um indicador visual (pequeno icone de lapis ou badge "Texto") quando `config.enable_text_input` estiver ativo, para o admin ver no canvas que aquele bloco espera input do usuario.

### 3. Persistencia no diagnostico

O texto livre digitado no bloco mensagem ja sera salvo automaticamente no `answers` do `DynamicFlowRunner`, que e passado ao `DiagnosisStep`. Com o toggle `show_in_diagnosis: true`, ele aparecera no resumo. E como as answers sao salvas em `context` (JSON) na tabela `user_journey`, o texto tambem ficara disponivel na pagina de Jornada.

### Fluxo do admin:

```text
Admin abre Flow Builder
  --> Arrasta bloco "Mensagem"
  --> Na config, ativa "Habilitar campo de texto"
  --> Define placeholder "Escreva sua intencao..."
  --> Marca "Exibir no diagnostico?" = sim
  --> Salva
```

### Fluxo do assinante:

```text
Assinante no fluxo
  --> Chega no bloco mensagem com texto livre
  --> Le a mensagem do mestre
  --> Escreve sua intencao no campo
  --> Clica "Continuar"
  --> No diagnostico, ve sua intencao listada no resumo
  --> Salva --> Na Jornada, o texto fica registrado
```

### Arquivos modificados:
- **`src/components/admin/flow-builder/NodeConfigPanel.tsx`**: toggle show_in_diagnosis + enable_text_input + placeholder
- **`src/components/oracle/FlowStepRenderer.tsx`**: logica de textarea no message + filtro do diagnostico por show_in_diagnosis
- **`src/components/admin/flow-builder/nodes/MessageNode.tsx`**: indicador visual de texto livre

Nenhuma mudanca no banco de dados -- tudo fica dentro do campo `config` (JSONB) dos nos.
