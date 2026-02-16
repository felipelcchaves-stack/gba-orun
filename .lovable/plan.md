
# Plano Completo: Gba-Orun - Do MVP ao Produto Comercial

## Visao Geral

Transformar o app atual em uma plataforma completa de jornada espiritual gamificada, com visual inspirado na imagem de referencia (cards arredondados, saudacao personalizada, categorias com icones, banner hero com ilustracao, secao de destaques horizontais e bottom nav refinada).

---

## FASE 1 - Redesign Visual (Inspirado na Imagem de Referencia)

### 1.1 Nova Home Page
Recriar a Home seguindo o layout da imagem:
- **Saudacao personalizada**: "Ola, [Nome]!" no topo (usando display_name do perfil do usuario logado, ou "Visitante")
- **3 cards de atalho** em linha horizontal (como "Oracoes / Rosario / Novenas" da imagem), adaptados para: **Obi** (icone de buzios), **Rituais** (icone de livro), **Aprender** (icone de graduacao)
- **Banner hero grande** com gradiente quente (tons terra/dourado) e texto: "Jornada Espiritual - Monte sua rotina com o que os Orixas pedem de voce"
- **Secao "Destaques"** com scroll horizontal de cards com imagens (rituais em destaque ou categorias: Ebo, Ibori, Oriki, Egbe Orun)
- Cantos muito arredondados (border-radius 2xl/3xl), sombras suaves, espacamento generoso

### 1.2 Refinamento do Design System
- Ajustar a paleta para um tom mais quente e elegante (fundo creme mais claro, cards brancos com sombra sutil)
- Adicionar classe `.card-elevated` para cards com sombra e bordas arredondadas como na imagem
- Bottom Nav redesenhada: 5 itens (Inicio, Oraculo, Jornada, Favoritos/Aprender, Mais) com icones mais refinados
- Tipografia: manter Playfair Display para titulos mas aumentar peso visual

### 1.3 Paginas Atualizadas
- **Oracle**: manter logica, melhorar visual dos buzios com cards mais brancos e sombras
- **Rituals**: layout de cards com imagens como na secao "Destaques" da referencia
- **RitualReader**: visual mais limpo, fundo branco, tipografia confortavel

---

## FASE 2 - Jornada do Usuario (Bussola Espiritual)

### 2.1 Fluxo de Jornada Oraculo -> Acao
Criar uma nova pagina `/jornada` que conecta o resultado do Oraculo as acoes necessarias:
- Apos jogar o Obi, o resultado sugere rituais relacionados (campo `trigger_oracle` ja existe na tabela `rituals`)
- Ex: Okaran -> sugere Ebo de protecao; Ejife -> sugere Oriki de agradecimento
- Cards de acao: "Apaziguar Ori" (link para Ibori), "Protecao Iyami" (link para rituais Iyami), "Cuidar do Egbe Orun" (link para oferendas)

### 2.2 Tabela `user_journey` (Nova migracao)
Registrar o progresso do usuario:
- `id`, `user_id`, `oracle_result`, `suggested_ritual_id`, `completed`, `completed_at`, `created_at`
- Permite rastrear quais rituais o usuario ja completou baseado nas consultas do oraculo

### 2.3 Secao de Aprendizado
Nova rota `/aprender` com:
- Cards de conteudo organizados por modulos (Fundamentos, Obi, Ebo, Ibori, Iyami, Egbe Orun)
- Suporte a audio: campo `audio_url` na tabela `rituals` (nova coluna) para que o admin suba URLs de audio
- Player de audio embutido no RitualReader quando `audio_url` estiver preenchido

---

## FASE 3 - Gamificacao

### 3.1 Tabela `user_achievements` (Nova migracao)
- `id`, `user_id`, `achievement_key`, `unlocked_at`
- Achievements pre-definidos com palavras e simbolos Yoruba

### 3.2 Tabela `user_stats` (Nova migracao)
- `id`, `user_id`, `oracle_throws`, `rituals_read`, `streak_days`, `last_active`, `xp_total`

### 3.3 Sistema de Recompensas
Achievements baseados em pratica constante:
- **Palavras Yoruba como recompensas**: "Ase!" (1a consulta), "Ire" (5 consultas), "Alafia" (10 dias seguidos), "Ogbon" (Sabedoria - leu 10 rituais), "Iwa Pele" (Bom carater - 30 dias ativos)
- **Simbolos/Badges**: Icones estilizados de Odu, Opon Ifa, Opele, Iroke Ifa
- Tela de perfil `/perfil` mostrando XP, streak, badges conquistados
- Confete ao desbloquear achievement (animacao CSS)

