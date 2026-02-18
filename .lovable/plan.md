

# Adicionar botao de Sair na Home

## Situacao atual

O botao "Sair da conta" existe apenas na pagina de Perfil (`/perfil`). Na Home nao ha nenhum botao de logout visivel.

## O que sera feito

Adicionar um icone de logout (porta com seta) no canto superior direito do header da Home, ao lado do contador de streak. Sera um botao discreto que nao polui o layout, mas fica acessivel.

## Detalhes tecnicos

### Arquivo: `src/pages/Home.tsx`

1. Importar `LogOut` do `lucide-react` e `signOut` do `useAuth`
2. No header (bloco com "Bem-vindo de volta" e o nome), adicionar um botao com o icone `LogOut` no canto direito, ao lado do streak counter
3. Ao clicar, chamar `signOut()` que ja redireciona para `/auth`

Layout do header atualizado:

```text
[Saudacao]              [Streak 🔥] [LogOut]
```

| Arquivo | Acao |
|---------|------|
| `src/pages/Home.tsx` | Adicionar icone de logout no header |

**Total: 1 arquivo, ~5 linhas adicionadas**

