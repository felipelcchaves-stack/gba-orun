

# Plano: Reset de Jornada, Aba de Promocoes e Icones Tematicos

Tres melhorias principais: botao para resetar dados do usuario, sistema de promocoes gerenciavel no admin, e substituicao de imagens por icones tematicos.

---

## 1. Botao de Reset da Jornada

**O que faz:** Um botao na tela de Perfil que apaga todos os dados de progresso do usuario (jornada, tarefas, stats, conquistas) para ele recomecar do zero.

**Experiencia do usuario:**
- Botao vermelho "Recomecar Jornada" na tela de Perfil, acima do botao "Sair"
- Ao clicar, abre um dialogo de confirmacao pedindo para digitar "RESETAR" para evitar cliques acidentais
- Apos confirmacao, todos os dados sao apagados e a tela recarrega

**Detalhes tecnicos:**
- Criar RPC `reset_user_journey(p_user_id UUID)` no banco que deleta de: `user_journey`, `journey_tasks`, `user_stats`, `user_achievements` onde `user_id = p_user_id`
- Usar SECURITY DEFINER para permitir o delete (ja que o usuario nao tem policy de DELETE nessas tabelas)
- Validar que `auth.uid() = p_user_id` dentro da funcao
- Novo hook `useResetJourney` em `src/hooks/useResetJourney.ts`
- Componente de confirmacao em `src/pages/Profile.tsx`

---

## 2. Sistema de Promocoes

**O que faz:** Uma aba "Promocoes" no app onde o usuario ve banners de cursos/ofertas. O admin gerencia tudo pelo painel, e cada clique e rastreado para metricas.

### Para o usuario:
- Nova aba "Ofertas" no BottomNav (icone de Tag/Gift)
- Pagina `/promocoes` com cards de promocoes ativas (banner, titulo, descricao curta, botao "Acessar")
- Ao clicar, registra o clique no banco e abre o link externo

### Para o admin:
- Nova secao "Promocoes" no sidebar do admin
- Formulario para criar/editar promocao: titulo, descricao, URL da imagem/banner, link de checkout, ativo/inativo, ordem de exibicao
- Tabela listando promocoes com toggle de ativo/inativo
- Dashboard: novo KPI "Cliques em Promocoes (hoje/total)" e tabela mostrando qual promocao teve mais cliques

### Detalhes tecnicos:

**Novas tabelas:**

```text
promotions
- id UUID PK
- title TEXT NOT NULL
- description TEXT
- banner_url TEXT (URL da imagem do banner)
- checkout_url TEXT NOT NULL (link externo)
- is_active BOOLEAN DEFAULT true
- display_order INT DEFAULT 0
- created_at TIMESTAMPTZ DEFAULT now()

promotion_clicks
- id UUID PK
- promotion_id UUID FK -> promotions
- user_id UUID NOT NULL
- clicked_at TIMESTAMPTZ DEFAULT now()
```

**RLS:**
- `promotions`: SELECT publico (para todos verem), ALL para admin
- `promotion_clicks`: INSERT para usuarios autenticados (user_id = auth.uid()), SELECT para admin

**Novos arquivos:**
- `src/hooks/usePromotions.ts` -- CRUD + hook de registro de clique
- `src/pages/Promotions.tsx` -- pagina do usuario com cards
- `src/components/admin/AdminPromotions.tsx` -- gestao no admin

**Atualizacoes:**
- `src/components/BottomNav.tsx` -- adicionar link "Ofertas" com icone Tag
- `src/components/admin/AdminSidebar.tsx` -- adicionar item "Promocoes"
- `src/pages/Admin.tsx` -- renderizar secao "promotions"
- `src/App.tsx` -- rota `/promocoes` protegida
- `src/components/admin/AdminDashboard.tsx` -- KPI de cliques em promocoes
- `admin_get_stats` -- adicionar contagem de cliques

---

## 3. Icones Tematicos (substituir imagens chapadas)

**O que muda:** Os Quick Access da Home e os cards de categorias passam a usar icones Lucide estilizados com fundos coloridos em vez de imagens JPG repetitivas.

**Mapeamento de icones por categoria:**

```text
Obi (Oraculo)  -> Compass com fundo dourado
Rituais        -> BookOpen com fundo verde
Ibori          -> Heart com fundo rosa
Oriki          -> Sparkles com fundo roxo
Ebo            -> Shield com fundo laranja
Oracoes        -> Sunrise com fundo amarelo
Cantigas       -> Music com fundo azul
Jornada        -> Map com fundo verde-escuro
Ofertas        -> Gift com fundo vermelho
```

**Implementacao:**
- Atualizar `QUICK_ACCESS` em `Home.tsx` para usar icones com fundo colorido em vez de `<img>`
- Cada icone fica dentro de um `div` com `rounded-2xl` e cor de fundo suave (ex: `bg-amber-100 text-amber-600`)
- Manter a mesma grade horizontal scroll
- Atualizar `CATEGORIES_MAP` em `src/lib/categories.ts` para incluir uma propriedade `bgColor` por categoria
- Os cards de Destaques e Rituais do Dia continuam com imagem (quando disponivel) mas usam o icone como fallback

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabelas `promotions` e `promotion_clicks`, RPC `reset_user_journey`, atualizar `admin_get_stats` |
| `src/hooks/useResetJourney.ts` | Criar: hook de reset |
| `src/hooks/usePromotions.ts` | Criar: CRUD promocoes + registro de clique |
| `src/pages/Profile.tsx` | Adicionar botao de reset com confirmacao |
| `src/pages/Promotions.tsx` | Criar: pagina de promocoes do usuario |
| `src/components/admin/AdminPromotions.tsx` | Criar: gestao de promocoes |
| `src/components/admin/AdminSidebar.tsx` | Adicionar "Promocoes" |
| `src/components/admin/AdminDashboard.tsx` | KPI de cliques |
| `src/pages/Admin.tsx` | Secao "promotions" |
| `src/App.tsx` | Rota `/promocoes` |
| `src/components/BottomNav.tsx` | Link "Ofertas" |
| `src/pages/Home.tsx` | Icones coloridos no Quick Access |
| `src/lib/categories.ts` | Adicionar `bgColor` por categoria |

