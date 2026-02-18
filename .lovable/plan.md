

# Harmonizar a Tela "Aprender" com Cards de Categoria Destacados

## Problema Atual

A tela "Aprender" mostra rituais e oferendas em listas simples (icone pequeno + texto), enquanto a tela "Rituais Sagrados" tem cards de categoria bonitos com imagens grandes. O resultado e uma experiencia visual inconsistente -- os cards com imagens ficaram excelentes mas os itens de lista abaixo quebram a harmonia.

## Solucao

Transformar a tela "Aprender" para usar **apenas os cards de categoria com imagens** como navegacao principal. Ao clicar em um card de categoria, o usuario e levado para a lista filtrada de conteudo daquela categoria.

## Como vai funcionar

### Tela Aprender (visao padrao)
- Titulo "Aprender" + subtitulo
- Abas "Rituais" e "Oferendas" (mantidas)
- Chips de filtro de categoria (mantidos, mais compactos)
- Quando "Todos" esta selecionado: mostra **somente os cards de categoria com imagens** (estilo banner, igual a primeira screenshot)
- Quando uma categoria especifica esta selecionada: mostra a lista de itens daquela categoria (estilo lista com thumbnail pequena)

### Remocao da rota /rituais duplicada
- A rota `/rituais` (pagina Rituals.tsx) mostra o mesmo conteudo que a aba Rituais do Aprender, causando duplicidade
- Os links dos cards de categoria na tela Aprender vao filtrar na propria pagina em vez de navegar para outra rota
- A rota `/rituais/:id` para leitura individual sera mantida

## Detalhes Tecnicos

### Arquivo: `src/pages/Learn.tsx`
- Importar `CATEGORY_BANNERS` de `@/lib/categories`
- Na aba Rituais, quando `ritualFilter === ""` (Todos): renderizar os cards de categoria com imagens (CATEGORY_BANNERS) em vez da lista de rituais
- Ao clicar em um card de categoria: chamar `setRitualFilter(banner.key)` para filtrar
- Quando uma categoria esta selecionada: mostrar a lista de rituais filtrada (comportamento atual)
- Aplicar a mesma logica para a aba Oferendas: cards de categoria quando "Todos", lista quando filtrado
- Ajustar altura dos cards para `h-[90px]` com imagem `w-[100px]` no lado direito (igual ao design da screenshot)

### Arquivo: `src/pages/Rituals.tsx`
- Nenhuma alteracao -- a pagina continua existindo para acesso direto via URL ou deep links
- Porem o BottomNav nao aponta mais para ela (ja aponta para `/aprender`)

### Nenhuma mudanca no banco de dados
