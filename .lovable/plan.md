
# Corrigir: Cascata de Obi usa resultado errado para determinar Ire/Ibi

## Problema

O fluxo no banco de dados esta 100% correto -- as 3 etapas de Obi estao conectadas conforme a logica tradicional. O bug esta no codigo.

No componente `IreIbiStep` (arquivo `FlowStepRenderer.tsx`, linha 495), o sistema usa `Object.values(answers).find(...)` para localizar qual resultado de Obi determina se e Ire ou Ibi. O `.find()` retorna o **primeiro** resultado encontrado.

Numa cascata de Etaiwa, as respostas acumuladas ficam assim:
- 1o Obi: "etagun" (Etaiwa)
- 2o Obi: "etagun" (Etaiwa de novo)
- 3o Obi: "okaran" (caida negativa = Ibi)

O `.find()` retorna "etagun" (1o resultado), que tem `default_ire_ibi: "ire"`. Mas o resultado decisivo e "okaran" (o ultimo), que deveria resultar em Ibi. Assim o sistema mostra os tipos de Ire quando deveria mostrar Ibi.

## Solucao

Trocar `.find()` por `.findLast()` (ou equivalente) para pegar o **ultimo** resultado de Obi -- que e sempre o lancamento decisivo na cascata.

## Detalhes Tecnicos

### Arquivo: `src/components/oracle/FlowStepRenderer.tsx` (linha 495)

Alterar de:

```text
const obiAnswer = Object.values(answers).find(a => allResultKeys.includes(a));
```

Para:

```text
const obiValues = Object.values(answers).filter(a => allResultKeys.includes(a));
const obiAnswer = obiValues.length > 0 ? obiValues[obiValues.length - 1] : undefined;
```

Isso garante que em qualquer cascata (1, 2 ou 3 lancamentos), o resultado usado para determinar Ire/Ibi sera sempre o do ultimo Obi jogado -- que e exatamente o lancamento decisivo.

### Resumo das conexoes (confirmadas como corretas):

```text
1o Obi (Consulta com Obi)
  alafia  -> Ire/Ibi (positivo)
  ejife   -> Ire/Ibi (positivo)
  etagun  -> 2o Obi  (joga novamente)
  okaran  -> Ire/Ibi (negativo)
  oyekun  -> Ire/Ibi (negativo)

2o Obi (Etaiwa! Ou seja, precisamos assuntar)
  alafia  -> Ire/Ibi (positivo = ire)
  ejife   -> Ire/Ibi (positivo = ire)
  etagun  -> 3o Obi  (joga pela terceira vez)
  okaran  -> Ire/Ibi (negativo = ibi)
  oyekun  -> Ire/Ibi (negativo = ibi)

3o Obi (Etaiwa! Hunnn vamos continuar)
  alafia  -> Ire/Ibi (positivo = ire)
  ejife   -> Ire/Ibi (positivo = ire)
  etagun  -> Ire/Ibi (etaiwa na 3a vez = ire)
  okaran  -> Ire/Ibi (negativo = ibi)
  oyekun  -> Ire/Ibi (negativo = ibi)
```

### Arquivos modificados:
- `src/components/oracle/FlowStepRenderer.tsx`: correcao de 1 linha (find -> findLast)

Nenhuma mudanca no banco de dados -- o fluxo esta correto.
