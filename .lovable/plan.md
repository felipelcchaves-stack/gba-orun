

# Corrigir erro de RLS ao criar ritual

## Problema encontrado

Ao investigar os logs de rede, descobri que a requisicao POST para criar o ritual foi enviada **sem autenticacao**. O header `authorization` continha a chave anonima em vez do JWT do usuario logado. Resultado: `auth.uid()` retornou nulo, a politica RLS verificou `has_role(null, 'admin')` que retornou falso, e a insercao foi bloqueada.

**Causa raiz:** Quando o codigo e atualizado (hot-reload), a pagina recarrega e a sessao de autenticacao pode nao ser restaurada a tempo. O formulario continua visivel na tela, mas o usuario ja nao esta autenticado. Ao submeter, a requisicao vai sem token.

## Solucao

Adicionar verificacao de sessao ativa antes de executar qualquer mutacao administrativa. Se a sessao nao existir, exibir uma mensagem pedindo para o usuario fazer login novamente.

## Alteracoes

| Arquivo | O que muda |
|---|---|
| `src/hooks/useRituals.ts` | Nas funcoes `useCreateRitual`, `useUpdateRitual` e `useDeleteRitual`, verificar se existe sessao ativa antes de executar a mutacao. Se nao houver, lancar erro claro "Sessao expirada. Faca login novamente." |
| `src/pages/Admin.tsx` | No `handleSave`, tratar o erro de sessao expirada e redirecionar para a tela de login (limpar o estado do usuario) |

## Detalhe tecnico

No `mutationFn` de cada mutacao, adicionar antes da operacao:

```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error("Sessao expirada. Faca login novamente.");
```

Isso garante que:
1. Se a sessao foi perdida por hot-reload, o usuario recebe uma mensagem clara
2. Nao envia requisicoes ao banco sem autenticacao
3. O toast de erro orienta o usuario a fazer login novamente

## Impacto

- Nenhuma mudanca no banco de dados
- Nenhuma mudanca nas politicas RLS (elas estao corretas)
- Apenas uma camada de protecao no frontend para evitar requisicoes sem autenticacao

