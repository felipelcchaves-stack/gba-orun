
# Melhorar o Modal de Avaliacao para Mobile

## Problema

O modal de avaliacao usa um Dialog centralizado que no mobile:
- Flutua no meio da tela, desperdicando espaco
- As estrelas ficam pequenas para toque
- O textarea fica apertado
- Quando o teclado abre, o conteudo pode ficar escondido

## Solucao

Usar o padrao **Drawer (bottom sheet)** no mobile e manter o Dialog no desktop. O projeto ja tem o componente `Drawer` (vaul) instalado e configurado.

## Detalhes Tecnicos

### Arquivo: `src/components/ReviewModal.tsx`

1. Importar `useIsMobile` de `@/hooks/use-mobile`
2. Importar `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription` de `@/components/ui/drawer`
3. Extrair o conteudo do formulario (estrelas, textarea, botoes) para um componente interno `ReviewForm`
4. Renderizar condicionalmente:
   - **Mobile** (`isMobile = true`): usar `Drawer` com o conteudo dentro de `DrawerContent`
   - **Desktop** (`isMobile = false`): manter o `Dialog` atual
5. Aumentar o tamanho das estrelas no mobile: de `h-8 w-8` para `h-10 w-10`
6. Aumentar a area de toque dos botoes de estrela: de `p-1` para `p-2`
7. Ajustar o padding geral para dar mais respiro no mobile

### Nenhum outro arquivo precisa ser alterado
- O hook `useIsMobile` ja existe
- O componente `Drawer` ja existe
- As props do `ReviewModal` nao mudam
