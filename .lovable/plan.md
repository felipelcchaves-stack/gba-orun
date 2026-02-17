

# Preservar quebras de linha nos rituais e tornar modais responsivos

## Problema 1: Quebras de linha ignoradas

O conteudo dos rituais e salvo com quebras de linha (`\n`), mas o ReactMarkdown trata `\n` simples como espaco (comportamento padrao do Markdown). Resultado: todo o texto aparece corrido em um unico bloco.

**Solucao:** Adicionar a prop `breaks` do ReactMarkdown em todos os locais que renderizam conteudo de rituais. Essa prop faz com que `\n` simples se torne `<br>`, respeitando as quebras de linha originais. Tambem garantir que o CSS `prose-ritual` inclua `white-space: pre-line` no paragrafo para maior seguranca.

## Problema 2: Modais nao responsivos

Os modais de ritual (tanto no `FlowStepRenderer` quanto no `RitualHelpButton`) usam `max-w-lg` fixo sem ajustes para telas pequenas. Em celulares, o modal pode cortar conteudo ou ficar apertado.

**Solucao:** Ajustar as classes dos `DialogContent` para incluir margens laterais em mobile (`mx-4`), altura maxima segura (`max-h-[85vh]`), e padding adequado. Usar `w-[calc(100vw-2rem)]` em mobile com `sm:max-w-lg` para desktop.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/pages/RitualReader.tsx` | Adicionar prop `breaks` no ReactMarkdown (linha 109) |
| `src/components/oracle/FlowStepRenderer.tsx` | No `LinkedRitualButton`: adicionar `breaks` no ReactMarkdown (linha 102), trocar `prose prose-sm` por `prose-ritual`, e tornar o `DialogContent` responsivo |
| `src/components/RitualHelpButton.tsx` | Adicionar `breaks` no ReactMarkdown, trocar `prose prose-sm` por `prose-ritual`, e tornar o `DialogContent` responsivo |
| `src/index.css` | Na classe `.prose-ritual p`, adicionar `white-space: pre-line` como seguranca extra |

## Detalhe tecnico

**ReactMarkdown com breaks:**
```tsx
<ReactMarkdown breaks>{ritual.content_full}</ReactMarkdown>
```
A prop `breaks` converte `\n` em `<br>`, preservando as quebras de linha do autor.

**DialogContent responsivo:**
```tsx
<DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
```
Isso garante que em mobile o modal tenha margem lateral de 1rem de cada lado, e em desktop mantenha a largura maxima de `lg`.

**CSS prose-ritual (seguranca extra):**
```css
.prose-ritual p { @apply mb-4 text-base leading-7; color: hsl(var(--muted-foreground)); white-space: pre-line; }
```
O `white-space: pre-line` preserva as quebras de linha mesmo fora do ReactMarkdown.

