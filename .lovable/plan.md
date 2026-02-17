
# Plano: Foto de Perfil + PWA (App Instalavel)

Duas funcionalidades independentes que transformam o Gba-Orun em algo mais pessoal e mais proximo de um app nativo.

---

## Parte 1: Foto de Perfil com Upload

### O que muda para o usuario
- Na pagina de Perfil, acima do nome, aparece um avatar grande com um botao de camera para trocar a foto
- Na Comunidade, a foto do usuario aparece ao lado dos posts e respostas (em vez da letra inicial)
- Se nao tiver foto, continua mostrando a inicial do nome como hoje

### Detalhes Tecnicos

**1. Storage Bucket (Migration SQL)**
- Criar bucket `avatars` no storage (publico, para URLs diretas)
- RLS: usuarios autenticados podem fazer upload na propria pasta (`user_id/avatar.ext`), qualquer um pode ler

**2. Coluna `avatar_url` na tabela `profiles` (Migration SQL)**
- Adicionar coluna `avatar_url TEXT NULL` na tabela `profiles`

**3. Hook `useAvatarUpload.ts`**
- Funcao que recebe um arquivo, faz upload para `avatars/{user_id}/avatar.{ext}`, obtem a URL publica e atualiza `profiles.avatar_url`
- Invalida query do perfil apos sucesso

**4. Componente `AvatarUpload.tsx`**
- Avatar grande (80px) com a foto atual ou fallback de inicial
- Botao de camera sobreposto no canto inferior direito
- Input file oculto que aceita apenas imagens
- Preview instantaneo antes do upload

**5. Alteracoes na pagina de Perfil (`Profile.tsx` e `ProfileForm.tsx`)**
- Adicionar o `AvatarUpload` acima dos campos de dados pessoais

**6. Alteracoes na Comunidade**
- `useCommunity.ts`: buscar `avatar_url` alem de `display_name` nos profiles
- `CommunityPost.tsx` e `CommunityReplyList.tsx`: usar `AvatarImage` do Radix com a URL, mantendo `AvatarFallback` como backup
- Adicionar `avatar_url` aos tipos `CommunityPost` e `CommunityReply`

**7. Tipo `Profile` (`useProfile.ts`)**
- Adicionar `avatar_url: string | null` ao interface `Profile`

---

## Parte 2: PWA (Progressive Web App)

### O que muda para o usuario
- O app pode ser instalado direto do navegador no celular (Compartilhar > Adicionar a Tela Inicio no iPhone, ou menu do navegador no Android)
- Funciona offline para paginas ja visitadas
- Abre em tela cheia, sem barra do navegador, parecendo um app nativo
- Icone do Gba-Orun na tela inicial do telefone

### Detalhes Tecnicos

**1. Instalar `vite-plugin-pwa`**
- Adicionar dependencia `vite-plugin-pwa`

**2. Configurar `vite.config.ts`**
- Adicionar o plugin `VitePWA` com:
  - `registerType: 'autoUpdate'` (atualiza automaticamente)
  - `navigateFallbackDenylist: [/^\/~oauth/]` (proteger rotas de autenticacao)
  - Manifest completo com nome, cores, icones
  - Estrategia de cache para assets e API

**3. Manifest (`manifest` dentro do plugin)**
- `name`: "Gba-Orun - Sabedoria Ancestral"
- `short_name`: "Gba-Orun"
- `theme_color`: "#228B22" (verde folha)
- `background_color`: "#FFFDD0" (creme)
- `display`: "standalone"
- `icons`: gerar icones PWA 192x192 e 512x512 (podem ser gerados a partir do favicon ou criados como SVG simples)

**4. Meta tags no `index.html`**
- `<meta name="theme-color" content="#228B22">`
- `<link rel="apple-touch-icon" href="/icons/icon-192.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`

**5. Icones PWA**
- Criar `public/icons/icon-192.png` e `public/icons/icon-512.png` (placeholder simples com as cores do app)

**6. Pagina de instalacao `/instalar` (opcional mas recomendada)**
- Pagina simples com instrucoes visuais de como instalar no celular
- Botao que dispara o prompt de instalacao no Android (evento `beforeinstallprompt`)
- Instrucoes para iOS (Compartilhar > Adicionar a Tela de Inicio)

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar bucket `avatars` + coluna `avatar_url` em profiles |
| `src/hooks/useAvatarUpload.ts` | Criar hook de upload de avatar |
| `src/components/profile/AvatarUpload.tsx` | Criar componente de upload |
| `src/components/profile/ProfileForm.tsx` | Adicionar AvatarUpload |
| `src/hooks/useProfile.ts` | Adicionar `avatar_url` ao tipo |
| `src/hooks/useCommunity.ts` | Buscar `avatar_url` dos profiles |
| `src/components/community/CommunityPost.tsx` | Mostrar foto do autor |
| `src/components/community/CommunityReplyList.tsx` | Mostrar foto nas respostas |
| `vite.config.ts` | Configurar plugin PWA |
| `index.html` | Adicionar meta tags PWA |
| `public/icons/` | Criar icones 192 e 512 |
| `src/pages/Install.tsx` | Criar pagina de instalacao (opcional) |
| `src/App.tsx` | Adicionar rota `/instalar` |