### 3.4 Integracao com Fluxo
- Apos jogar Obi: +10 XP, verifica achievements
- Apos ler ritual completo: +20 XP
- Streak diario: bonus XP multiplicador
- Toast/notificacao ao desbloquear novo achievement

---

## FASE 4 - Admin Avancado (Controle Total)

### 4.1 Tabela `app_settings` (Nova migracao)
- `id`, `key` (unique), `value` (text/json), `updated_at`
- Chaves: `meta_pixel_id`, `google_ads_id`, `checkout_url`, `offer_price`, `offer_original_price`, `offer_headline`, `offer_video_url`

### 4.2 Painel Admin - Novas Abas
Reestruturar o admin com abas:
- **Rituais**: gerenciamento existente + campo de `audio_url`
- **Configuracoes da Oferta**: formulario para editar pixel, preco, URL de checkout, headline da landing page, URL do video
- **Importador JSON**: ja existe, manter
- **Usuarios**: lista basica de usuarios premium

### 4.3 Dinamismo da Landing Page
A pagina `/oferta` passara a ler os valores de `app_settings`:
- Preco, titulo, URL do video e URL de checkout vem do banco
- Pixel do Meta e Google Ads sao carregados dinamicamente conforme configuracao do admin

---

## FASE 5 - Landing Page Redesenhada

### 5.1 Visual Coerente com o App
Redesenhar `/oferta` seguindo o mesmo design system:
- Cards arredondados, tipografia Playfair Display, tons quentes
- Hero com gradiente terra/dourado (nao mais o gradient-sacred verde)
- Secao de beneficios com icones grandes em cards brancos com sombra
- Depoimentos em cards arredondados com estrelas douradas
- Botao de compra dourado pulsante
- Preco riscado + preco de oferta (lido do banco)

### 5.2 Integracao de Pixels Dinamica
- `initPixel()` passara a buscar o pixel_id de `app_settings` ao inves de constante hardcoded
- Mesmo para Google Ads tag

---

## Resumo Tecnico das Migracoes SQL

1. **Adicionar coluna `audio_url`** na tabela `rituals`
2. **Criar tabela `user_journey`** com RLS (usuario ve apenas suas jornadas)
3. **Criar tabela `user_achievements`** com RLS
4. **Criar tabela `user_stats`** com RLS
5. **Criar tabela `app_settings`** com RLS (leitura publica, escrita admin)
6. Seed de achievements padrao e settings iniciais

## Novos Arquivos a Criar

- `src/pages/Journey.tsx` - Pagina de jornada
- `src/pages/Learn.tsx` - Pagina de aprendizado
- `src/pages/Profile.tsx` - Perfil com XP e badges
- `src/hooks/useJourney.ts` - Hook para jornada
- `src/hooks/useAchievements.ts` - Hook para gamificacao
- `src/hooks/useAppSettings.ts` - Hook para configuracoes dinamicas
- `src/components/AchievementToast.tsx` - Notificacao de conquista
- `src/components/AudioPlayer.tsx` - Player de audio embutido
- `src/components/XPBar.tsx` - Barra de experiencia
- `src/components/StreakCounter.tsx` - Contador de streak

## Arquivos a Modificar

- `src/pages/Home.tsx` - Redesign completo
- `src/pages/Oracle.tsx` - Integrar XP e jornada
- `src/pages/Rituals.tsx` - Novo layout visual
- `src/pages/RitualReader.tsx` - Audio player + XP ao completar
- `src/pages/Oferta.tsx` - Redesign + dados dinamicos
- `src/pages/Admin.tsx` - Abas + config de oferta/pixel
- `src/components/BottomNav.tsx` - 5 itens + icones novos
- `src/lib/pixel.ts` - Pixel dinamico do banco
- `src/index.css` - Novos estilos e animacoes
- `src/App.tsx` - Novas rotas

## Ordem de Execucao Sugerida

1. Migracoes SQL (todas de uma vez)
2. Redesign Home + BottomNav + Design System
3. Sistema de Jornada (Oracle -> Rituais)
4. Gamificacao (XP, Achievements, Perfil)
5. Admin Avancado (config oferta, pixel, audio)
6. Landing Page redesenhada com dados dinamicos
7. Testes end-to-end
