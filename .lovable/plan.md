
Objetivo
- Eliminar o erro 401 no webhook da Guru para que novas compras sejam processadas automaticamente (criação/ativação de conta premium).

Diagnóstico confirmado (com evidência)
- O webhook atual valida token em `body.payload.api_token`.
- Os eventos reais da Guru que estão falhando chegam em formato “desembrulhado”, com `api_token` na raiz do JSON.
- Resultado: `body.payload` fica `undefined`, o token lido vira vazio e a função retorna 401.
- Reprodução técnica já feita:
  - Requisição com corpo “desembrulhado” (`api_token` na raiz) => 401 Unauthorized.
  - Requisição com corpo “embrulhado” (`payload.api_token`) => 200 OK.
- Portanto, a causa raiz não é mais o valor do secret, e sim incompatibilidade de formato do payload (shape mismatch).

Plano de correção
1) Normalizar formato de entrada no início da função
- Criar uma variável única de trabalho, por exemplo:
  - se existir `body.payload` e for objeto -> usar `body.payload`
  - senão -> usar `body` (raiz)
- Isso permite aceitar os 2 formatos sem quebrar integração.

2) Ajustar validação de token para usar payload normalizado
- Validar na ordem:
  1. `normalizedPayload.api_token`
  2. fallback em header `x-guru-token`
  3. fallback em `Authorization: Bearer ...`
- Manter resposta 401 quando não bater, mas com log seguro (sem expor secret).

3) Ajustar extração de campos para o mesmo payload normalizado
- `status`, `email`, `buyerName`, `subscription_code`, `transaction`, `value` devem ler primeiro do payload normalizado.
- Manter fallbacks legados atuais para não regressão.

4) Melhorar robustez de status
- Continuar tratando `active/approved/paid` como aprovação.
- Continuar tratando `overdue/unpaid` e `canceled/refunded`.
- Garantir comparação case-insensitive (`toLowerCase`) para evitar falhas por variação de caixa.

5) Logging de observabilidade (sem dados sensíveis)
- Logar somente:
  - se chegou formato root ou payload
  - status extraído
  - email mascarado (ou parcialmente)
  - resultado final do processamento
- Evitar logs com token/secret completos.

6) Verificação pós-correção
- Teste A: payload “desembrulhado” de compra aprovada deve retornar 200 e processar usuário.
- Teste B: payload “embrulhado” deve continuar funcionando.
- Teste C: token inválido deve continuar retornando 401.
- Teste D: evento de cancelamento/inadimplência deve atualizar status corretamente.

Critérios de aceite
- Nova compra da Guru não retorna 401 por erro de formato.
- Usuário comprador é criado/atualizado com premium ativo em evento aprovado.
- Eventos de cancelamento/inadimplência continuam alterando assinatura corretamente.
- Não há regressão para payload no formato antigo.

Riscos e mitigação
- Risco: variações futuras no JSON da Guru.
  - Mitigação: normalização + fallbacks + logs de formato recebido.
- Risco: falsos negativos por `status` em maiúsculo/minúsculo.
  - Mitigação: normalização de string para comparação.
- Risco: exposição de dados sensíveis em log.
  - Mitigação: mascaramento e remoção de logs sensíveis.

Se você aprovar, eu implemento exatamente essa correção de compatibilidade de payload e já deixo um checklist de teste de ponta a ponta para validar com uma compra real.
