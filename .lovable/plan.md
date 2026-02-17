
# Plano: Redesign Visual com Imagens IA Yoruba - Replicar UX de Referencia

## O Problema

A diferenca fundamental entre o app de referencia e o nosso e **uma so**: **imagens**. O app de referencia usa ilustracoes IA em absolutamente tudo -- banners, cards, listas, categorias. O nosso app tem zero imagens. Sem imagens, qualquer layout parece vazio e amador, nao importa quao boa seja a tipografia.

Alem disso, alguns padroes de layout da referencia ainda nao estao sendo seguidos com exatidao.

---

## O Que Sera Feito

### Fase 1 - Gerar e Armazenar Imagens IA Yoruba

Criar uma edge function `generate-image` que usa o modelo de geracao de imagens do Lovable AI (`google/gemini-2.5-flash-image`) para gerar ilustracoes com tematica Yoruba e salva-las no Storage do backend.

**Imagens necessarias (conjunto inicial):**

| Imagem | Prompt (tematica) |
|---|---|
| hero-banner | Mulher africana escrevendo em um livro sagrado, estilo ilustracao quente, tons dourados e terrosos |
| obi-oracle | Mao segurando nozes de obi (cola nut), estilo ilustracao sagrada africana |
| ebo-category | Oferenda ritual africana com frutas e velas, estilo ilustracao artistica |
| ibori-category | Pessoa africana em meditacao tocando a propria cabeca (ori), tons dourados |
| oriki-category | Anciao africano cantando/recitando, estilo ilustracao quente |
| egbe-orun-category | Cena espiritual com ancestrais, luz celestial, estilo africano |
| iyami-category | Passaros sagrados ao entardecer, simbolismo de Iyami Osoronga |
| daily-routine | Pessoa em devocao matinal com elementos africanos |
| placeholder-ritual-1 a 4 | Variadas cenas de rituais e praticas espirituais yoruba |

Tambem criar uma pagina admin para gerar mais imagens sob demanda e associa-las a rituais/categorias.

### Fase 2 - Redesign Home (Pixel-Perfect com Referencia)

Seguindo exatamente a imagem 7/13 (Home do app de referencia):

**Estrutura de cima para baixo:**
1. Saudacao "Ola, [Nome]" -- tipografia serif grande e bold (nao leve, BOLD como na referencia)
2. Cards de atalho horizontais com scroll -- cada um com icone + label embaixo, fundo branco, bordas arredondadas, sombra sutil. **6 cards** (Obi, Rituais, Ibori, Oriki, Ebo, Jornada) em scroll horizontal
3. Banner hero -- card arredondado com imagem IA a direita e texto a esquerda ("Monte sua rotina espiritual..."), fundo laranja/terroso quente, exatamente como o "Plano de Vida" da referencia
4. Secao "Destaques" -- scroll horizontal com cards de imagem (imagem grande + titulo + descricao abaixo)
5. Secao "Rituais do Dia" -- lista vertical com imagem redonda a esquerda + titulo + descricao + icone de bookmark

### Fase 3 - Redesign Rituais (Seguir Imagem 8/9)

**Pagina de categoria (ex: Ebo):**
1. Titulo grande serif bold no topo
2. Banner destaque -- card grande com imagem IA e texto por cima (como "Novena das Rosas")
3. Sub-secao com titulo -- "Ebos este mes" ou similar
4. Lista vertical -- cada item com imagem arredondada (quadrado) a esquerda + titulo + subtitulo + icone bookmark a direita + separador fino

**Pagina de lista geral (Oracoes/Rituais):**
1. Banners de subcategoria -- cards largos retangulares com imagem IA a direita e titulo a esquerda (como "Oracoes diarias" e "Oracoes a Santissima Trindade")
2. Secoes agrupadas por categoria com titulo serif bold
3. Cards horizontais com scroll -- imagem quadrada grande + titulo + descricao abaixo
4. Botao "Ver todos" em cinza claro abaixo de cada secao

### Fase 4 - Redesign Leitura de Ritual (Seguir Imagem 10)

1. Card no topo com imagem redonda + titulo + subtitulo + indicador de progresso ("Primeiro dia")
2. Conteudo em tipografia serif grande, generosa, facil de ler
3. Subtitulos em serif bold
4. Fundo branco puro, sem distracao

### Fase 5 - Redesign Jornada/Plano (Seguir Imagem 11)

1. Titulo "Plano de Vida" com icones de calendario e + no header
2. Faixa de dias da semana -- scroll horizontal com dia selecionado em fundo escuro
3. Tarefas organizadas por periodo:
   - "Manha" (icone nascer do sol)
   - "Tarde" (icone sol)
   - "Noite" (icone lua)
4. Cada tarefa: imagem arredondada + titulo + horario + frequencia + checkbox + menu

### Fase 6 - Bottom Nav Refinada

Seguir exatamente o padrao da referencia:
- 4-5 itens
- Icones finos (strokeWidth 1.5)
- Label pequena abaixo
- Item ativo: icone preenchido + barra grossa embaixo (nao ponto)
- Fundo branco solido

---

## Detalhes Tecnicos

### Arquivos a Criar
| Arquivo | Descricao |
|---|---|
| `supabase/functions/generate-image/index.ts` | Edge function para gerar imagens via Lovable AI e salvar no Storage |
| `src/hooks/useGenerateImage.ts` | Hook para chamar a edge function |
| `src/assets/` (multiplos) | Imagens placeholder geradas inicialmente |

### Arquivos a Modificar
| Arquivo | Mudanca |
|---|---|
| `src/pages/Home.tsx` | Redesign completo com imagens, layout de referencia |
| `src/pages/Rituals.tsx` | Banners com imagens, sub-secoes agrupadas, cards com scroll |
| `src/pages/RitualReader.tsx` | Card header com imagem, tipografia maior |
| `src/pages/Journey.tsx` | Faixa de dias, tarefas por periodo, imagens |
| `src/pages/Oracle.tsx` | Imagem IA de fundo, visual mais rico |
| `src/pages/Learn.tsx` | Mesmo padrao visual dos Rituais |
| `src/pages/Profile.tsx` | Ajustes visuais menores |
| `src/components/BottomNav.tsx` | Barra grossa para ativo em vez de ponto |
| `src/index.css` | Tipografia titulos mais bold, ajustes finos |
| `src/pages/Admin.tsx` | Adicionar secao de geracao de imagens |

### Estrategia de Imagens

1. **Fase inicial**: Gerar um conjunto de ~10 imagens base via edge function e salvar no Storage do backend
2. **Admin**: Permitir gerar novas imagens via painel com prompt customizado
3. **Rituais**: Cada ritual pode ter `image_url` populado pelo admin
4. **Fallback**: Quando nao houver imagem, usar gradientes quentes (terrosos/dourados) em vez de cinza vazio

### Migracao SQL Pendente

A migracao de `journey_tasks` e colunas `notes`/`context` em `user_journey` que foi proposta anteriormente ainda precisa ser aprovada para completar o fluxo da Jornada/Plano de Vida.

---

## Resultado Esperado

O app tera a mesma qualidade visual do app de referencia, com ilustracoes IA tematicas Yoruba (orixas, obi, ebo, ancestrais, passaros sagrados) substituindo as imagens cristas, mantendo toda a terminologia e logica Yoruba intacta.
