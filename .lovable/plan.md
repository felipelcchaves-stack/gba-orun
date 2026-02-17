
# Adicionar banner horizontal nos modais de ritual

## Problema

O modal de ritual mostra apenas uma pequena imagem redonda (12x12) ao lado do titulo, que e pouco visivel. O usuario quer um **banner horizontal** no topo do modal, como uma capa, para dar mais destaque visual ao ritual.

## Solucao

Substituir a imagem redonda por um banner horizontal no topo do modal, antes do titulo. O banner usara a `image_url` do ritual como imagem de fundo com overlay escuro para garantir legibilidade do titulo sobre ele.

Layout proposto:

```text
+----------------------------------+
| [BANNER IMAGE - full width]      |
| Titulo sobre o banner (overlay)  |
| Categoria                        |
+----------------------------------+
| Audio player (se houver)         |
| Conteudo markdown...             |
| Ver ritual completo              |
+----------------------------------+
```

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/oracle/FlowStepRenderer.tsx` | No `LinkedRitualButton`, substituir imagem redonda por banner horizontal no topo do modal com overlay e titulo sobreposto |
| `src/components/RitualHelpButton.tsx` | Mesmo ajuste: banner horizontal no topo do modal |

## Detalhe tecnico

**Estrutura do banner (ambos componentes):**

```tsx
<DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-0">
  {/* Banner no topo - sem padding */}
  {ritual.image_url && (
    <div className="relative w-full h-36 sm:h-44 rounded-t-2xl overflow-hidden">
      <img
        src={ritual.image_url}
        alt={ritual.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-3 left-4 right-4">
        <h2 className="text-white font-display font-bold text-lg">{ritual.title}</h2>
        <span className="text-white/70 text-xs capitalize">{ritual.category}</span>
      </div>
    </div>
  )}

  {/* Conteudo com padding */}
  <div className="p-4 sm:p-6">
    {/* fallback titulo quando nao tem imagem */}
    {!ritual.image_url && (
      <DialogHeader>
        <DialogTitle className="font-display">{ritual.title}</DialogTitle>
        <span className="text-xs text-muted-foreground capitalize">{ritual.category}</span>
      </DialogHeader>
    )}

    {/* audio, conteudo, link... */}
  </div>
</DialogContent>
```

Pontos-chave:
- `DialogContent` muda de `p-4 sm:p-6` para `p-0` (padding zero) para o banner encostar nas bordas
- O conteudo abaixo do banner recebe padding via wrapper `div` interno
- O banner tem `h-36` em mobile e `h-44` em desktop
- Overlay gradiente escuro na parte inferior para o titulo ficar legivel sobre a imagem
- Quando nao houver imagem, o titulo aparece normalmente como fallback
- O botao X de fechar do Dialog precisa ter `z-10` e cor branca quando houver banner
