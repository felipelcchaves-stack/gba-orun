

# Corrigir: Texto Livre do Bloco Mensagem Nao Aparece no Diagnostico

## Problema

O bloco de Ori (tipo `message` com campo de texto livre ativado) foi preenchido pelo assinante, mas nao aparece no resumo do diagnostico. Isso acontece porque:

1. O no e do tipo `message`
2. O admin ativou `enable_text_input` mas nao marcou `show_in_diagnosis`
3. Como `show_in_diagnosis` esta `undefined`, o codigo cai no fallback que exclui todos os nos do tipo `message`

## Solucao

Ajustar a logica de filtragem do diagnostico para que blocos `message` com `enable_text_input: true` aparecam automaticamente, mesmo sem o admin marcar o toggle manualmente. Isso faz sentido porque se o admin habilitou um campo de texto livre, a intencao clara e que essa resposta seja visivel no resumo.

## Detalhes Tecnicos

### Arquivo: `src/components/oracle/FlowStepRenderer.tsx` (linha ~686)

Alterar o filtro do diagnostico de:

```typescript
const showInDiagnosis = (srcNode.config as any)?.show_in_diagnosis;
if (showInDiagnosis !== undefined) return showInDiagnosis === true;
const skipTypes = ["start", "message", "timer", "media", "conditional"];
return !skipTypes.includes(srcNode.node_type);
```

Para:

```typescript
const showInDiagnosis = (srcNode.config as any)?.show_in_diagnosis;
if (showInDiagnosis !== undefined) return showInDiagnosis === true;
// Blocos message com texto livre habilitado aparecem automaticamente
if (srcNode.node_type === "message" && (srcNode.config as any)?.enable_text_input) return true;
const skipTypes = ["start", "message", "timer", "media", "conditional"];
return !skipTypes.includes(srcNode.node_type);
```

Uma linha adicionada em 1 arquivo. Nenhuma mudanca no banco de dados.
