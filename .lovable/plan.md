
# Sistema de Avaliacoes com Depoimentos na Landing Page

## Resumo

Criar um sistema onde usuarios com experiencia suficiente no app sao convidados a deixar uma avaliacao (estrelas + texto obrigatorio). Avaliacoes de 5 estrelas aparecem automaticamente na landing page, substituindo os depoimentos fictícios atuais. O convite so aparece uma vez e apenas quando o usuario atinge um nivel minimo de engajamento.

## Gatilho para Exibir a Avaliacao

O convite aparece quando o usuario atinge **200 XP** (equivalente a nivel 3). Isso garante que ele ja usou o oraculo algumas vezes, leu rituais e tem experiencia real com o app. O modal aparece uma unica vez -- se o usuario fechar sem avaliar, nao aparece novamente (para nao irritar). Se avaliar, fica registrado.

## Nova Tabela no Banco de Dados

**Tabela `user_reviews`:**
- `id` (uuid, chave primaria)
- `user_id` (uuid, obrigatorio)
- `display_name` (text, obrigatorio -- preenchido automaticamente com o nome do perfil)
- `rating` (integer, 1 a 5, obrigatorio)
- `review_text` (text, obrigatorio, minimo 20 caracteres)
- `created_at` (timestamp)
- `approved` (boolean, default true -- para moderacao futura se necessario)

**Politicas RLS:**
- SELECT publico (para a landing page poder ler)
- INSERT apenas para o proprio usuario (auth.uid() = user_id)
- UPDATE/DELETE bloqueados para usuarios comuns
- ALL para admins

## Componentes Novos

### 1. Modal de Avaliacao (`ReviewModal.tsx`)
- Aparece automaticamente quando XP >= 200 e o usuario ainda nao avaliou
- Mostra o nome do usuario ja preenchido (vindo do perfil)
- 5 estrelas clicaveis (obrigatorio selecionar)
- Campo de texto obrigatorio (minimo 20 caracteres)
- Botoes "Enviar" e "Agora nao" (fechar sem avaliar marca como dismissed)
- Validacao com feedback visual

### 2. Hook `useReviewPrompt.ts`
- Verifica se o usuario tem XP >= 200
- Verifica se ja existe uma review ou se ja foi dismissado
- Controla a exibicao do modal (usa localStorage para o dismiss)

### 3. Hook `usePublicReviews.ts`
- Busca avaliacoes de 5 estrelas aprovadas do banco
- Usado na landing page
- Limite de 15 avaliacoes, ordenadas por data (mais recentes primeiro)

## Alteracoes em Arquivos Existentes

### `src/pages/Oferta.tsx`
- Remove o array `testimonials` hardcoded
- Busca avaliacoes reais do banco via `usePublicReviews`
- Se houver menos de 4 avaliacoes reais, complementa com os depoimentos ficticios atuais como fallback
- Quando houver 15+ avaliacoes de 5 estrelas, mostra apenas as reais

### `src/pages/Home.tsx`
- Importa e renderiza o `ReviewModal` (aparece por cima do conteudo)

## Fluxo do Usuario

```text
Usuario usa o app normalmente
        |
  Atinge 200 XP (nivel 3)
        |
  Proxima vez que abre a Home
        |
  Modal aparece: "Como voce avalia o Gba-Orun?"
        |
  +------------------+------------------+
  |                                     |
  Avalia (estrelas + texto)        Fecha sem avaliar
  |                                     |
  Salva no banco                  Marca dismissed
  |                                  (nao aparece mais)
  Se 5 estrelas ->
  aparece na landing page
```

## Detalhes Tecnicos

### Migracao SQL

Cria a tabela `user_reviews` com:
- Constraint unique em `user_id` (cada usuario avalia uma vez)
- RLS com SELECT publico, INSERT para owner, ALL para admin
- Indice em `rating` para filtrar 5 estrelas rapidamente

### ReviewModal.tsx

- Usa Dialog do Radix (ja instalado)
- Estrelas interativas com hover effect
- Textarea com contador de caracteres e validacao
- Nome do usuario preenchido automaticamente e nao editavel
- Toast de sucesso ao enviar

### useReviewPrompt.ts

```text
Logica:
1. user_stats.xp_total >= 200?
2. Ja existe review desse user_id no banco?
3. localStorage tem "review_dismissed"?
Se (1) e nao (2) e nao (3) -> mostrar modal
```

### usePublicReviews.ts

```text
SELECT * FROM user_reviews
WHERE rating = 5 AND approved = true
ORDER BY created_at DESC
LIMIT 15
```

### Oferta.tsx - Logica de exibicao

```text
Se reviews reais >= 15 -> mostra so as reais
Se reviews reais >= 4 -> mostra as reais
Se reviews reais < 4 -> complementa com ficticios ate ter 4
```

## Painel Admin

A tabela de reviews sera acessivel no admin existente para que o administrador possa:
- Ver todas as avaliacoes (todas as notas)
- Aprovar/reprovar avaliacoes (campo `approved`)
- Excluir avaliacoes impróprias

Isso sera adicionado como uma nova aba ou secao dentro do admin.

## Resultado Esperado

1. Usuarios engajados sao convidados a avaliar de forma nao intrusiva
2. Avaliacoes reais de 5 estrelas aparecem automaticamente na landing page
3. Os depoimentos ficticios sao gradualmente substituidos por reais
4. O admin tem controle total sobre quais avaliacoes aparecem
5. O convite aparece apenas uma vez, respeitando a experiencia do usuario
