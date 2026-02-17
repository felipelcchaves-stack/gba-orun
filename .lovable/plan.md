
# Recuperar alteracoes do fluxo e corrigir salvamento

## Situacao atual

**Seus dados antigos estao SEGUROS no banco.** O que aconteceu:

1. Voce fez alteracoes no canvas (trocou "Tipo de Ebo" por "Ebo ou Akulebo", entre outras mudancas)
2. Ao salvar, o sistema tentou deletar os nos antigos e inserir os novos
3. A politica de seguranca (RLS) bloqueou AMBAS as operacoes silenciosamente
4. O DELETE retornou "sucesso" mas nao deletou nada (comportamento do PostgREST quando RLS bloqueia)
5. O INSERT falhou com o erro que voce viu

**Resultado:** Os dados originais continuam no banco, intactos. Suas alteracoes estao apenas no canvas do navegador (enquanto voce nao recarregar a pagina).

## Causa raiz

Sua sessao de administrador provavelmente expirou. As tabelas `oracle_flow_nodes` e `oracle_flow_edges` exigem role de admin para INSERT/UPDATE/DELETE, mas permitem SELECT publico. Por isso voce consegue VER o fluxo mas nao salvar.

## Plano de acao

### Passo 1: Recuperar acesso de admin

- Faca logout e login novamente no app para renovar sua sessao
- Depois de logar, volte ao Flow Builder e suas alteracoes AINDA estarao no canvas (o React mantem o estado)

### Passo 2: Corrigir o salvamento para ser seguro (codigo)

O bug critico e que o `useSaveFlowCanvas` faz DELETE antes do INSERT sem verificar se o DELETE realmente funcionou. Se o INSERT falhar depois, os dados se perdem.

**Arquivo: `src/hooks/useOracleFlows.ts`**

Modificar `useSaveFlowCanvas` para:
- Verificar o resultado do DELETE (checar se retornou erro)
- Fazer INSERT primeiro em uma tabela temporaria ou validar permissoes antes de deletar
- Alternativa mais simples e eficaz: **verificar se o usuario tem permissao ANTES de deletar**, fazendo um INSERT de teste ou checando a sessao

A abordagem escolhida sera:
1. Antes de qualquer operacao, verificar se ha sessao ativa (`supabase.auth.getSession()`)
2. Se nao houver sessao, lancar erro claro ("Sessao expirada, faca login novamente")
3. Verificar erros nos DELETEs (o PostgREST retorna erro quando RLS bloqueia com token valido mas sem permissao)
4. Somente se os DELETEs confirmarem sucesso, prosseguir com os INSERTs

### Passo 3: Salvar novamente

Apos relogar e com a correcao aplicada, clique em "Salvar Fluxo" novamente.

## Detalhes tecnicos

### Mudanca em `useSaveFlowCanvas` (useOracleFlows.ts)

```text
Antes:
  await supabase.from("oracle_flow_edges").delete().eq("flow_id", flowId);
  await supabase.from("oracle_flow_nodes").delete().eq("flow_id", flowId);
  // INSERT sem verificar se DELETE funcionou

Depois:
  // 1. Verificar sessao ativa
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessao expirada. Faca login novamente para salvar.");

  // 2. DELETE com verificacao de erro
  const { error: delEdgesErr } = await supabase.from("oracle_flow_edges").delete().eq("flow_id", flowId);
  if (delEdgesErr) throw new Error("Erro ao limpar edges: " + delEdgesErr.message);

  const { error: delNodesErr } = await supabase.from("oracle_flow_nodes").delete().eq("flow_id", flowId);
  if (delNodesErr) throw new Error("Erro ao limpar nodes: " + delNodesErr.message);

  // 3. INSERT (ja existente, sem mudanca)
```

### Arquivo modificado: 1

1. `src/hooks/useOracleFlows.ts` - adicionar verificacao de sessao e erros nos DELETEs

## Acao imediata recomendada

1. **NAO recarregue a pagina** - suas alteracoes estao no canvas
2. Aprove este plano para eu aplicar a correcao
3. Faca logout e login novamente
4. Volte ao Flow Builder e salve
