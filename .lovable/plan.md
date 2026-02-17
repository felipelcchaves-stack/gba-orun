

# Compactar modal de ritual e remover link

## Problema

1. O espacamento entre paragrafos ainda esta grande. Cada `<p>` gerado pelo Markdown tem `mb-2` (8px) e `leading-6` (24px), mas como textos rituais tem muitas linhas curtas, o espaco acumulado impede ver o conteudo todo sem rolar muito.

2. O link "Ver ritual completo" tira o aluno da jornada do oraculo. Deve ser removido.

## Solucao

### 1. Reduzir espacamento no CSS

Ajustar `.prose-ritual` para ser mais compacto:
- Trocar `leading-relaxed` por `leading-snug` no container
- Trocar `mb-2 leading-6` por `mb-1 leading-5` nos paragrafos
- Reduzir margens dos headings (`mb-3` para `mb-2`, `mb-4` para `mb-2`)
- Reduzir espaco das listas (`mb-4` para `mb-2`)

### 2. Remover link "Ver ritual completo"

Remover o bloco `<Link to={/rituais/...}>` dos dois componentes: `FlowStepRenderer.tsx` e `RitualHelpButton.tsx`. Tambem remover os imports de `Link` e `ExternalLink` que ficam sem uso.

### 3. Reduzir padding interno

Trocar `p-4 sm:p-6` por `p-3 sm:p-4` na area de conteudo dos modais para ganhar mais espaco.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/index.css` | Ajustar `.prose-ritual` container para `leading-snug`. Paragrafos para `mb-1 text-sm leading-5`. Headings e listas com margens menores. |
| `src/components/oracle/FlowStepRenderer.tsx` | Remover link "Ver ritual completo" (linhas 115-122). Remover imports de `Link` e `ExternalLink`. Reduzir padding para `p-3 sm:p-4`. |
| `src/components/RitualHelpButton.tsx` | Remover link "Ver ritual completo" (linhas 63-70). Remover imports de `Link` e `ExternalLink`. Reduzir padding para `p-3 sm:p-4`. |

## Detalhe tecnico

**CSS atualizado (index.css):**

```css
.prose-ritual {
  @apply leading-snug;
}
.prose-ritual h1 { @apply text-2xl font-display font-bold mb-2; color: hsl(var(--foreground)); }
.prose-ritual h2 { @apply text-xl font-display font-bold mb-2; color: hsl(var(--foreground)); }
.prose-ritual h3 { @apply text-lg font-display font-bold mb-1; }
.prose-ritual p { @apply mb-1 text-sm leading-5; color: hsl(var(--muted-foreground)); white-space: pre-line; }
.prose-ritual ul { @apply list-disc pl-6 mb-2 space-y-0.5; }
.prose-ritual ol { @apply list-decimal pl-6 mb-2 space-y-0.5; }
```

**Remocao do link (ambos componentes):**

Deletar o bloco inteiro do `<Link>` e os imports nao utilizados (`Link` de react-router-dom, `ExternalLink` de lucide-react).

