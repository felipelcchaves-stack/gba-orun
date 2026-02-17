

# Plano: Corrigir redirecionamento e visibilidade do botao "Iniciar Rotina"

## Problemas Identificados

### 1. Redirecionamento incorreto
Ao concluir o diagnostico do Oraculo e salvar a rotina, o app redireciona para `/jornada` (Plano de Vida) em vez de redirecionar para `/` (Home). O usuario espera voltar para a tela inicial.

**Linha do problema:** `src/components/oracle/StepDiagnosis.tsx`, linha 207:
```text
setTimeout(() => navigate("/jornada"), 1200);
```

### 2. Botao "Iniciar Rotina" escondido
O botao "Iniciar Rotina" fica no final da pagina, depois de todas as tarefas geradas. Quando ha muitas tarefas, o usuario precisa rolar bastante e o botao fica praticamente invisivel. Ele precisa ficar fixo na parte inferior da tela, sempre visivel.

**Causa:** O botao esta dentro do fluxo normal do conteudo (linha 279-297), sem posicionamento fixo.

## Solucao

### Arquivo: `src/components/oracle/StepDiagnosis.tsx`

1. **Trocar redirecionamento** de `/jornada` para `/` (Home)

2. **Tornar o botao fixo na parte inferior da tela**, usando o mesmo padrao ja usado no OnboardingWizard (posicao fixa com gradiente de fundo), garantindo que o botao fique sempre visivel independente do scroll

3. **Adicionar espaco inferior** no conteudo (`mb-24` ou similar) para que o ultimo card de tarefa nao fique escondido atras do botao fixo

### Detalhes das alteracoes

```text
// 1. Trocar redirecionamento (linha 207)
- setTimeout(() => navigate("/jornada"), 1200);
+ setTimeout(() => navigate("/"), 1200);

// 2. Adicionar padding inferior no container de tarefas (linha 250)
- <div className="space-y-2.5 mb-6">
+ <div className="space-y-2.5 mb-24">

// 3. Tornar o botao fixo na parte inferior
- Mover o bloco do botao (linhas 279-297) para fora do fluxo
- Envolver em div com position fixed, padding, gradiente
- Mesmo padrao do OnboardingWizard:
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-10">
    <div className="max-w-lg mx-auto">
      {/* botao aqui */}
    </div>
  </div>
```

## Resultado Esperado

- O botao "Iniciar Rotina" fica sempre visivel na parte inferior da tela, com um gradiente suave por cima do conteudo
- Apos salvar, o usuario e redirecionado para a Home (/) em vez da pagina Jornada
- O conteudo das tarefas nao fica escondido atras do botao fixo

