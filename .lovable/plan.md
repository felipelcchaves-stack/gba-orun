
# Correção: E-mail de acesso não enviado ao comprador

## Problema
O webhook usa `supabase.auth.admin.generateLink({ type: "recovery" })` que apenas **gera** o link de recuperação e o retorna como objeto, mas **nao envia nenhum e-mail**. O log "Recovery email triggered" era falso — indicava apenas que a geração do link teve sucesso.

## Solucao

Substituir `generateLink` por uma chamada direta a `supabase.auth.admin.inviteUserByEmail(email)` que:
- Envia um e-mail real de convite ao usuario
- Permite que ele defina sua senha ao clicar no link
- Funciona com o service_role_key que ja temos

### Arquivo a alterar
`supabase/functions/guru-webhook/index.ts` (linhas 185-201)

### Codigo atual (nao envia e-mail)
```typescript
const { error: linkError } = await supabase.auth.admin.generateLink({
  type: "recovery",
  email,
  options: {
    redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/reset-password`,
  },
});
```

### Codigo corrigido (envia e-mail de convite)
```typescript
const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/reset-password`,
});
```

Porem, como o usuario ja foi criado com `email_confirm: true`, o `inviteUserByEmail` pode falhar pois o usuario ja existe. Nesse caso, a alternativa mais segura e usar `resetPasswordForEmail` via fetch direto na Auth API:

```typescript
const resetRes = await fetch(`${supabaseUrl}/auth/v1/recover`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
  },
  body: JSON.stringify({
    email,
    gotrue_meta_security: {},
  }),
});
```

Esta chamada ao endpoint `/auth/v1/recover` realmente dispara o e-mail de recuperacao de senha para o usuario.

## Detalhes tecnicos

1. **Trocar** `generateLink` pelo endpoint REST `/auth/v1/recover` que envia o e-mail
2. **Ajustar** o log para refletir o resultado real (`Recovery email sent` vs `Recovery email failed`)
3. **Manter** o bloco try/catch para nao bloquear o fluxo principal
4. **Apos deploy**, reenviar manualmente o e-mail para `escolaifatokunmcc@gmail.com` usando o painel admin ou chamando o endpoint de recover

## Acao imediata pos-correcao
Disparar manualmente o e-mail de recuperacao para o usuario `escolaifatokunmcc@gmail.com` que ja esta criado mas nunca recebeu suas credenciais.
