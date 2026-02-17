

# Corrigir logout ao fazer upload de foto

## Problema

Ao fazer upload da foto de perfil, o usuario e deslogado. Isso acontece porque o hook `useAuth` tem uma condicao de corrida: o `onAuthStateChange` pode disparar durante o upload (por refresh de token ou evento interno do Supabase), e a forma como o estado e gerenciado causa perda da sessao.

O problema esta no `useAuth.ts` -- o listener `onAuthStateChange` e registrado DEPOIS do `getSession`, mas o listener pode disparar antes do `getSession` resolver, causando estados inconsistentes. Alem disso, o `useAdmin` faz uma query separada que tambem pode sofrer com timing.

## Solucao

Reorganizar o `useAuth.ts` seguindo o padrao recomendado:

1. Registrar o `onAuthStateChange` ANTES de chamar `getSession`
2. Garantir que o `loading` so vira `false` depois que tudo estiver estavel
3. Evitar que eventos intermediarios (como `TOKEN_REFRESHED`) causem flickering

## Arquivo modificado

| Arquivo | Alteracao |
|---|---|
| `src/hooks/useAuth.ts` | Reorganizar: registrar listener antes de getSession, tratar eventos de forma mais robusta |

## Detalhe tecnico

```tsx
// useAuth.ts corrigido
useEffect(() => {
  let isMounted = true;

  // 1. Registrar listener PRIMEIRO (evita perder eventos)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    }
  );

  // 2. Buscar sessao inicial DEPOIS
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (isMounted) {
      setUser(session?.user ?? null);
      setLoading(false);
    }
  });

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);
```

A mudanca principal e a ordem: listener primeiro, getSession depois. Isso garante que nenhum evento de auth e perdido durante a inicializacao. O flag `isMounted` previne updates em componentes desmontados.

