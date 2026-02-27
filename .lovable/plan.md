

# Graficos começam no primeiro evento real

## Problema
Os graficos de Evolucao de Assinantes, Receita e Crescimento mostram dados desde o primeiro cadastro no sistema, gerando uma linha de zeros ate a primeira atividade real (assinatura, cortesia ou venda). Isso polui o grafico e esconde os gaps reais.

## Solucao
Alterar a RPC `admin_get_subscription_history_v2` para que o ponto de inicio (`start_date`) considere a **primeira atividade relevante** em vez do primeiro cadastro:

- **Grafico de Assinantes/Receita**: comecar na data do primeiro perfil com `subscription_started_at IS NOT NULL` ou `is_courtesy = true`
- **Se nao houver nenhuma atividade**: nao retornar dados (grafico fica oculto, como ja acontece hoje com a condicao `historyData.length > 0`)

Para o modo diario, manter o limite de 90 dias mas tambem so mostrar a partir da primeira atividade.

## Alteracao

### 1. Migração SQL - Atualizar a RPC

Alterar o calculo de `start_date` na CTE `params`:

**Antes:**
```text
start_date = primeiro cadastro (min(created_at) de profiles)
```

**Depois:**
```text
start_date = GREATEST(
  -- primeiro evento relevante (assinatura ou cortesia)
  primeiro subscription_started_at OU primeiro created_at de cortesia,
  -- para diario, no maximo 90 dias atras
  limite de 90 dias (se diario)
)
```

Se nao houver nenhum evento relevante, a query retorna zero linhas.

### 2. Sem alteracao no frontend

O dashboard ja trata `historyData.length > 0` para esconder os graficos quando nao ha dados. A formatacao dos eixos ja e dinamica. Nenhuma mudanca no React.

## Resultado esperado
- Graficos so aparecem quando existe pelo menos um assinante, cortesia ou venda
- A partir desse ponto, os gaps (dias/meses sem venda) ficam visiveis, que e exatamente o que voce quer monitorar
- Modo diario continua limitado a 90 dias

