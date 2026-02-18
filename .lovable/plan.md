

# Eliminar Cache Offline e Corrigir Persistencia do Flow Builder

## Problema

Existem **3 camadas de cache** causando dados obsoletos:

1. **Service Worker (PWA)** -- intercepta chamadas ao backend e serve respostas antigas do cache do navegador, mesmo quando ha dados novos no servidor
2. **React Query Persister** -- salva TODO o cache de dados no localStorage com validade de 24h. Quando voce recarrega a pagina, os dados velhos do localStorage aparecem antes do servidor responder
3. **staleTime de 5 minutos** -- o React Query considera os dados "frescos" por 5 minutos e nao refaz a consulta ao servidor nesse periodo

Isso explica porque a descricao da mensagem "volta" apos salvar: o fluxo salva corretamente no banco, mas ao recarregar, o cache local (localStorage ou Service Worker) serve a versao antiga antes que o servidor responda.

## O que sera feito

### 1. Remover cache do Service Worker para rotas do backend

Eliminar as regras `runtimeCaching` do `vite.config.ts` que interceptam chamadas de API. O PWA continuara funcionando para instalar o app e cachear arquivos estaticos (HTML, CSS, JS, imagens), mas **nao vai mais interferir nas chamadas de dados**.

### 2. Remover persistencia do React Query no localStorage

Trocar o `PersistQueryClientProvider` por um `QueryClientProvider` normal no `App.tsx`. Isso elimina o cache de 24h que guarda dados velhos entre sessoes. Remover tambem as dependencias `@tanstack/query-sync-storage-persister` e `@tanstack/react-query-persist-client`.

### 3. Reduzir staleTime para dados administrativos

Reduzir o `staleTime` global de 5 minutos para 30 segundos. Isso garante que o React Query consulte o servidor com mais frequencia, especialmente importante no painel admin.

### 4. Invalidar cache do Flow Builder apos salvar

Apos o `useSaveFlowCanvas` completar com sucesso, forcar `refetchType: "all"` nas invalidacoes (ja esta parcialmente implementado) e tambem remover queries inativas para evitar dados fantasma.

---

## Detalhes tecnicos

### Arquivo: `vite.config.ts`

Remover todo o bloco `runtimeCaching` do plugin VitePWA. Manter apenas o `navigateFallbackDenylist`. O PWA continuara pre-cacheando assets estaticos normalmente.

### Arquivo: `src/App.tsx`

- Trocar `PersistQueryClientProvider` por `QueryClientProvider` do `@tanstack/react-query`
- Remover imports de `createSyncStoragePersister` e `PersistQueryClientProvider`
- Remover a constante `persister`
- Reduzir `staleTime` de `1000 * 60 * 5` para `1000 * 30` (30 segundos)
- Reduzir `gcTime` de 24h para 1h

### Limpeza de localStorage existente

Adicionar um `useEffect` no `App.tsx` que remove a chave `gba-orun-cache` do localStorage na primeira carga, para limpar dados antigos que ja estao salvos.

---

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `vite.config.ts` | Remover runtimeCaching do Service Worker |
| `src/App.tsx` | Remover persistencia localStorage, reduzir staleTime |

**Total: 2 arquivos modificados**

## O que NAO muda

- O app continua instalavel como PWA
- Icones, splash screen e modo standalone continuam funcionando
- O Flow Builder continua salvando da mesma forma
- Nenhuma tabela ou funcao backend e alterada

