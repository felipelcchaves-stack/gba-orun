
# Modo Offline para Assinantes

## O que muda para o usuario

Quando o assinante perder a conexao, em vez de ver erros ou tela em branco, ele continuara vendo:
- Rituais e oferendas que ja acessou (texto completo + imagens)
- O fluxo do oraculo padrao (se ja foi carregado antes)
- Um banner sutil no topo: "Voce esta offline — mostrando conteudo salvo"

Quando a conexao voltar, o app atualiza automaticamente.

## Abordagem tecnica

Usar o React Query como camada de cache principal (`gcTime` e `staleTime` longos) combinado com `localStorage` para persistir os dados entre sessoes. O Service Worker (ja configurado via PWA) cuida do cache de assets estaticos e imagens.

---

## Mudancas

### 1. Configurar persistencia do React Query

Usar `persistQueryClient` do TanStack Query para salvar o cache em `localStorage`. Assim, quando o app abre offline, os dados da ultima sessao estao disponiveis imediatamente.

**Arquivo: `src/App.tsx`**
- Trocar `new QueryClient()` por um com `gcTime` alto (24h) e `staleTime` de 5 minutos
- Adicionar `PersistQueryClientProvider` com storage em `localStorage`

**Dependencia nova:** `@tanstack/query-sync-storage-persister` + `@tanstack/react-query-persist-client`

### 2. Hook de deteccao de rede

Criar um hook `useOnlineStatus` que monitora `navigator.onLine` e os eventos `online`/`offline`.

**Arquivo novo: `src/hooks/useOnlineStatus.ts`**
- Retorna `{ isOnline: boolean }`
- Usa `addEventListener('online')` e `addEventListener('offline')`

### 3. Banner de offline

Componente visual sutil que aparece no topo quando offline.

**Arquivo novo: `src/components/OfflineBanner.tsx`**
- Usa `useOnlineStatus`
- Renderiza um banner amarelo fixo no topo: "Voce esta offline — mostrando conteudo salvo"
- Desaparece automaticamente quando reconectar

**Arquivo: `src/App.tsx`**
- Renderizar `<OfflineBanner />` acima das rotas

### 4. Melhorar cache do Service Worker para APIs

Aumentar o cache do Workbox para chamadas ao backend, especialmente para rituais e oferendas.

**Arquivo: `vite.config.ts`**
- Adicionar regras de runtimeCaching mais granulares:
  - Rituais/oferendas: `CacheFirst` com fallback (cache valido por 24h)
  - Auth/premium: `NetworkOnly` (sempre precisa de rede)
- Aumentar `maxEntries` de 50 para 200
- Aumentar `maxAgeSeconds` de 300 para 86400 (24h)

### 5. Queries com `staleTime` adequado por tipo de dado

Ajustar os hooks existentes para que dados de conteudo (rituais, oferendas, fluxos) tenham `staleTime` longo, enquanto dados sensíveis (premium, auth) mantenham `staleTime` curto.

**Arquivos modificados:**
- `src/hooks/useRituals.ts` — adicionar `staleTime: 1000 * 60 * 30` (30 min)
- `src/hooks/useOfferings.ts` — idem
- `src/hooks/useOracleFlows.ts` — idem para nodes/edges

---

## Resumo de arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | QueryClient persistido + OfflineBanner |
| `src/hooks/useOnlineStatus.ts` | Novo hook |
| `src/components/OfflineBanner.tsx` | Novo componente |
| `vite.config.ts` | Cache rules melhoradas |
| `src/hooks/useRituals.ts` | staleTime longo |
| `src/hooks/useOfferings.ts` | staleTime longo |
| `src/hooks/useOracleFlows.ts` | staleTime longo para nodes/edges |

**Total: 7 arquivos (2 novos, 5 modificados)**
**1 dependencia nova** (`@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister`)
