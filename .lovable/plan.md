

# SEO Dinamico via Painel Admin

## Problema

Os metadados de SEO (titulo, descricao, OG image, etc.) estao fixos no `index.html`. Para alterar qualquer informacao, e necessario mexer no codigo. O ideal e poder editar tudo pelo painel administrativo.

## Limitacao Importante

Como o app e uma SPA (Single Page Application), crawlers de redes sociais (Facebook, Twitter, WhatsApp) leem o HTML antes do JavaScript executar. A solucao client-side atualiza as tags para navegadores e buscadores modernos (Google), mas para previews em redes sociais, sera necessario republicar apos alteracoes. Mesmo assim, ter os valores no admin facilita muito a gestao.

## Solucao

### 1. Novos campos no banco de dados

Inserir as seguintes chaves na tabela `app_settings`:

| Chave | Valor Padrao |
|---|---|
| `seo_title` | Gba-Orun -- Oraculo dos Buzios & Sabedoria Ancestral |
| `seo_description` | Faca seus cuidados espirituais orientado/guiado... |
| `seo_og_image` | (URL atual da OG image) |
| `seo_canonical_url` | https://gba-orun.com |
| `seo_twitter_card` | summary_large_image |

### 2. Secao "SEO" no Painel Admin

Adicionar novos campos no `AdminOfferSettings.tsx`:

- Titulo do Site (seo_title)
- Descricao do Site (seo_description)
- URL da Imagem OG (seo_og_image)
- URL Canonica (seo_canonical_url)
- Twitter Card Type (seo_twitter_card)

Esses campos ficam junto com os ja existentes de oferta e pixels, agrupados em uma secao visual separada com um subtitulo "SEO e Redes Sociais".

### 3. Hook `useDynamicSEO`

Criar um hook React que:
- Le os valores de SEO do `useAppSettings`
- Atualiza dinamicamente as meta tags do `document.head` via `useEffect`
- Tags atualizadas: `title`, `description`, `og:title`, `og:description`, `og:image`, `twitter:title`, `twitter:description`, `twitter:image`, `canonical`

### 4. Integrar o hook no App

Chamar `useDynamicSEO()` no componente raiz (`App.tsx`) para que as tags sejam atualizadas assim que os dados carregarem.

### 5. Limpar hardcode do index.html

Manter apenas valores minimos de fallback no `index.html` (titulo basico e charset), removendo os metadados duplicados que serao gerenciados dinamicamente.

## Detalhes Tecnicos

### Arquivos modificados/criados:
- **Migracao SQL**: inserir 5 novas linhas em `app_settings`
- **`src/hooks/useDynamicSEO.ts`** (novo): hook que atualiza meta tags do head
- **`src/components/admin/AdminOfferSettings.tsx`**: adicionar campos de SEO
- **`src/App.tsx`**: chamar `useDynamicSEO()`
- **`index.html`**: simplificar removendo meta tags duplicadas (manter fallbacks basicos)

### Fluxo:

```text
Admin salva SEO --> app_settings (banco) --> useAppSettings carrega --> useDynamicSEO atualiza <head>
```

Mudancas em 4 arquivos existentes + 1 novo hook + 1 migracao SQL.

