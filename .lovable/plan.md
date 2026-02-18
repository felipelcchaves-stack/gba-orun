

# Correcao do Onboarding: Botao Sumindo + Onboarding Reaparecendo

## Problemas Encontrados

### Problema 1: Botao "Continuar" escondido pelo menu inferior
No passo 2 (perguntas de conhecimento), o botao "Continuar" esta posicionado com `position: fixed` na parte inferior da tela com `z-index: 10`. Porem, o menu de navegacao inferior (BottomNav) tambem esta fixo na parte inferior com `z-index: 50`, cobrindo o botao completamente. Alem disso, o BottomNav nao esta configurado para se esconder na rota `/onboarding`.

### Problema 2: Onboarding reaparecendo apos completar
O hook `useOnboardingStatus` consulta o campo `onboarding_completed` na tabela `profiles`. Quando a consulta nao retorna dados (ex: falha momentanea, perfil ainda nao criado), o resultado e `false` por causa do fallback `?? false`. Isso redireciona o usuario de volta ao onboarding mesmo que ele ja tenha completado. Alem disso, o `staleTime` de 30 segundos pode causar re-fetches que momentaneamente retornam `false` durante a transicao.

## Solucoes

### Correcao 1: Esconder BottomNav no onboarding
Adicionar `/onboarding` a lista de rotas onde o BottomNav nao aparece, no arquivo `BottomNav.tsx`.

### Correcao 2: Ajustar z-index dos botoes fixos
Aumentar o `z-index` dos botoes fixos no `OnboardingWizard.tsx` para `z-50` e adicionar padding inferior para o safe-area do dispositivo.

### Correcao 3: Tornar a verificacao de onboarding mais robusta
No `useOnboardingStatus`, diferenciar entre "dados ainda nao carregaram" (retornar `null`) e "onboarding nao completado" (retornar `false`). No `ProtectedRoute`, tratar `null` como "ainda carregando" em vez de "nao completou", evitando redirecionamentos falsos.

## Detalhes Tecnicos

### Arquivo: `src/components/BottomNav.tsx`
- Linha 16: Adicionar `|| location.pathname === "/onboarding"` na condicao de ocultar o nav

### Arquivo: `src/components/onboarding/OnboardingWizard.tsx`
- Linhas 188 e 221: Mudar `z-10` para `z-50` nos botoes fixos
- Adicionar `pb-[env(safe-area-inset-bottom)]` para compatibilidade com dispositivos com notch

### Arquivo: `src/hooks/useOnboarding.ts`
- Na `queryFn`, retornar `null` quando nao houver dados em vez de `false`:
  - Se `data` for `null` (perfil nao encontrado), retornar `null`
  - Se `data.onboarding_completed` existir, retornar seu valor
  - Isso permite distinguir "sem dados" de "onboarding nao feito"

### Arquivo: `src/components/ProtectedRoute.tsx`
- Tratar `onboardingCompleted === null` como estado de carregamento (mostrar spinner)
- Redirecionar para `/onboarding` apenas quando `onboardingCompleted === false` (dado confirmado do banco)

