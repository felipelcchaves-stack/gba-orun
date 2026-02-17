

# Corrigir upload direto de imagem do orientador

## Problema

O erro "new row violates row-level security policy" acontece porque a politica de seguranca do bucket `avatars` exige que o caminho do arquivo comece com o ID do usuario logado (ex: `user-id/arquivo.png`). O codigo atual usa `guidance-avatar/timestamp.png`, que nao bate com a regra.

## Solucao

Alterar o caminho do upload para incluir o ID do usuario, respeitando a politica existente.

## Detalhe tecnico

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/AdminGuidance.tsx` | Corrigir o `filePath` no `handleFileUpload` para usar `${user.id}/guidance-avatar-${Date.now()}.${ext}` em vez de `guidance-avatar/${Date.now()}.${ext}`. Importar `useAuth` para obter o `user.id`. |

### Codigo

No `handleFileUpload`, mudar de:

```tsx
const filePath = `guidance-avatar/${Date.now()}.${ext}`;
```

Para:

```tsx
const filePath = `${user.id}/guidance-avatar-${Date.now()}.${ext}`;
```

E adicionar no topo do componente:

```tsx
const { user } = useAuth();
```

Isso garante que o caminho respeita a politica RLS do bucket e o upload funciona sem erro.

