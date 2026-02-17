
# Plano: Redesign UX Completo Inspirado na Referencia Visual

## O Que Muda

O app de referencia (cristao) tem um estilo visual muito especifico que o nosso app atual nao segue. As diferencas principais sao:

### Diferencas Identificadas (Referencia vs. Atual)

| Aspecto | App Referencia | Nosso App Atual |
|---|---|---|
| **Fundo** | Branco/Creme muito claro (#FAF8F5) | Bege acinzentado escuro |
| **Tipografia titulos** | Serif elegante e grande, peso leve | Playfair Display (ok, mas peso muito grosso) |
| **Tipografia corpo** | Sans-serif leve e arejada | Nunito (ok, mas muito densa) |
| **Cards** | Brancos puros, bordas quase invisiveis, sombra sutil | Cards com borda visivel e fundo acinzentado |
| **Imagens** | Grandes, arredondadas, ocupam bastante espaco | Pequenas ou ausentes |
| **Chips de categoria** | Fundo solido escuro (selecionado) ou contorno leve | Fundo colorido com emoji |
| **Lista de conteudo** | Imagem + titulo + descricao em lista vertical | Apenas titulo e icone |
| **Banner hero** | Imagem real com texto cursivo por cima | Gradiente solido com emoji |
| **Bottom nav** | Minimalista, 5 itens, icones finos | Similar mas precisa refinar |
| **Espacamento** | Muito generoso, respira | Mais compacto |
| **Pagina de leitura** | Fundo branco, tipografia serif elegante, imagem redonda | Card sobre fundo colorido |

---

## Fase 1 - Design System (Cores + Tipografia)

### 1.1 Nova Paleta CSS
Atualizar `src/index.css` com tons mais claros e quentes:
- **background**: Creme claro (#FAF8F5) em vez do bege escuro atual
- **card**: Branco puro (#FFFFFF) com sombra sutil
- **border**: Quase invisivel (cinza muito claro)
- **foreground**: Marrom escuro quente para texto

### 1.2 Tipografia
Trocar Google Fonts para uma combinacao mais proxima da referencia:
- **Titulos**: Manter Playfair Display mas com peso 400/600 (mais leve e elegante, como na referencia)
- **Corpo**: Trocar Nunito por **Inter** ou manter Nunito com peso mais leve (300/400)
- Aumentar espacamento entre linhas globalmente

---

## Fase 2 - Home Page (Inspirada na Imagem 1)

### 2.1 Saudacao
- Manter "Ola, [Nome]!" mas com tipografia serif mais leve e elegante
- Remover o "Axe!" - deixar mais clean

### 2.2 Cards de Atalho (3 colunas)
- Fundo branco puro, sem borda visivel, apenas sombra suave
- Icones mais refinados, sem fundo colorido ao redor
- Texto em serif abaixo do icone (como "Oracoes / Rosario / Novenas" da referencia)
- Adaptacao Yoruba: **Obi** / **Rituais** / **Aprender**

### 2.3 Banner Hero
- Em vez de gradiente solido, usar uma imagem de fundo (campo `hero_image_url` que o admin pode trocar via `app_settings`) com texto cursivo/serif por cima
- Texto: algo como "Jornada Espiritual" em estilo italic serif
- Subtitulo: "Comece agora"
- Overlay escuro sutil para legibilidade

### 2.4 Secao Categorias
- Titulo "Categorias" em serif
- Cards horizontais com scroll, cada um tendo imagem de fundo + nome por cima (como "Destaques" na referencia)
- Sem emojis - usar imagens reais ou gradientes bonitos

### 2.5 Secao Destaques
- Cards grandes com imagem ocupando a maior parte
- Titulo e subtipo abaixo da imagem
- Scroll horizontal

---

## Fase 3 - Pagina de Rituais/Conteudo (Inspirada nas Imagens 2 e 3)

### 3.1 Chips de Filtro
- Estilo: chip selecionado = fundo preto/escuro com texto branco (como na referencia "Todos" preto)
- Chips nao selecionados = fundo transparente com borda leve
- Sem emojis nos chips

### 3.2 Lista de Rituais
- Cada item: imagem arredondada a esquerda (grande, ~80x80px) + titulo em serif + descricao curta em cinza
- Sem icones de cadeado inline - cadeado aparece como badge sutil
- Layout mais arejado, mais espaco entre itens

---

## Fase 4 - Pagina de Leitura (Inspirada nas Imagens 4 e 5)

### 4.1 Cabecalho
- Remover o header colorido/gradiente
- Botao de voltar simples (seta) no topo
- Imagem redonda/arredondada ao lado do titulo (como na referencia "Oracao diaria" com foto circular)
- Titulo em serif grande
- Descricao/subtitulo em cinza

### 4.2 Conteudo
- Fundo branco puro, sem card wrapper
- Tipografia serif para subtitulos, sans-serif para corpo
- Secoes "Atividades sugeridas" com chips de filtro (Todas, Diariamente, etc.)
- Separadores sutis entre secoes

---

## Fase 5 - Pagina de Oraculo

- Manter a logica dos buzios
- Visual: fundo branco, cards dos buzios brancos com sombra minimalista
- Resultado em card branco com tipografia mais elegante
- Menos cores saturadas, mais sutil e clean

---

## Fase 6 - Demais Paginas (Journey, Learn, Profile)

Aplicar o mesmo tratamento visual:
- Fundos brancos/creme
- Cards sem bordas visiveis, apenas sombras
- Tipografia serif leve para titulos
- Mais espaco, mais ar

---

## Fase 7 - Landing Page (/oferta)

Redesenhar seguindo a mesma linguagem visual:
- Hero com fundo creme claro (nao mais gradiente escuro) ou imagem real
- Cards de beneficios brancos com sombra
- Depoimentos em cards brancos
- Tipografia coerente com o resto do app

---

## Fase 8 - Bottom Nav

- Icones mais finos (strokeWidth 1.5)
- Sem labels ou labels muito pequenas
- Indicador do item ativo: ponto ou underline sutil (nao cor forte)

---

## Sobre os "Caprinos" (Conteudo Tematico)

Todo o conteudo textual e icones serao mantidos como Yoruba. O plano adapta apenas o **estilo visual** (layout, tipografia, cores, espacamento) do app cristao de referencia, preservando:
- Terminologia Yoruba (Obi, Ebo, Ibori, Oriki, Egbe Orun, Iyami)
- Icones e simbolos relacionados a cultura Yoruba
- Emojis contextuais onde apropriado (mas com mais sobriedade)

O admin pode trocar imagens de banner, hero e categorias pelo painel de administracao usando os campos ja existentes em `app_settings` e `rituals.image_url`.

---

## Resumo Tecnico dos Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/index.css` | Nova paleta de cores (mais clara), tipografia mais leve, espacamentos |
| `tailwind.config.ts` | Ajustes de font-family se necessario |
| `src/pages/Home.tsx` | Redesign completo seguindo layout da referencia |
| `src/pages/Rituals.tsx` | Lista com imagens, chips escuros, layout arejado |
| `src/pages/RitualReader.tsx` | Remover header colorido, layout branco clean |
| `src/pages/Oracle.tsx` | Visual mais clean e branco |
| `src/pages/Learn.tsx` | Mesmo padrao visual dos Rituais |
| `src/pages/Journey.tsx` | Cards brancos, mais espaco |
| `src/pages/Profile.tsx` | Layout clean |
| `src/pages/Oferta.tsx` | Redesign coerente com novo visual |
| `src/components/BottomNav.tsx` | Icones finos, estilo minimalista |

Nenhuma migracao SQL necessaria - apenas mudancas visuais no frontend.
