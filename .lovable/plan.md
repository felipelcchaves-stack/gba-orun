
# Melhorar modal de ritual: imagem e espacamento

## Problema

1. O modal de ritual nao mostra a imagem vinculada ao ritual, enquanto a pagina completa (`RitualReader`) exibe um header com imagem redonda + titulo + categoria. O modal deveria ter esse mesmo visual.

2. O espacamento entre linhas esta excessivo. Cada linha curta (como "Iba Olodumare") vira um paragrafo com `mb-4` (16px de margem inferior) e `leading-8` (32px de altura de linha), criando muito espaco vazio. Alem disso, ha uma regra `.prose-ritual p` duplicada no CSS (linhas 199 e 200), onde a primeira aplica `text-lg leading-8` e a segunda sobrescreve com `text-base leading-7`, gerando inconsistencia.

## Solucao

### 1. Adicionar imagem no header do modal

Nos modais de ritual (`LinkedRitualButton` no FlowStepRenderer e `RitualHelpButton`), adicionar um mini-header igual ao da pagina `RitualReader`: imagem redonda do ritual ao lado do titulo e categoria.

```text
+------------------------------+
| [img] Titulo do Ritual       |
|        Categoria   Premium   |
+------------------------------+
| Audio player (se houver)     |
| Conteudo markdown...         |
+------------------------------+
```

### 2. Reduzir espacamento no prose-ritual

Ajustar a classe `.prose-ritual p` para usar espacamento mais compacto:
- Remover a regra duplicada (linha 199)
- Mudar `mb-4` para `mb-2` (8px em vez de 16px)
- Mudar `leading-7` para `leading-6` (24px em vez de 28px)
- Manter `white-space: pre-line` para respeitar quebras de linha
- Tambem usar `text-sm` para conteudo dentro de modais ficar mais compacto

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/oracle/FlowStepRenderer.tsx` | No `LinkedRitualButton`, substituir o `DialogHeader` simples por um mini-header com imagem redonda + titulo + categoria, usando `ritual.image_url` |
| `src/components/RitualHelpButton.tsx` | Mesmo ajuste: adicionar imagem do ritual no header do modal |
| `src/index.css` | Remover a regra `.prose-ritual p` duplicada (linha 199). Ajustar a restante para `mb-2 text-sm leading-6` com `white-space: pre-line` |

## Detalhe tecnico

**Header do modal (ambos componentes):**
```tsx
<DialogHeader>
  <div className="flex items-center gap-3">
    <img
      src={ritual.image_url || ritualPlaceholder}
      alt={ritual.title}
      className="w-12 h-12 rounded-full object-cover shrink-0"
    />
    <div>
      <DialogTitle className="font-display">{ritual.title}</DialogTitle>
      <span className="text-xs text-muted-foreground capitalize">{ritual.category}</span>
    </div>
  </div>
</DialogHeader>
```

**CSS corrigido:**
```css
.prose-ritual p { @apply mb-2 text-sm leading-6; color: hsl(var(--muted-foreground)); white-space: pre-line; }
```

Isso reduz o espaco entre linhas pela metade e deixa o texto mais compacto, agradavel para leitura tanto na pagina completa quanto no modal.
