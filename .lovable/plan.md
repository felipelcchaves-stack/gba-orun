

# Plano: Sistema Completo de Orientacao do Mestre em Cada Resultado do Obi

## O que muda

Hoje, o sistema de orientacao do mestre (GuidanceBubble) funciona com pontos fixos no codigo -- um balao por etapa do oraculo. Porem, cada resultado do Obi (Apotaku, Okaran, Ejikorere, Etaiwa, Alafia) tem uma natureza diferente e merece uma orientacao propria. O admin quer poder escrever uma mensagem e gravar um audio especifico para cada caida.

---

## Solucao: Orientacao vinculada ao Resultado do Obi

### 1. Novos campos na tabela `oracle_configs`

Adicionar dois campos para cada resultado do Obi armazenar sua propria orientacao do mestre:

```text
ALTER TABLE public.oracle_configs
  ADD COLUMN guidance_message TEXT NOT NULL DEFAULT '',
  ADD COLUMN guidance_audio_url TEXT;
```

Isso significa que ao editar "Apotaku" no admin, voce tambem configura a mensagem e o audio que o mestre fala quando esse resultado aparece.

---

### 2. Exibir orientacao no StepObiResult (apos selecao)

**Arquivo:** `src/components/oracle/StepObiResult.tsx`

Hoje, quando o usuario clica em um resultado, ele avanca direto. A mudanca e: ao clicar, em vez de avancar imediatamente, o sistema mostra a orientacao do mestre para aquele resultado especifico (texto + audio), com um botao "Continuar" para prosseguir.

Fluxo visual:
1. Usuario ve a lista de resultados
2. Clica em "Ejikorere"
3. Aparece o balao do mestre com a orientacao especifica do Ejikorere
4. Usuario clica "Continuar" para ir ao Ebo

---

### 3. Atualizar o Admin de Resultados do Oraculo

**Arquivo:** `src/components/admin/AdminOracleConfigs.tsx`

Adicionar dois campos no formulario de edicao de cada resultado:
- **Mensagem do Mestre**: textarea para o texto de orientacao
- **Audio do Mestre (URL)**: campo de texto para URL do audio

Esses campos ficam abaixo dos existentes (Descricao Ire, Descricao Ibi, etc.)

---

### 4. Remover ponto de orientacao obsoleto

**Arquivo:** `src/components/admin/AdminGuidance.tsx`

Remover a entrada `oracle_step_ire_ibi` da lista `GUIDANCE_POINTS`, ja que esse passo do wizard foi eliminado.

---

### 5. Atualizar tipos e hooks

**Arquivo:** `src/hooks/useOracleConfig.ts`

Adicionar `guidance_message` e `guidance_audio_url` na interface `OracleConfig`.

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | ADD COLUMN `guidance_message` e `guidance_audio_url` em `oracle_configs` |
| `src/hooks/useOracleConfig.ts` | Adicionar campos na interface `OracleConfig` |
| `src/components/oracle/StepObiResult.tsx` | Mostrar orientacao do mestre ao selecionar resultado, com botao "Continuar" |
| `src/components/admin/AdminOracleConfigs.tsx` | Adicionar campos de mensagem e audio do mestre no editor |
| `src/components/admin/AdminGuidance.tsx` | Remover `oracle_step_ire_ibi` da lista de pontos |
| `src/pages/Oracle.tsx` | Ajustar callback do StepObiResult para receber confirmacao apos orientacao |

---

## Fluxo do Usuario (Depois)

```text
1. Escolhe intencao
2. Seleciona "Ejikorere"
3. Ve o balao: "Parabens! Ejikorere veio em Ire. Isso significa que o Orixa sorriu..."
4. Clica "Continuar"
5. Segue para Ebo, Ori, Iyami/Egbe, Diagnostico
```

O admin configura tudo no cadastro de cada resultado do Obi -- sem precisar mexer em codigo.

