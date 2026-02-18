

# Plano: Bloqueio de Navegacao Offline + Verificacao do Salvar Fluxo

## 1. Bloqueio de Navegacao quando Offline

**Problema:** Quando o usuario perde conexao, ele ainda pode clicar nos links do BottomNav e navegar para paginas que dependem de dados online (Comunidade, Oraculo, etc.), resultando em erros ou telas vazias.

**Solucao:** Criar um wrapper no BottomNav que intercepta cliques quando offline. Paginas que ja funcionam offline (Rituais, Home com cache) continuam acessiveis. Paginas que exigem conexao (Comunidade, Oraculo, Perfil) mostram um toast de aviso.

### Mudancas:

**Arquivo: `src/components/BottomNav.tsx`**
- Importar `useOnlineStatus` de `@/hooks/useOnlineStatus`
- Importar `toast` de `sonner`
- Definir lista de rotas que funcionam offline: `/`, `/rituais`, `/aprender`, `/jornada`
- No clique de cada link, verificar:
  - Se esta online: navega normalmente
  - Se esta offline E a rota precisa de internet: bloqueia navegacao e mostra toast "Voce esta offline. Esta pagina precisa de conexao."
  - Se esta offline E a rota funciona offline: navega normalmente (dados do cache)
- Trocar `<Link>` por `<button>` + `useNavigate()` para controlar a navegacao programaticamente

**Arquivo: `src/components/OfflineBanner.tsx`**
- Nenhuma mudanca. O banner ja funciona corretamente.

### Rotas offline vs online:

| Rota | Offline? | Motivo |
|------|----------|--------|
| `/` (Home) | Sim | Dados em cache |
| `/rituais` | Sim | Dados em cache |
| `/aprender` | Sim | Dados em cache |
| `/jornada` | Sim | Dados em cache |
| `/comunidade` | Nao | Requer realtime |
| `/perfil` | Nao | Requer auth ativa |
| `/promocoes` | Nao | Requer dados atualizados |
| `/oraculo` | Nao | Requer fluxo + gravacao |
| `/admin` | Nao | Requer auth + escrita |

---

## 2. Verificacao do Salvar Fluxo

**Status: Ja esta corrigido.** Apos analise do codigo atual:

- `useSaveFlowCanvas` (useOracleFlows.ts linhas 143-214) ja possui:
  - Verificacao de sessao ativa antes de salvar (linha 156)
  - Tratamento de erro explicito nos DELETEs (linhas 160-164)
  - Limpeza de _tempId antes de inserir (linhas 170-171)
  - Mapeamento correto de IDs temporarios para UUIDs do banco (linhas 184-188)
  - Invalidacao completa de cache no onSuccess (linhas 207-211)

- `useFlowAutoSave` (useFlowAutoSave.ts) ja possui:
  - Deteccao de dirty via snapshot JSON
  - Cooldown de 5s apos markClean para evitar falso-positivo
  - Salvamento de draft no localStorage como backup
  - Dialogo de restauracao de rascunho

**Nao e necessario nenhuma mudanca adicional no fluxo de salvamento.**

---

## Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/components/BottomNav.tsx` | Interceptar navegacao offline com toast |

**Total: 1 arquivo modificado**

