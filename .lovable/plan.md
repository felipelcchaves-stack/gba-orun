

# Rastreamento Completo: UTMs + Eventos Facebook/CAPI

## Resumo

Implementar captura e repasse de UTMs em toda a jornada do usuario, e adicionar todos os eventos padrao do Facebook Pixel que estao faltando (ViewContent, AddToCart, CompleteRegistration) alem de eventos customizados para acoes importantes.

---

## 1. Captura e Repasse de UTMs

### O que sera feito
- Criar um utilitario `src/lib/utm.ts` que:
  - Ao carregar a landing page, le os parametros `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` e `fbclid` da URL
  - Salva no `sessionStorage` (para persistir durante a navegacao SPA)
  - Exporta funcao `getUtmParams()` para recuperar os UTMs salvos
  - Exporta funcao `appendUtmsToUrl(url)` que adiciona os UTMs como query params a qualquer URL de checkout

### Onde sera usado
- **Oferta.tsx**: ao abrir link de checkout da Guru, os UTMs sao anexados a URL
- **PremiumLockModal.tsx**: idem
- **DemoBanner.tsx**: idem
- **Demo.tsx**: idem
- **Auth.tsx**: salvar UTMs no perfil do usuario ao fazer signup (campo `utm_source`, `utm_medium`, `utm_campaign` na tabela `profiles`)

### Repasse para Facebook
- O `fbclid` capturado sera preservado automaticamente pelo Pixel
- Os UTMs serao enviados como `custom_data` nos eventos CAPI para melhor atribuicao

---

## 2. Novos Eventos de Pixel

### ViewContent
- **Onde**: ao montar a pagina `/oferta` (useEffect no Oferta.tsx)
- **Dados**: `{ content_name: "Landing Page", content_category: "oferta" }`
- **CAPI**: tambem enviado server-side se o usuario estiver logado

### AddToCart
- **Onde**: quando o usuario clica em um plano especifico (seleciona o card do plano) -- antes de ir ao checkout
- **Dados**: `{ content_name: plan.name, value: plan.price, currency: "BRL" }`
- **Nota**: diferente do InitiateCheckout, que dispara quando abre o link externo; AddToCart dispara ao demonstrar interesse no plano

### CompleteRegistration
- **Onde**: ao completar o onboarding (OnboardingWizard.tsx, no submit final)
- **Dados**: `{ content_name: "Onboarding Completed" }`
- **CAPI**: tambem enviado server-side

### Purchase (browser-side)
- **Onde**: adicionar na pagina de "boas-vindas pos-compra" ou detectar quando o usuario volta do checkout com status de premium ativo
- **Alternativa pragmatica**: o Purchase via CAPI no webhook ja cobre isso; o browser-side seria redundancia para deduplicacao do Meta (que e boa pratica)

### Eventos Customizados
- `DemoStarted`: quando o usuario entra no `/demo`
- `DemoOracleCompleted`: quando completa o fluxo do Oraculo na demo
- `PremiumContentClicked`: quando clica em conteudo premium bloqueado

---

## 3. Melhoria no CAPI

### Adicionar UTMs ao CAPI
- Modificar `src/lib/capi.ts` para incluir UTMs nos `custom_data` de cada evento
- Modificar `supabase/functions/meta-capi/index.ts` para repassar `custom_data` ao Meta

### Adicionar event_id para deduplicacao
- Gerar um `event_id` unico (UUID) para cada evento
- Enviar o mesmo `event_id` tanto no Pixel (browser) quanto no CAPI (server)
- Isso permite que o Meta deduplique os eventos corretamente

---

## Detalhes Tecnicos

### Novo arquivo: `src/lib/utm.ts`
- `captureUtms()`: le `window.location.search`, salva UTMs no `sessionStorage`
- `getUtmParams()`: retorna objeto com os UTMs salvos
- `appendUtmsToUrl(url: string)`: adiciona UTMs como query params a uma URL
- `getUtmString()`: retorna os UTMs como string para analytics

### Arquivo modificado: `src/lib/pixel.ts`
- Adicionar: `trackViewContent(data)`, `trackAddToCart(data)`, `trackCompleteRegistration()`, `trackCustomEvent(eventName, data)`
- Adicionar suporte a `event_id` em todos os eventos (parametro `eventID` do fbq)
- Gerar UUID via `crypto.randomUUID()` e retornar para uso no CAPI

### Arquivo modificado: `src/lib/capi.ts`
- Aceitar `event_id` opcional para deduplicacao
- Aceitar `custom_data` opcional para UTMs e dados extras
- Enviar UTMs nos custom_data

### Arquivo modificado: `supabase/functions/meta-capi/index.ts`
- Aceitar e repassar `event_id` no payload do Meta
- Aceitar e repassar `custom_data` generico

### Arquivos modificados (chamadas de eventos):
1. `src/pages/Oferta.tsx` -- adicionar ViewContent no useEffect + appendUtmsToUrl nos checkouts + AddToCart nos cards de plano
2. `src/components/PremiumLockModal.tsx` -- appendUtmsToUrl no checkout
3. `src/components/landing/DemoBanner.tsx` -- appendUtmsToUrl no checkout
4. `src/pages/Demo.tsx` -- DemoStarted ao montar + appendUtmsToUrl + DemoOracleCompleted
5. `src/pages/Auth.tsx` -- salvar UTMs no perfil + CompleteRegistration apos signup
6. `src/components/onboarding/OnboardingWizard.tsx` -- CompleteRegistration ao finalizar
7. `src/components/oracle/FlowStepRenderer.tsx` -- DemoOracleCompleted no diagnostico em modo demo
8. `src/App.tsx` -- chamar captureUtms() uma vez ao montar o AppContent

### Migracao de banco (opcional mas recomendada)
- Adicionar colunas `utm_source`, `utm_medium`, `utm_campaign` na tabela `profiles` para rastrear a origem de cada usuario
- Tipo: `text`, nullable, sem default

---

## Resumo dos Eventos Apos Implementacao

| Evento | Pixel (Browser) | CAPI (Server) | Onde |
|---|---|---|---|
| PageView | Sim (auto) | -- | Toda pagina |
| ViewContent | Sim (NOVO) | Sim (NOVO) | /oferta |
| Lead | Sim | Sim | Primeiro login |
| AddToCart | Sim (NOVO) | Sim (NOVO) | Seleciona plano |
| InitiateCheckout | Sim | Sim | Abre checkout |
| CompleteRegistration | Sim (NOVO) | Sim (NOVO) | Apos onboarding |
| Purchase | Sim (redundancia) | Sim (webhook) | Webhook Guru |
| DemoStarted | Custom (NOVO) | -- | Entra /demo |
| DemoOracleCompleted | Custom (NOVO) | -- | Completa oraculo demo |
| PremiumContentClicked | Custom (NOVO) | -- | Clica premium |

Todos os eventos de Pixel e CAPI compartilham o mesmo `event_id` para deduplicacao correta pelo Meta.
