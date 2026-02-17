
# Corrigir imagem do orientador que nao aparece

## Problema

A imagem do orientador aparece como icone (emoji) porque a configuracao `guidance_avatar_url` nao existe na tabela `app_settings`. Isso aconteceu porque o admin tentou salvar antes, mas foi deslogado pelo bug de autenticacao (ja corrigido).

## Solucao

O problema principal ja foi resolvido (bug de logout). Agora so falta garantir que o fluxo funcione sem friccao. Vou fazer duas coisas:

### 1. Salvar automaticamente ao clicar "Usar minha foto"

Atualmente o admin precisa clicar "Usar minha foto" e depois "Salvar" separadamente. Vou unificar: ao clicar "Usar minha foto", o sistema ja salva direto no banco, eliminando um passo e evitando esquecimento.

### 2. Tratar caso de URL nula no GuidanceBubble

O componente `GuidanceBubble` ja trata o caso sem avatar (mostra emoji), mas vou garantir que mesmo com string vazia funcione bem.

## Detalhe tecnico

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/AdminGuidance.tsx` | No onClick de "Usar minha foto": alem de preencher o campo, chamar `saveAvatar()` automaticamente com a URL do perfil. Mostrar toast de sucesso. |

### Codigo

No botao "Usar minha foto", alterar o onClick para:

```tsx
onClick={async () => {
  if (profile?.avatar_url) {
    setAvatarUrl(profile.avatar_url);
    // Salvar direto no banco
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "guidance_avatar_url", value: profile.avatar_url, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (!error) {
      qc.invalidateQueries({ queryKey: ["app_settings"] });
      toast.success("Foto do orientador salva!");
    }
  } else {
    toast.info("Voce ainda nao tem foto de perfil. Va em Meu Perfil para enviar uma.");
  }
}}
```

Nenhuma alteracao de banco de dados necessaria. O `upsert` ja lida com criacao e atualizacao.
