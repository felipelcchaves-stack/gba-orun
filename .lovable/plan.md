

# Redesign Completo da Landing Page + Modo Demo

## Resumo

Recriar a pagina `/oferta` inspirada no estilo Duolingo (limpa, convidativa, com mockups animados do app dentro de molduras de celular) e criar um **modo demo completo** onde o visitante navega pelo app real (Oraculo com fluxo completo, Rituais, Jornada) sem salvar dados e sem precisar de login.

---

## Parte 1: Modo Demo Completo

### Como funciona para o visitante

1. Clica em "Experimentar Gratis" na landing page
2. Entra no app real em modo demo (rota `/demo`)
3. Pode navegar: Inicio, Oraculo (fluxo completo do Obi), Rituais, Aprender, Jornada
4. Todos os fluxos funcionam normalmente, mas **nada e salvo** no banco
5. Ao chegar no diagnostico do Oraculo (final do fluxo), ve o resultado mas o botao diz "Assine para salvar seus resultados" e redireciona ao checkout
6. Conteudo premium mostra preview com CTA de assinatura
7. Nao aparece para assinantes (ja tem acesso total)
8. Nao da acesso ao Admin nem Comunidade

### Navegacao no modo demo

- BottomNav adaptado: Inicio, Oraculo, Rituais, Aprender, Jornada + botao dourado "Assinar"
- Banner fixo no topo: "Voce esta no modo demonstracao" com botao "Assinar agora"
- Sem link para Admin, Comunidade, Perfil ou Promocoes

---

## Parte 2: Nova Landing Page (estilo Duolingo)

### Principios de design (inspirados no Duolingo)

- Layout limpo e espaçado, muito ar ao redor dos elementos
- Secoes alternadas com fundos suaves (creme / branco / marrom escuro)
- Mockups de celular com moldura CSS mostrando telas reais do app
- Animacoes sutis de entrada (fade-up, scale-in) conforme o usuario scrolla
- Botoes "gordinhos" com sombra e animacao pulse-gold
- Tipografia grande e confiante nos titulos

### Estrutura da pagina (de cima pra baixo)

**1. Barra de Urgencia (sticky topo)**
- Fundo `gradient-sacred` (marrom terra)
- Texto de urgencia dinamico + botao "Entrar"

**2. Hero Section**
- Fundo creme limpo
- Lado esquerdo (desktop): headline grande + subtitulo mencionando "Metodo Oluwo Ifatokun" + preco + 2 botoes (CTA principal dourado "Quero Comecar Agora" + secundario "Experimentar Gratis" que leva ao `/demo`)
- Lado direito (desktop): mockup de celular CSS mostrando a tela Home do app (estatico, estilizado)
- Mobile: empilhado, mockup abaixo
- Badge no topo: "Metodo Oluwo Ifatokun"

**3. Secao Autoridade**
- Fundo escuro (`gradient-sacred`)
- Imagem (`hero-banner.jpg`) com texto sobre o Oluwo Ifatokun e seu metodo
- "Baseado no metodo do Oluwo Ifatokun, sacerdote de Ifa dedicado a preservar e transmitir a sabedoria ancestral Yoruba"

**4. Secao Dores**
- Fundo creme
- Titulo: "Voce ja passou por isso?"
- Cards com borda esquerda dourada e icones em tons da paleta (sem vermelho)

**5. Galeria "Veja como funciona" (estilo Duolingo)**
- 3 a 4 mockups de celular lado a lado (scroll horizontal no mobile)
- Cada mockup e um componente React estatico que imita visualmente a tela do app:
  - **Oraculo**: Mostra os 4 obis e a pergunta "Como posso te ajudar hoje?"
  - **Rituais**: Lista de conteudos com categorias
  - **Jornada**: Progresso circular e tarefas do dia
  - **Aprender**: Grid de categorias
- Cada mockup tem um titulo embaixo ("Consulte o Oraculo", "Siga os Rituais", etc.)
- Animacao: mockups entram com fade-up escalonado conforme scroll (usando Intersection Observer)
- Botao centralizado abaixo: "Experimentar Agora" -> `/demo`

**6. Secao Demo CTA (destaque)**
- Fundo com gradiente suave dourado
- Titulo: "Experimente antes de assinar"
- Subtitulo: "Navegue pelo app completo, faca uma consulta ao Oraculo e veja o resultado -- sem precisar criar conta"
- Botao grande: "Iniciar Demonstracao Gratuita" -> `/demo`

**7. Beneficios**
- 6 cards com icones em fundo circular marrom/dourado
- Layout grid 2 colunas

**8. Como Funciona**
- 3 passos com circulos `gradient-sacred` e numeros
- Assine -> Consulte -> Pratique

