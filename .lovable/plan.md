

# Sistema Inteligente de Lembretes Espirituais

## Problema atual

O sistema atual so funciona se o usuario tem um "dia de cuidado" configurado, e cobra ele por nao ter consultado naquele dia especifico. Isso e frustrante para assinantes ativos que usam o app diariamente.

## Nova logica (2 cenarios)

### Cenario 1: Usuario TEM dia de cuidado configurado
- **Contagem regressiva positiva**: "Faltam X dias para seu cuidado espiritual" (tom de antecipacao, nao de cobranca)
- **No dia**: "Hoje e seu dia de cuidado! Cuide do seu Ori" (celebracao)
- **Ja cuidou no dia**: "Voce ja cuidou do seu Ori hoje. Axe!" (reconhecimento)
- **SEM alerta vermelho** por "perder" o dia -- ele pode usar o app quando quiser

### Cenario 2: Usuario NAO tem dia de cuidado configurado
- Buscar a **ultima atividade geral** (ultima consulta ao oraculo)
- Se faz **3+ dias sem nenhuma atividade**: "Voce esta ha X dias sem cuidar da sua espiritualidade. Que tal consultar o Oraculo?"
- Se faz **7+ dias**: tom mais urgente com icone de alerta
- Se esta ativo: mostrar mensagem positiva com dias de sequencia

### Toast/Notificacao (useCareReminder)
- **Com dia de cuidado**: notificar apenas no dia configurado (manter atual)
- **Sem dia de cuidado**: notificar se inativo ha 3+ dias (maximo 1x por dia)

## Mudancas visuais no card

| Estado | Cor | Icone | Mensagem |
|--------|-----|-------|----------|
| Contagem regressiva | Neutro (card normal) | CalendarHeart | "Proximo cuidado: Segunda (faltam 3 dias)" |
| Hoje e o dia | Dourado | Sparkles | "Hoje e seu dia de cuidado!" |
| Ja cuidou hoje | Verde suave | CheckCircle | "Voce ja cuidou do seu Ori. Axe!" |
| Inativo 3-6 dias (sem dia configurado) | Amarelo suave | Clock | "Voce esta ha X dias sem cuidar..." |
| Inativo 7+ dias (sem dia configurado) | Laranja | AlertTriangle | "Seu Ori sente sua falta..." |
| Ativo recentemente (sem dia configurado) | Verde suave | Sparkles | "Voce esta em dia! Ultima consulta: ontem" |

## Detalhes tecnicos

### Arquivo: `src/components/home/SpiritualCareCard.tsx`
- Buscar ultima entrada da jornada geral (nao so da semana) para calcular dias de inatividade
- Remover o estado "alert" de "Voce perdeu seu cuidado de [dia]"
- Adicionar novo cenario para usuarios sem dia de cuidado: mostrar card baseado em inatividade
- Adicionar estado "success" (verde) para quando ja cuidou
- Trocar mensagem do estado sem dia configurado de "Defina seu dia" para mostrar inatividade

### Arquivo: `src/hooks/useCareReminder.ts`
- Adicionar logica para usuarios SEM dia de cuidado: verificar ultima atividade
- Se inativo ha 3+ dias, mostrar toast e notificacao de lembrete
- Manter logica atual para usuarios COM dia de cuidado

### Arquivos modificados

| Arquivo | Acao |
|---------|------|
| `src/components/home/SpiritualCareCard.tsx` | Refatorar logica de estados e mensagens |
| `src/hooks/useCareReminder.ts` | Adicionar lembrete por inatividade |

**Total: 2 arquivos modificados, 0 tabelas novas**

