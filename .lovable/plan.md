

# Corrigir a frase de conclusao no SpiritualCareCard

## Diagnostico

Investiguei o banco de dados e o codigo e encontrei **dois problemas**:

1. **`flow_name` esta `null` em todas as entradas da jornada** -- incluindo a de hoje (22/02). Isso acontece porque a consulta de hoje foi feita **antes** do deploy do codigo que salva o `flow_name`. O codigo esta correto, mas as entradas existentes nao tem esse dado. Resultado: o card sempre mostra o fallback "o seu cuidado espiritual".

2. **A `completion_phrase` foi preenchida como "Parabens! Continue assim. Ase oo"** -- mas esse campo deveria conter apenas o trecho que encaixa na frase "Voce fez \_\_\_ hoje". Exemplo correto: "o seu Cuidado Espiritual Semanal". A dica no Admin nao esta clara o suficiente.

## Solucao

### 1. Corrigir entradas antigas (retroativo)

Atualizar as entradas existentes na `user_journey` que tem `flow_name = null` para associa-las ao fluxo correto. Como so existe um fluxo ("Cuidado Espiritual Semanal"), podemos preencher todas:

```text
UPDATE user_journey SET flow_name = 'Cuidado Espiritual Semanal' WHERE flow_name IS NULL;
```

### 2. Corrigir a `completion_phrase` no banco

Atualizar o valor salvo para algo que encaixe na frase:

```text
UPDATE oracle_flows 
SET completion_phrase = 'o seu Cuidado Espiritual Semanal' 
WHERE name = 'Cuidado Espiritual Semanal';
```

### 3. Melhorar o placeholder e a dica no Admin

**Arquivo:** `src/components/admin/AdminFlows.tsx`

Tornar a dica mais explicativa para o admin entender exatamente o que preencher:

- Placeholder atual: "Ex: o seu Cuidado Espiritual Semanal"
- Dica atual: "aparece em 'Voce fez ___ hoje. Ase!'"
- **Nova dica:** "Esse texto aparece assim: **Voce fez [o que voce escrever aqui] hoje. Ase!** -- Ex: 'o seu Cuidado Espiritual Semanal' ou 'o Cuidado com Oxum'"

### 4. Remover o `as any` desnecessario no useJourney

O `flow_name` ja existe no types.ts gerado, entao o cast `as any` no insert pode ser removido para manter o codigo limpo.

### 5. Invalidar cache `week_journey` ao salvar jornada

Adicionar `week_journey` nas queries invalidadas apos salvar uma nova entrada, para que o SpiritualCareCard atualize imediatamente.

**Arquivo:** `src/hooks/useJourney.ts`

## Resumo dos arquivos alterados

```text
Banco de dados (migracao):
  - Preencher flow_name retroativamente nas entradas existentes
  - Corrigir completion_phrase do fluxo "Cuidado Espiritual Semanal"

src/components/admin/AdminFlows.tsx
  - Melhorar placeholder e dica do campo "Frase de conclusao"

src/hooks/useJourney.ts
  - Remover "as any" no insert
  - Adicionar invalidacao do cache "week_journey"
```