**9. Avaliacoes Reais**
- Reviews aprovados de 5 estrelas do banco + fallback
- Avatar com iniciais (circulo com fundo dourado + letra)
- Grid 2 colunas no desktop, stack no mobile

**10. Planos de Assinatura**
- Cards dos planos do banco
- Plano recomendado com borda dourada e badge "Mais Popular"
- Mostrar economia no plano anual se aplicavel

**11. FAQ**
- Perguntas atuais + nova: "O que e o metodo Oluwo Ifatokun?"
- Resposta: explicacao sobre a tecnica e como foi integrada ao app

**12. Garantia**
- Escudo dourado + texto de garantia

**13. CTA Final**
- Fundo `gradient-sacred`
- Texto branco, preco grande, CTA dourado
- Botao secundario "Ou experimente gratis" -> `/demo`

**14. Footer**
- Links para Termos e Privacidade
- Copyright

---

## Detalhes Tecnicos

### Arquivos novos

1. **`src/contexts/DemoContext.tsx`**
   - React Context com `isDemo`, `enterDemo()`, `exitDemo()`
   - Quando `isDemo = true`, hooks de escrita viram no-ops

2. **`src/lib/demoData.ts`**
   - Perfil demo: `{ display_name: "Visitante", is_premium: false }`
   - Stats demo: `{ streak_days: 3, total_xp: 150, level: 2 }`
   - Entradas de jornada ficticias (3 dias)
   - Tarefas de exemplo (5 tarefas, 3 completas)

3. **`src/pages/Demo.tsx`**
   - Layout wrapper do modo demo
   - Envolve as paginas com `DemoProvider`
   - Banner fixo no topo "Modo demonstracao"
   - Navegacao interna entre as telas do app
   - BottomNav customizado (sem Admin/Comunidade, com botao "Assinar")

4. **`src/components/landing/PhoneMockup.tsx`**
   - Componente de moldura de celular CSS (borda arredondada, notch, sombra)
   - Recebe children e renderiza dentro da "tela"
   - 4 variantes estaticas: OracleMockup, RitualsMockup, JourneyMockup, LearnMockup

5. **`src/components/landing/AuthoritySection.tsx`**
   - Secao do Oluwo Ifatokun com imagem e texto

6. **`src/components/landing/DemoBanner.tsx`**
   - Banner fixo do modo demo ("Voce esta no modo demonstracao")

### Arquivos modificados

1. **`src/pages/Oferta.tsx`** -- Reescrita completa com nova estrutura
2. **`src/App.tsx`** -- Adicionar rota `/demo/*` sem ProtectedRoute, envolta por DemoProvider
3. **`src/components/BottomNav.tsx`** -- Esconder tambem em rotas `/demo`, pois o Demo.tsx tera seu proprio nav
4. **`src/components/oracle/FlowStepRenderer.tsx`** -- No diagnostico, se `isDemo`, trocar botao "Salvar" por "Assine para salvar" com link para checkout
5. **`src/components/PremiumLockModal.tsx`** -- No modo demo, ajustar CTA para checkout direto

### Hooks modificados no modo demo

- `useAuth` -- retorna usuario demo ficticio (sem gravar sessao)
- `useProfile` -- retorna perfil demo
- `useUserStats` -- retorna stats demo
- `useJourney` -- retorna entradas demo ficticias
- `usePremium` -- retorna `isPremium: false`
- `useAddJourneyEntry`, `useCompleteTask`, `useAddXP` -- viram no-ops silenciosos (retornam sem fazer nada)

Esses hooks checam o contexto `isDemo` e, se verdadeiro, retornam dados do `demoData.ts` ao inves de consultar o banco.

### Animacoes na landing page

- Mockups de celular: fade-up escalonado com `IntersectionObserver` (sem biblioteca extra, usando `useEffect` + `useRef`)
- CTAs: `animate-pulse-gold` (ja existe)
- Secoes: `animate-fade-up` com delay conforme entram na viewport
- Transicao suave entre secoes alternadas (creme/branco/escuro)

### Paleta (mesma do app)

- Fundo: creme `hsl(30 33% 97%)` / branco `hsl(0 0% 100%)`
- Secoes escuras: `gradient-sacred` (marrom terra)
- CTAs: dourado `hsl(45 90% 52%)` com `shadow-gold`
- Textos: marrom escuro `hsl(20 20% 20%)`
- Cards: branco com `shadow-soft` e bordas `rounded-2xl`

### Dados dinamicos mantidos

- Headline, CTA text, preco, garantia, urgencia -> `app_settings`
- Planos e checkout URLs -> `subscription_plans`
- Avaliacoes -> `user_reviews` (5 estrelas, aprovados)
- Fluxos do Oraculo -> `oracle_flows` (dados reais para a demo funcionar)

