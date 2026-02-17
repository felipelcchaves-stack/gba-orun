

# Plano: Vincular Ire/Ibi ao Cadastro do Obi (Eliminar Passo Manual)

## Problema

Hoje, apos o usuario selecionar o resultado do Obi (Apotaku, Okaran, Ejife, etc.), o wizard pergunta manualmente "Veio em Ire ou Ibi?". Porem, na pratica liturgica, cada caida ja tem sua natureza definida -- o proprio resultado ja diz se e Ire ou Ibi. Essa pergunta e redundante e confunde o usuario.

---

## Solucao

### 1. Novo campo `default_ire_ibi` na tabela `oracle_configs`

Adicionar uma coluna para o admin definir se cada resultado do Obi e Ire ou Ibi por padrao.

```text
ALTER TABLE public.oracle_configs
  ADD COLUMN default_ire_ibi TEXT NOT NULL DEFAULT 'ibi';
```

Valores possiveis: `'ire'` ou `'ibi'`.

Isso permite que o admin configure, por exemplo:
- Apotaku (Oyekun) -> Ibi
- Okaran -> Ibi
- Ejife -> Ire
- Etagun -> Ire
- Alafia -> Ire

---

### 2. Eliminar o Step 3 (StepIreIbi) do Wizard

**Arquivo:** `src/pages/Oracle.tsx`

O wizard hoje tem 7 passos. Ao eliminar o passo "Ire ou Ibi?", ficara com 6:

1. Intencao
2. Resultado do Obi
3. ~~Ire ou Ibi~~ (REMOVIDO)
4. Ebo -> vira Step 3
5. Ori -> vira Step 4
6. Iyami/Egbe -> vira Step 5
7. Diagnostico -> vira Step 6

No Step 2 (StepObiResult), ao selecionar o resultado, o sistema ja busca o `default_ire_ibi` do `oracle_configs` e preenche automaticamente no state, avancando direto para o proximo passo.

Mudancas:
- `TOTAL_STEPS` de 7 para 6
- No `step === 2`, apos o usuario selecionar o resultado, buscar o `default_ire_ibi` correspondente e definir `ireOrIbi` no state automaticamente
- Renumerar os steps 4-7 para 3-6
- Remover a importacao e uso de `StepIreIbi`

---

### 3. Atualizar o Admin de Resultados do Oraculo

**Arquivo:** `src/components/admin/AdminOracleConfigs.tsx`

Adicionar um campo select "Natureza do resultado" no formulario de edicao com as opcoes:
- Ire (Caminho positivo)
- Ibi (Precisa de cuidado)

Isso aparece ao lado dos campos ja existentes (Nome, Significado, Descricao Ire/Ibi, Estilo Visual).

---

### 4. Atualizar tipos e hook

**Arquivo:** `src/hooks/useOracleConfig.ts`

- Adicionar `default_ire_ibi: string` na interface `OracleConfig`

**Arquivo:** `src/components/oracle/StepObiResult.tsx`

- O fallback `OBI_RESULTS_FALLBACK` ganha o campo `default_ire_ibi` para cada resultado

---

### 5. Propagar para o callback do Oracle.tsx

**Arquivo:** `src/pages/Oracle.tsx`

No step 2, o callback `onSelect` passara tanto o `result_key` quanto o `default_ire_ibi`:

```text
onSelect={(key) => {
  const config = dbConfigs?.find(c => c.result_key === key);
  const ireOrIbi = config?.default_ire_ibi === 'ire' ? 'ire' : 'ibi';
  setState(s => ({ ...s, result: key, ireOrIbi }));
  setStep(3); // agora vai direto pro Ebo
}}
```

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | ADD COLUMN `default_ire_ibi` em `oracle_configs` + UPDATE valores iniciais |
| `src/hooks/useOracleConfig.ts` | Adicionar `default_ire_ibi` na interface |
| `src/components/oracle/StepObiResult.tsx` | Adicionar `default_ire_ibi` ao fallback; exportar configs para uso externo |
| `src/pages/Oracle.tsx` | Reduzir de 7 para 6 steps; preencher `ireOrIbi` automaticamente no step 2; remover `StepIreIbi` |
| `src/components/admin/AdminOracleConfigs.tsx` | Adicionar select "Ire/Ibi" no formulario de edicao |

---

## Fluxo Antes vs. Depois

```text
ANTES (7 passos):
  Intencao -> Obi -> "Ire ou Ibi?" -> Ebo -> Ori -> Iyami/Egbe -> Diagnostico

DEPOIS (6 passos):
  Intencao -> Obi (ja define Ire/Ibi automatico) -> Ebo -> Ori -> Iyami/Egbe -> Diagnostico
```

O admin configura uma vez no cadastro do Obi, e o usuario nunca mais precisa responder essa pergunta.
