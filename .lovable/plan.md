

# Melhorar Visual do Modal de Avaliacao no Mobile

## Problema

O Drawer esta funcionando tecnicamente, mas o visual esta sem personalidade:
- As estrelas vazias sao cinza claro demais, quase invisiveis
- Nao ha hierarquia visual clara entre os elementos
- Falta a identidade vibrante do app (cores douradas, marrom terra)
- O formulario parece generico e "frio"

## Solucao

Ajustes visuais no `src/components/ReviewModal.tsx` para trazer a identidade do Gba-Orun ao modal.

## Detalhes Tecnicos

### Arquivo: `src/components/ReviewModal.tsx`

1. **Estrelas maiores e mais visiveis**: aumentar de `h-10 w-10` para `h-12 w-12` no mobile, e trocar a cor vazia de `text-muted-foreground/30` para `text-[#FFD700]/30` (dourado transparente) -- assim mesmo vazias elas ja comunicam que sao estrelas douradas
2. **Estrelas preenchidas**: manter `fill-accent text-accent` (dourado) mas adicionar um leve `drop-shadow` para brilho
3. **Gap entre estrelas**: aumentar de `gap-1` para `gap-2` no mobile para facilitar o toque
4. **Titulo mais destacado**: adicionar cor `text-[#8B4513]` (marrom terra) ao titulo do Drawer
5. **Botao Enviar**: garantir que use o amarelo ouro com texto escuro e cantos arredondados gordos (`rounded-2xl`)
6. **Botao Agora nao**: bordas mais suaves (`rounded-2xl`)
7. **Textarea**: borda com foco dourado (`focus:ring-accent`)
8. **Espacamento geral**: aumentar `space-y-5` para `space-y-6` no mobile para mais respiro

### Nenhum outro arquivo precisa ser alterado

