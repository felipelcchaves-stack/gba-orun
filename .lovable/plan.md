

# Gamificacao Avancada + Conquistas na Comunidade

## Resumo

Expandir o sistema de conquistas com mais recompensas e niveis intermediarios para manter o usuario engajado, e exibir as conquistas (badges) ao lado do nome de cada usuario nos posts e respostas da comunidade, junto com o nivel (XP).

## O que muda

### 1. Banco de Dados: Tornar conquistas visiveis para todos

Hoje a tabela `user_achievements` so permite SELECT pelo proprio usuario (`auth.uid() = user_id`). Para exibir badges na comunidade, e necessario que usuarios autenticados possam ler conquistas de outros usuarios.

**Migracao SQL:**
- Adicionar politica RLS de SELECT em `user_achievements` para usuarios autenticados

### 2. Mais Conquistas (Retencao)

Expandir a lista de 7 para ~15 conquistas, com marcos intermediarios que mantem o usuario sempre proximo da proxima recompensa:

- **Primeiros passos**: Primeira consulta (ja existe), Primeiro ritual lido, Primeiro post na comunidade
- **Marcos de Obi**: 5, 15, 50, 100 consultas
- **Marcos de Leitura**: 3, 10, 25, 50 rituais lidos
- **Marcos de Streak**: 3, 7, 14, 30 dias seguidos
- **Marcos de XP**: 50, 100, 250, 500 XP
- **Marcos de Comunidade**: 1 post, 5 posts, 10 respostas (requer contagem -- sera feita client-side via contagem dos posts do usuario)

Para os marcos de comunidade, os contadores serao obtidos consultando `community_posts` e `community_replies` do usuario no momento do check.

### 3. Hook de Conquistas para outros usuarios

Criar um hook `useUserBadges(userId)` que busca as conquistas de um usuario especifico para exibir na comunidade.

Para performance, a comunidade ja busca os user_ids dos autores. Faremos uma unica query buscando as conquistas de todos os autores dos posts visiveis, e criaremos um mapa `userId -> badges[]`.

### 4. Exibicao na Comunidade

**CommunityPost.tsx:**
- Ao lado do nome do autor, exibir os icones das conquistas desbloqueadas (max 3 mais recentes) como mini-badges
- Exibir o nivel do usuario (calculado: `Math.floor(xp / 100) + 1`) como um badge colorido ao lado do nome

**CommunityReplyList.tsx:**
- Mesma logica: mini-badges ao lado do nome nas respostas

O layout sera: `[Avatar] [Nome] [Nivel badge] [conquista1] [conquista2] [conquista3] | tempo`

### 5. Arquivos Alterados

```text
Migracao:  supabase/migrations/XXXX_achievements_public_read.sql (1 politica RLS)
Editar:    src/hooks/useAchievements.ts           (mais conquistas + hook useUserBadges)
Editar:    src/hooks/useCommunity.ts               (buscar conquistas e stats dos autores)
Editar:    src/components/community/CommunityPost.tsx  (exibir badges e nivel)
Editar:    src/components/community/CommunityReplyList.tsx (exibir badges e nivel)
```

### 6. Detalhes Tecnicos

**Politica RLS:**
```text
CREATE POLICY "Authenticated users can read achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

**Busca de conquistas na comunidade:**
O hook `usePosts` ja coleta os `userIds` dos autores. Adicionaremos uma query extra:
```text
SELECT user_id, achievement_key FROM user_achievements WHERE user_id IN (...)
```
E tambem buscaremos o `xp_total` de `user_stats` para calcular o nivel:
```text
SELECT user_id, xp_total FROM user_stats WHERE user_id IN (...)
```

Isso adiciona os campos `author_badges` (string[]) e `author_level` (number) ao tipo `CommunityPost` e `CommunityReply`.

**Novas conquistas (lista completa):**
| Key | Nome | Descricao | Icone | Condicao |
|-----|------|-----------|-------|----------|
| ase | Ase! | Primeira consulta ao Obi | spark | oracle >= 1 |
| leitor | Leitor | Primeiro ritual lido | book | rituals >= 1 |
| ire | Ire | 5 consultas ao Obi | star | oracle >= 5 |
| estudioso | Estudioso | 3 rituais lidos | books | rituals >= 3 |
| constante | Constante | 3 dias seguidos | fire | streak >= 3 |
| ogbon | Ogbon | Leu 10 rituais | scroll | rituals >= 10 |
| devoto | Devoto | 7 dias seguidos | calendar | streak >= 7 |
| obi_mestre | Obi Mestre | 15 consultas | eye | oracle >= 15 |
| alafia | Alafia | 14 dias seguidos | sun | streak >= 14 |
| sabio | Sabio | 25 rituais lidos | brain | rituals >= 25 |
| awo | Awo | 50 consultas | crystal | oracle >= 50 |
| iwa_pele | Iwa Pele | 30 dias de pratica | crown | streak >= 30 |
| mestre | Mestre | 50 rituais lidos | trophy | rituals >= 50 |
| babalawo | Babalawo | 100 XP | medal | xp >= 100 |
| iluminado | Iluminado | 250 XP | sparkles | xp >= 250 |
| ancestral | Ancestral | 500 XP | diamond | xp >= 500 |

**Exibicao visual:** Os badges aparecerao como pequenos emojis ao lado do nome. O nivel aparecera como um badge colorido compacto (ex: "Nv.3").

**Politica de stats para leitura publica:** Tambem sera necessario adicionar uma politica SELECT em `user_stats` para usuarios autenticados, pois hoje so o proprio usuario pode ler seus stats.

