

# Plano: Controle de Inadimplencia e Protecao de Conteudo Premium

## Problema Atual

Hoje o sistema depende exclusivamente do webhook da Guru para atualizar o status da assinatura. Se o webhook falhar ou atrasar, um aluno inadimplente pode continuar usando o conteudo premium indefinidamente. Alem disso, nao existe nenhum aviso visual para o aluno que esta com pagamento pendente.

## O que sera implementado

### 1. Verificacao Automatica de Expiracao (Cron Job)

Uma funcao que roda automaticamente a cada hora no servidor, verificando todos os usuarios com assinatura ativa cuja data de expiracao ja passou. Esses usuarios serao marcados como "inadimplentes" e terao o acesso premium bloqueado automaticamente.

Isso garante que mesmo se o webhook da Guru falhar, ninguem fica consumindo conteudo sem pagar.

### 2. Banner de Inadimplencia no App

Quando o aluno estiver com status "inadimplente" (overdue) ou "cancelado", aparecera um banner fixo no topo da tela inicial com uma mensagem amigavel pedindo que regularize o pagamento, com botao direto para a pagina de planos.

### 3. Banner de Assinatura Prestes a Expirar

Quando faltarem 3 dias ou menos para a assinatura expirar, aparecera um banner amarelo de aviso: "Sua assinatura expira em X dias. Renove para nao perder acesso."

### 4. Bloqueio Reforçado no Frontend

O hook `usePremium` ja faz uma verificacao de expiracao no cliente, mas vamos reforcar:
- Toda vez que `subscription_expires_at` estiver no passado, tratar como nao-premium independente do campo `is_premium`
- Mostrar o modal de bloqueio premium automaticamente em conteudos restritos

### 5. Tela de Status da Assinatura no Perfil

Na pagina de perfil do usuario, adicionar uma secao mostrando:
- Status atual (Ativo, Inadimplente, Cancelado, Gratuito)
- Data de expiracao
- Botao para renovar/assinar

## Alteracoes por arquivo

| Arquivo | Acao |
|---|---|
| `supabase/functions/check-expired-subscriptions/index.ts` | Nova edge function que marca usuarios expirados como inadimplentes |
| Migration SQL | Criar cron job que chama a edge function a cada hora |
| `src/components/home/SubscriptionBanner.tsx` | Novo componente: banner de inadimplencia e aviso de expiracao |
| `src/pages/Home.tsx` | Adicionar SubscriptionBanner no topo |
| `src/hooks/usePremium.ts` | Reforcar verificacao de expiracao + exportar dias restantes |
| `src/pages/Profile.tsx` | Adicionar secao de status da assinatura |

## Detalhes Tecnicos

### Edge Function: check-expired-subscriptions

```text
-- Logica:
1. Buscar todos os profiles onde is_premium = true
   E subscription_expires_at < now()
2. Atualizar esses registros:
   is_premium = false, subscription_status = 'overdue'
3. Retornar quantidade de usuarios afetados
```

A funcao usa `SUPABASE_SERVICE_ROLE_KEY` para ter permissao de atualizar qualquer perfil.

### Cron Job (pg_cron + pg_net)

Agendamento para chamar a edge function a cada hora:

```text
cron.schedule('check-expired-subs', '0 * * * *', ...)
```

### SubscriptionBanner

Componente que usa o hook `usePremium` para decidir o que mostrar:

- **Status "overdue"**: Banner vermelho — "Seu acesso esta suspenso. Regularize seu pagamento para continuar usando o conteudo exclusivo." + Botao "Renovar Agora"
- **Status "cancelled"**: Banner amarelo — "Sua assinatura foi cancelada. Assine novamente para recuperar o acesso." + Botao "Ver Planos"
- **Expiracao proxima (3 dias ou menos)**: Banner amarelo suave — "Sua assinatura expira em X dia(s). Renove para nao perder acesso."
- **Status "active" com mais de 3 dias**: Nao mostra nada

### usePremium - Melhorias

Adicionar ao retorno:
- `daysRemaining`: numero de dias ate a expiracao (null se nao tem assinatura)
- `isExpiringSoon`: true se faltam 3 dias ou menos
- `isOverdue`: true se status e "overdue"

### Perfil - Secao de Assinatura

Cartao mostrando:
- Icone e badge colorido com o status
- "Expira em DD/MM/AAAA" ou "Expirou em DD/MM/AAAA"
- Botao contextual: "Renovar" (se overdue/cancelled) ou "Gerenciar" (se ativo)

## Fluxo Completo de Protecao

```text
Aluno paga na Guru
       |
       v
Webhook atualiza: is_premium=true, expires_at=+30 dias
       |
       v
Aluno usa o app normalmente
       |
       v
Faltam 3 dias --> Banner amarelo de aviso
       |
       v
Data expira sem renovacao
       |
       v
Cron job (a cada hora) --> marca overdue, is_premium=false
       |
       v
Aluno ve banner vermelho + conteudo bloqueado
       |
       v
Aluno renova --> Webhook reativa --> Ciclo recomeça
```

## Resultado Esperado

1. Nenhum aluno consegue consumir conteudo premium apos a data de expiracao
2. O sistema se auto-corrige mesmo se o webhook falhar, gracas ao cron job
3. O aluno recebe avisos visuais claros antes e depois da expiracao
4. O admin pode ver o status de cada usuario no painel (ja existe)
5. Protecao em duas camadas: servidor (cron) + cliente (hook usePremium)

