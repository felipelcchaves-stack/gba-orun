

# Plano: Landing Page de Alta Conversao com SEO Completo

A pagina `/oferta` atual e funcional mas basica. Vamos transforma-la numa landing page profissional de alta conversao, com todos os elementos que vendem e SEO otimizado para busca organica e anuncios.

---

## O que muda para o usuario

- Pagina visualmente impactante, com secoes estrategicas que guiam o visitante ate a compra
- SEO completo para aparecer no Google e render previews bonitos em redes sociais
- BottomNav escondido na `/oferta` (pagina limpa, sem distracao)
- Pixel do Meta e Google Ads carregados automaticamente via configuracoes do admin
- Estrutura JSON-LD para rich snippets no Google
- Pagina 100% responsiva (mobile-first, ja que a maioria do trafego vem de celular)

---

## Estrutura da Landing Page (secoes em ordem)

1. **Top bar** -- Faixa fina com urgencia ("Oferta por tempo limitado" ou similar, configuravel)
2. **Hero** -- Headline grande + sub-headline + preco com ancora + botao CTA pulsante
3. **VSL** -- Video embed (YouTube/Vimeo) ou placeholder
4. **Dor/Problema** -- "Voce ja passou por isso?" com 3-4 dores do publico
5. **Solucao** -- "Apresentamos o Gba-Orun" com descricao do produto
6. **Beneficios** -- 6 cards com icones (o que esta incluso)
7. **Como funciona** -- 3 passos simples (1. Acesse, 2. Consulte, 3. Pratique)
8. **Depoimentos** -- Cards com foto placeholder, nome e texto
9. **FAQ** -- Accordion com perguntas frequentes
10. **Garantia** -- Selo de garantia de 7 dias
11. **CTA Final** -- Preco, ancora e botao grande
12. **Footer** -- Mini footer com links legais

---

## Detalhes Tecnicos

### 1. Reescrever `src/pages/Oferta.tsx`

Landing page completa com todas as secoes acima. Dados dinamicos vindos do `useAppSettings`:
- headline, price, originalPrice, ctaText, checkoutUrl, videoUrl
- Novos campos: `offer_urgency_text`, `offer_guarantee_days`

Sem BottomNav: a pagina sera detectada no `BottomNav.tsx` e escondida (assim como ja acontece com `/admin`).

### 2. Novas settings no admin (`AdminOfferSettings.tsx`)

Adicionar campos:
- `offer_urgency_text` (texto da barra de urgencia)
- `offer_guarantee_days` (dias de garantia, default "7")

Migration para inserir essas chaves na tabela `app_settings`.

### 3. SEO e meta tags dinamicas

Como e uma SPA (React), as meta tags do `index.html` sao globais. Para a landing page especificamente:
- Atualizar as meta tags globais no `index.html` para serem mais orientadas a venda (ja que a oferta e a principal porta de entrada de trafego pago)
- Adicionar `<script type="application/ld+json">` com schema `Product` diretamente no componente Oferta (injetado via `useEffect` + `document.head`)
- Adicionar tag `<link rel="canonical">` dinamica para `/oferta`

### 4. Pixels automaticos (`src/lib/pixel.ts` e `App.tsx`)

- No `AppContent`, apos carregar settings, chamar `initPixelWithId(settings.meta_pixel_id)` automaticamente
- Adicionar suporte ao Google Ads gtag: nova funcao `initGoogleAds(id)` que injeta o script do gtag
- Disparar `PageView` no Meta Pixel ao entrar na oferta
- Disparar `InitiateCheckout` ao clicar no CTA (ja existe)

### 5. Esconder BottomNav na oferta (`BottomNav.tsx`)

Adicionar `/oferta` a lista de rotas que escondem o nav (como ja acontece com `/admin`).

### 6. `robots.txt` e `sitemap`

- Atualizar `robots.txt` para incluir referencia ao sitemap
- Criar `public/sitemap.xml` estatico com as rotas publicas (`/`, `/oferta`, `/auth`)

### 7. Componentes auxiliares (dentro de Oferta.tsx)

Tudo inline no arquivo para simplicidade:
- `UrgencyBar` -- barra fixa no topo
- `PainSection` -- secao de dores
- `HowItWorks` -- 3 passos
- `FAQSection` -- accordion com Radix
- `GuaranteeSection` -- selo de garantia
- `LandingFooter` -- footer minimalista

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Inserir novas chaves `offer_urgency_text` e `offer_guarantee_days` em `app_settings` |
| `src/pages/Oferta.tsx` | Reescrever com todas as secoes de alta conversao |
| `src/components/admin/AdminOfferSettings.tsx` | Adicionar novos campos |
| `src/components/BottomNav.tsx` | Esconder nav na rota `/oferta` |
| `src/lib/pixel.ts` | Adicionar `initGoogleAds()` |
| `src/App.tsx` | Inicializar pixels automaticamente com settings |
| `index.html` | Refinar meta tags para SEO de venda |
| `public/robots.txt` | Adicionar referencia ao sitemap |
| `public/sitemap.xml` | Criar sitemap estatico |

