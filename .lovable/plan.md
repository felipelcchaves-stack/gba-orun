

# Adicionar Orientacao do Mestre na Tela de Subtipos Ire/Ibi

## Problema

Quando o usuario chega na tela "Que tipo de Ire?" ou "Que tipo de Ibi?" (a segunda tela do Step 3 do oraculo), a mensagem de orientacao do mestre (Lu) nao aparece. A orientacao so existe na primeira tela (escolha entre Ire ou Ibi), mas desaparece quando o usuario avanca para selecionar o subtipo especifico.

## Solucao

Adicionar dois novos pontos de orientacao -- um para a tela de subtipos de Ire e outro para subtipos de Ibi -- para que o mestre possa guiar o usuario em cada contexto.

## Alteracoes

### 1. StepIreIbi.tsx

Adicionar um componente `GuidanceBubble` na tela de selecao de subtipos (linhas 188-249), logo abaixo do subtitulo e antes da lista de subtipos. Serao dois `pointKey` diferentes:

- `oracle_step_ire_subtype` -- aparece quando o usuario esta escolhendo o tipo de Ire
- `oracle_step_ibi_subtype` -- aparece quando o usuario esta escolhendo o tipo de Ibi

Isso permite que o admin configure mensagens diferentes para cada situacao (Ire tem um tom positivo, Ibi tem um tom de cuidado).

### 2. AdminGuidance.tsx (ou tabela guidance_bubbles)

Os novos pontos de contato precisam existir no banco para o admin poder configurar as mensagens. Como o sistema ja permite criar novos pontos pelo painel admin, basta o admin adicionar os dois novos pontos:

- `oracle_step_ire_subtype`
- `oracle_step_ibi_subtype`

Opcionalmente, a migracao pode inserir esses pontos ja com mensagens padrao para que funcionem imediatamente.

## Detalhes Tecnicos

### Alteracao no StepIreIbi.tsx

Na secao de selecao de subtipos (a partir da linha 188), adicionar:

```text
<GuidanceBubble pointKey={isIre ? "oracle_step_ire_subtype" : "oracle_step_ibi_subtype"} className="mb-6" />
```

Isso fica entre o paragrafo descritivo (linha 203-205) e o bloco de loading/lista (linha 207).

### Migracao SQL (opcional mas recomendada)

Inserir os dois novos pontos na tabela `guidance_bubbles` com mensagens padrao:

- `oracle_step_ire_subtype`: "Cada Ire tem sua particularidade. Escolha com calma o tipo que mais se encaixa no que voce sentiu durante a consulta."
- `oracle_step_ibi_subtype`: "Identifique o tipo de Ibi para sabermos exatamente qual cuidado espiritual tomar. Nao se preocupe, cada caminho tem sua solucao."

Ambos com `is_active = true` para aparecerem imediatamente.

### Nenhuma alteracao de hook necessaria

O hook `useGuidanceBubble` ja funciona com qualquer `pointKey`. Basta os registros existirem no banco.

## Resultado

1. O mestre (Lu) aparece guiando o usuario tambem na tela de selecao de subtipos
2. O admin pode personalizar as mensagens de Ire e Ibi separadamente
3. O admin pode adicionar audio de orientacao especifico para cada contexto
4. Se o admin nao configurar nada, a bolha simplesmente nao aparece (comportamento atual)

