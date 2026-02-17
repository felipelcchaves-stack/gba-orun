
# Plano: Corrigir Looping do Onboarding + Melhorar UX dos Botoes

## Problemas Identificados

### 1. Looping apos completar o onboarding
**Causa raiz confirmada:** Os dados estao salvando corretamente no banco (verifiquei: `onboarding_completed = true`). Porem, quando o usuario clica "Comecar Jornada", o `navigate("/")` executa antes do `invalidateQueries` atualizar o cache. O `ProtectedRoute` da Home ainda le o valor antigo (`false`) do cache e redireciona de volta para `/onboarding`.

**Solucao:** Aguardar a invalidacao do cache completar antes de navegar. Usar `await queryClient.invalidateQueries()` dentro do `handleFinish`, e somente depois chamar `navigate("/")`.

### 2. Botao "Continuar" muito pra baixo (Step 2 - Perguntas)
**Causa raiz:** No passo das 5 perguntas de conhecimento, sao 5 cards empilhados verticalmente + o botao. Em telas menores, o conteudo ultrapassa a tela e o botao fica escondido la embaixo, exigindo scroll.

**Solucao:** Tornar a tela scrollavel com o botao "Continuar" fixo na parte inferior da tela (sticky bottom), sempre visivel independente da quantidade de conteudo.

---

## Alteracoes Planejadas

### Arquivo 1: `src/hooks/useOnboarding.ts`

- No `useSaveOnboarding`, mover a logica de invalidacao para o `mutationFn` (retornando os dados) e garantir que o `onSuccess` faca `await` no `invalidateQueries`
- Alternativa mais simples: retornar o `queryClient` para que o `handleFinish` possa aguardar a invalidacao

### Arquivo 2: `src/components/onboarding/OnboardingWizard.tsx`

**Correcao do looping:**
- Importar `useQueryClient` do React Query
- No `handleFinish`, apos `saveOnboarding.mutateAsync()`, fazer `await queryClient.invalidateQueries({ queryKey: ["onboarding-status"] })` e `await queryClient.refetchQueries({ queryKey: ["onboarding-status"] })` ANTES de chamar `navigate("/")`

**Correcao da UX:**
- Mudar o layout geral de `flex items-center justify-center` para um layout com scroll vertical
- No step 1 (perguntas), usar `overflow-y-auto` no container principal e colocar o botao "Continuar" com `sticky bottom-0` e fundo gradiente para indicar que ha conteudo abaixo
- Aplicar `pb-20` no container de perguntas para dar espaco ao botao fixo
- Manter padding seguro para a area inferior em dispositivos moveis

---

## Detalhes Tecnicos

### Correcao do looping (OnboardingWizard.tsx)

```text
// Antes (problematico):
await saveOnboarding.mutateAsync({...});
toast.success("...");
navigate("/", { replace: true });  // cache ainda tem false

// Depois (correto):
await saveOnboarding.mutateAsync({...});
await queryClient.invalidateQueries({ queryKey: ["onboarding-status"] });
await queryClient.refetchQueries({ queryKey: ["onboarding-status"] });
toast.success("...");
navigate("/", { replace: true });  // agora o cache tem true
```

### Correcao da UX (OnboardingWizard.tsx)

O container principal muda de:
```text
<div className="min-h-screen bg-background flex items-center justify-center p-4">
  <div className="w-full max-w-md space-y-6">
```

Para:
```text
<div className="min-h-screen bg-background flex flex-col items-center p-4 pt-8 pb-24 overflow-y-auto">
  <div className="w-full max-w-md space-y-6">
```

E no step 1 (perguntas), o botao "Continuar" ganha posicao fixa:
```text
<div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
  <div className="max-w-md mx-auto">
    <Button ...>Continuar</Button>
  </div>
</div>
```

O mesmo padrao de botao fixo se aplica ao step final ("Comecar Jornada").

---

## Resumo de Arquivos

| Arquivo | Alteracao |
|---|---|
| `src/components/onboarding/OnboardingWizard.tsx` | Aguardar invalidacao do cache antes de navegar; botao fixo no rodape |
| `src/hooks/useOnboarding.ts` | Nenhuma alteracao necessaria (a logica de invalidacao sera feita no componente) |

## Resultado Esperado

1. Apos completar o onboarding, o usuario vai direto para a Home sem looping
2. O botao "Continuar" e "Comecar Jornada" ficam sempre visiveis na parte inferior da tela, faceis de clicar em qualquer dispositivo
