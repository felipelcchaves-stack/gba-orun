
# Mensagem de Conclusao Inteligente com Nome do Fluxo

## Problema

Quando o usuario completa o cuidado do dia, o card mostra "Voce ja cuidou do seu Ori hoje. Axe!" -- mas ele nao cuidou so do Ori, ele fez um fluxo especifico (ex: "Cuidado Espiritual Semanal" ou "Cuidado com Oxum"). Alem disso, simplesmente encaixar o nome do fluxo na frase pode gerar frases sem coerencia gramatical.

## Solucao

Adicionar um campo `completion_phrase` na tabela `oracle_flows` onde o admin define exatamente como o nome do fluxo deve aparecer na frase de conclusao. Assim o sistema monta: **"Voce fez [completion_phrase] hoje. Ase! ✨"**

Exemplos:

| Nome do fluxo | completion_phrase | Frase final |
|---|---|---|
| Cuidado Espiritual Semanal | o seu Cuidado Espiritual Semanal | "Voce fez o seu Cuidado Espiritual Semanal hoje. Ase!" |
| Cuidado com Oxum | o Cuidado com Oxum | "Voce fez o Cuidado com Oxum hoje. Ase!" |
| Cuidado com Exu | o Cuidado com Exu | "Voce fez o Cuidado com Exu hoje. Ase!" |

Isso garante coesao e coerencia total, porque o admin controla a frase exata. Se o campo estiver vazio, usa um fallback generico: "o seu cuidado espiritual".

Tambem sera corrigida a grafia de "Axe" para **Ase** (com diacriticos ioruba corretos).

## O que muda

### 1. Banco de dados

Duas alteracoes:

```text
1. Adicionar coluna flow_name (text, nullable) em user_journey
   -- Para guardar qual fluxo o usuario completou

2. Adicionar coluna completion_phrase (text, default '') em oracle_flows
   -- Para o admin definir como o nome aparece na frase
   -- Ex: "o seu Cuidado Espiritual Semanal"
```

### 2. Salvar o nome do fluxo ao completar a jornada

Quando o usuario termina um fluxo (no no de Diagnostico), o sistema salva o `flow_name` na `user_journey`.

**Arquivos:**

- `src/hooks/useJourney.ts` -- aceitar `flow_name` como parametro opcional no `useAddJourneyEntry`
- `src/components/oracle/DynamicFlowRunner.tsx` -- buscar o fluxo ativo e passar `flowName` e `completionPhrase` para o `FlowStepRenderer`
- `src/components/oracle/FlowStepRenderer.tsx` -- receber `flowName` como prop e incluir no `addJourneyEntry`

### 3. Mostrar a frase inteligente no SpiritualCareCard

**Arquivo:** `src/components/home/SpiritualCareCard.tsx`

- Incluir `flow_name` no select da query de `weekEntries`
- Buscar a `completion_phrase` do fluxo correspondente (via query nos `oracle_flows`)
- Montar a frase: "Voce fez [completion_phrase] hoje. Ase! ✨"
- Fallback se nao houver completion_phrase: "Voce fez o seu cuidado espiritual hoje. Ase! ✨"
- Corrigir todas as ocorrencias de "Axe"/"Axe!" para "Ase!" (grafia ioruba)

### 4. Admin: campo para editar a completion_phrase

**Arquivo:** `src/components/admin/AdminFlows.tsx` (ou onde os fluxos sao editados)

- Adicionar um campo de texto "Frase de conclusao" no formulario de edicao de fluxo
- Placeholder: "Ex: o seu Cuidado Espiritual Semanal"
- Dica: "Como o nome do fluxo aparece na frase 'Voce fez ___ hoje'"

## Resumo dos arquivos alterados

```text
Banco de dados (migracao):
  - user_journey: adicionar coluna flow_name (text, nullable)
  - oracle_flows: adicionar coluna completion_phrase (text, default '')

src/hooks/useJourney.ts
  - Aceitar flow_name no useAddJourneyEntry

src/components/oracle/DynamicFlowRunner.tsx
  - Buscar nome e completion_phrase do fluxo
  - Passar flowName como prop para FlowStepRenderer

src/components/oracle/FlowStepRenderer.tsx
  - Receber flowName e salvar na jornada

src/components/home/SpiritualCareCard.tsx
  - Buscar flow_name da jornada do dia
  - Buscar completion_phrase do fluxo correspondente
  - Montar frase inteligente com coesao
  - Corrigir "Axe" para "Ase" (grafia ioruba)

src/components/admin/AdminFlows.tsx
  - Adicionar campo "Frase de conclusao" no editor de fluxos
```
