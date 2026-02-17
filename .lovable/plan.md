
# Usar foto do perfil como avatar do mentor

## O que muda

No painel admin de Orientações do Mestre, adicionar um botao "Usar minha foto" ao lado do campo de URL do avatar. Ao clicar, o sistema busca a foto do perfil do admin logado e preenche automaticamente o campo, salvando como avatar do orientador.

## Como funciona

1. O admin clica em "Usar minha foto"
2. O sistema busca o `avatar_url` do perfil do usuario logado (tabela `profiles`)
3. Preenche o campo de URL com essa foto
4. O admin clica em "Salvar" normalmente (fluxo ja existente)

## Detalhe tecnico

### Arquivo modificado

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/AdminGuidance.tsx` | Importar `useProfile`. Adicionar botao "Usar minha foto" que copia `profile.avatar_url` para o campo `avatarUrl`. |

### Alteracao no componente

- Importar `useProfile` de `@/hooks/useProfile`
- Chamar `const { data: profile } = useProfile()` no componente
- Adicionar um botao ao lado do campo de URL do avatar:

```tsx
{profile?.avatar_url && (
  <button
    onClick={() => setAvatarUrl(profile.avatar_url!)}
    className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-sm font-semibold shrink-0"
  >
    Usar minha foto
  </button>
)}
```

Nenhuma alteracao de banco de dados necessaria. O campo `guidance_avatar_url` em `app_settings` ja existe e continua sendo usado normalmente.
