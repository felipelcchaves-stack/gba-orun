

# Mockups Realistas + Hero Impactante na Landing Page

## Problema Atual
Os mockups atuais sao muito abstratos -- mostram apenas circulos e retangulos coloridos genéricos dentro de molduras de celular. Nao transmitem a experiencia real do app e nao geram desejo de uso. Alem disso, estao apenas em carrossel, sem destaque visual na hero.

## Solucao

### 1. Mockups Muito Mais Realistas
Reescrever os 4 componentes de conteudo dos mockups (`OracleMockupContent`, `RitualsMockupContent`, `JourneyMockupContent`, `LearnMockupContent`) para replicar fielmente as telas reais do app, incluindo:

**OracleMockupContent (Oraculo):**
- Header "Como posso te ajudar hoje?" igual ao real
- Cards de fluxo com icone Sparkles em fundo colorido, titulo e descricao (ex: "Consulta do Obi", "Ebos e Oferendas")
- Visualmente identico a tela real do Oracle.tsx

**HomeMockupContent (NOVO - para o Hero):**
- Saudacao "Ola, Visitante!" com icone de streak
- Mini banner "Jornada Espiritual" com gradiente escuro
- Cards de destaque com thumbnails coloridas (usando gradientes ao inves de imagens reais para manter leve)
- Barra inferior simulada com icones

**RitualsMockupContent (Rituais):**
- Cards realistas com thumbnail colorida, titulo do ritual, categoria, e icone de cadeado premium
- Separacao visual por categoria (Ebo, Oriki, etc.)

**JourneyMockupContent (Jornada):**
- Card hero com gradiente sacred, circulo de progresso SVG com porcentagem
- Lista de tarefas com checkmarks (2 completas, 1 pendente)
- Barra de XP no topo

**LearnMockupContent (Aprender):**
- Grid de categorias com gradientes coloridos distintos por categoria
- Titulos e contadores de conteudo

### 2. Hero com Mockup em Destaque (nao so carrossel)
- No hero, ao lado do texto (desktop), exibir o **HomeMockupContent** -- um mockup grande e realista da tela Home do app
- O mockup do hero sera ligeiramente maior que os do carrossel (escala 1.1x)
- No mobile, o mockup aparece abaixo do texto do hero
- Adicionar uma sombra mais dramatica e um leve angulo/rotacao 3D para dar profundidade (estilo Duolingo, onde o mockup parece "flutuar")

### 3. Galeria com Layout Variado (nao so carrossel linear)
- Manter o scroll horizontal no mobile
- No desktop (md+), exibir os 4 mockups com layout escalonado: os 2 do meio ligeiramente elevados (translateY negativo) criando um efeito de "onda"
- Cada mockup mantem a animacao fade-up escalonada ja existente

---

## Detalhes Tecnicos

### Arquivo modificado: `src/components/landing/PhoneMockup.tsx`

**HomeMockupContent (NOVO):**
- Saudacao com nome "Visitante" e badge de streak (icone fogo + "3")
- Mini card com gradiente marrom escuro simulando o banner de jornada
- 3 mini cards de destaque com thumbnails coloridas (gradientes CSS)
- Estilo identico ao Home.tsx real

**OracleMockupContent (reescrito):**
- Titulo centralizado "Como posso te ajudar hoje?" com subtitulo
- 2-3 cards de fluxo com: icone em fundo colorido arredondado, titulo bold, descricao curta
- Visual identico ao Oracle.tsx real

**RitualsMockupContent (reescrito):**
- 4 cards com: thumbnail colorida (gradiente), titulo do ritual, badge de categoria, icone de cadeado dourado no ultimo
- Visual identico ao Rituals.tsx real

**JourneyMockupContent (reescrito):**
- Card hero com gradiente sacred + circulo SVG de progresso (60%, com strokeDasharray real)
- Frase motivacional "Seu Ori agradece cada passo"
- 3 tarefas: 2 com check verde + line-through, 1 pendente
- Visual identico ao Journey.tsx / TodayHeroCard

**LearnMockupContent (reescrito):**
- Header "Categorias"
- Grid 2x3 com cards coloridos: cada um com gradiente distinto (dourado para Ebo, verde para Oriki, roxo para Iyami, etc.)
- Titulo e numero de itens em cada card

### Arquivo modificado: `src/pages/Oferta.tsx`

**Hero Section (linhas 121-178):**
- Trocar `OracleMockupContent` por `HomeMockupContent` no hero
- Adicionar wrapper com estilo 3D: `transform: perspective(1000px) rotateY(-5deg) rotateX(2deg)` + sombra `shadow-2xl`
- Mostrar mockup tambem no mobile (abaixo do texto), nao apenas `hidden md:block`

**Galeria (linhas 199-222):**
- No desktop, adicionar `md:items-end` no container flex
- Aplicar `md:-translate-y-4` nos mockups do meio (indice 1 e 2) para efeito escalonado
- Adicionar um PhoneMockup extra com HomeMockupContent no inicio (totalizando 5 mockups: Home, Oraculo, Rituais, Jornada, Aprender)

### Componente PhoneMockup (moldura)
- Adicionar prop `size` com opcoes "default" e "large"
- "large": w-[260px] h-[500px] para o hero
- Adicionar barra de status simulada no topo (hora, bateria, sinal) para mais realismo
- Adicionar indicador de home (barrinha inferior) no bottom da tela
