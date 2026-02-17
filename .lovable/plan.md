

# Plano: Onboarding Wizard para Novos Alunos + Painel de Lacunas no Admin

## Contexto

Leads frios que entram no app podem nao saber jogar Obi, fazer Ebo, cuidar de Ori, Iyami ou Egbe Orun. Hoje nao existe nenhum mecanismo para mapear esse nivel de conhecimento. O admin precisa dessa informacao para criar ofertas personalizadas.

---

## O que sera construido

### 1. Tabela `user_knowledge` no banco de dados

Armazena as respostas do onboarding de cada usuario. Uma linha por usuario.

```text
CREATE TABLE public.user_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  knows_obi BOOLEAN NOT NULL DEFAULT false,
  knows_ebo BOOLEAN NOT NULL DEFAULT false,
  knows_ori BOOLEAN NOT NULL DEFAULT false,
  knows_iyami BOOLEAN NOT NULL DEFAULT false,
  knows_egbe_orun BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_knowledge ENABLE ROW LEVEL SECURITY;

-- Usuarios leem e editam apenas seus proprios dados
CREATE POLICY "Users can view own knowledge" ON public.user_knowledge
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge" ON public.user_knowledge
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge" ON public.user_knowledge
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

### 2. Campo `onboarding_completed` na tabela `profiles`

Para controle rapido de quem ja passou pelo onboarding, sem precisar consultar outra tabela.

```text
ALTER TABLE public.profiles
  ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;
```

---

### 3. Componente: Onboarding Wizard

**Novo arquivo:** `src/components/onboarding/OnboardingWizard.tsx`

Wizard com 3 etapas visuais (estilo ludico, consistente com o app):

**Etapa 1 - Boas-vindas + Dados Basicos**
- Nome de exibicao (pre-preenchido se ja existir)
- Religiao/Tradicao (select)
- Genero (select)
- Mascote Agemo dando boas-vindas: "Ola! Vamos conhecer voce melhor."

**Etapa 2 - Mapeamento de Conhecimento**
- 5 perguntas sim/nao, cada uma com icone e descricao curta:
  - "Voce sabe jogar Obi (Obí Abata)?"
  - "Voce sabe preparar e oferecer Ebo?"
  - "Voce sabe cuidar do seu Ori (Ibori)?"
  - "Voce conhece o culto a Iyami Osoronga?"
  - "Voce sabe sobre Egbe Orun (comunidade espiritual)?"
- Cada pergunta e um cartao com dois botoes grandes: "Sim" e "Ainda nao"

**Etapa 3 - Conclusao**
- Mensagem personalizada baseada nas respostas
- Se marcou tudo "Sim": "Voce ja tem uma boa base! Vamos aprofundar."
- Se tem lacunas: "Otimo! Vamos te guiar em cada passo. Seus Orixas vao adorar!"
- Botao "Comecar Jornada" que salva tudo e vai para a Home

---

### 4. Integracao no fluxo de rotas

**Arquivo:** `src/components/ProtectedRoute.tsx`

Apos verificar que o usuario esta logado, consultar se `onboarding_completed` e `true` no perfil. Se nao, redirecionar para `/onboarding` em vez de mostrar a pagina protegida.

**Arquivo:** `src/App.tsx`

Adicionar rota `/onboarding` com o componente `OnboardingWizard`, protegida por autenticacao mas fora do check de onboarding (para evitar loop).

---

### 5. Hook: `useOnboarding`

**Novo arquivo:** `src/hooks/useOnboarding.ts`

- `useUserKnowledge()` - busca dados de `user_knowledge` do usuario logado
- `useSaveOnboarding()` - mutation que:
  1. Insere/atualiza `user_knowledge` com as respostas
  2. Atualiza `profiles.onboarding_completed = true`
  3. Atualiza `profiles.display_name`, `religion`, `gender` se preenchidos

---

### 6. Dashboard Admin - Painel de Lacunas

**Arquivo:** `src/components/admin/AdminDashboard.tsx`

Adicionar nova secao "Lacunas de Conhecimento" com:

- Grafico de barras horizontais mostrando % de usuarios que NAO sabem cada topico
- Exemplo: "72% nao sabem fazer Ebo" - barra vermelha
- "35% nao sabem jogar Obi" - barra laranja
- KPI card: "Sem Onboarding" (usuarios que ainda nao completaram)

**Funcao RPC:** `admin_get_knowledge_stats`

```text
CREATE OR REPLACE FUNCTION public.admin_get_knowledge_stats()
RETURNS TABLE(
  total_onboarded BIGINT,
  not_knows_obi BIGINT,
  not_knows_ebo BIGINT,
  not_knows_ori BIGINT,
  not_knows_iyami BIGINT,
  not_knows_egbe_orun BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    count(*),
    count(*) FILTER (WHERE NOT knows_obi),
    count(*) FILTER (WHERE NOT knows_ebo),
    count(*) FILTER (WHERE NOT knows_ori),
    count(*) FILTER (WHERE NOT knows_iyami),
    count(*) FILTER (WHERE NOT knows_egbe_orun)
  FROM public.user_knowledge
  WHERE onboarding_completed = true
    AND public.has_role(auth.uid(), 'admin'::app_role);
$$;
```

**Funcao RPC atualizada:** `admin_list_profiles`

Adicionar colunas do `user_knowledge` ao JOIN para que a tabela de usuarios mostre as lacunas de cada aluno.

---

### 7. Tabela de usuarios no Admin com filtro por lacuna

Na tabela de usuarios recentes do Dashboard, adicionar:
- Coluna "Conhecimento" com badges coloridos (verde = sabe, vermelho = nao sabe)
- Filtro dropdown: "Mostrar apenas quem nao sabe: Obi / Ebo / Ori / Iyami / Egbe"

Isso permite ao admin identificar rapidamente para quem direcionar cada oferta.

---

## Resumo de Arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabela `user_knowledge`, ADD COLUMN em `profiles`, criar RPC `admin_get_knowledge_stats`, atualizar RPC `admin_list_profiles` |
| `src/components/onboarding/OnboardingWizard.tsx` | NOVO - Wizard de 3 etapas |
| `src/hooks/useOnboarding.ts` | NOVO - Hook para buscar/salvar onboarding |
| `src/components/ProtectedRoute.tsx` | Verificar onboarding antes de liberar acesso |
| `src/App.tsx` | Adicionar rota `/onboarding` |
| `src/components/admin/AdminDashboard.tsx` | Secao "Lacunas de Conhecimento" com grafico |
| `src/hooks/useAdminData.ts` | Adicionar hook `useAdminKnowledgeStats` |

---

## Fluxo do Usuario

```text
1. Usuario cria conta (/auth)
2. Apos login, ProtectedRoute detecta onboarding_completed = false
3. Redireciona para /onboarding
4. Etapa 1: Preenche nome, religiao, genero
5. Etapa 2: Responde 5 perguntas de conhecimento
6. Etapa 3: Ve mensagem personalizada, clica "Comecar Jornada"
7. Sistema salva tudo e redireciona para Home
8. Nas proximas visitas, vai direto para Home
```

## Visao do Admin

```text
Dashboard > Lacunas de Conhecimento:
  - 72% nao sabem Ebo      [████████████████░░░░░░]
  - 65% nao sabem Iyami     [███████████████░░░░░░░]
  - 45% nao sabem Egbe Orun [██████████░░░░░░░░░░░░]
  - 35% nao sabem Ori       [████████░░░░░░░░░░░░░░]
  - 20% nao sabem Obi       [█████░░░░░░░░░░░░░░░░░]

Tabela de usuarios: filtro por lacuna para direcionar ofertas
```

