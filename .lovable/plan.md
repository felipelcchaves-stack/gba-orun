

# Plano Atualizado: Comunidade Privada + Melhoria na Jornada

## 1. Comunidade Privada Moderada (conforme plano anterior)

Tudo que foi descrito no plano anterior se mantém:
- Duas tabelas novas (`community_posts`, `community_replies`) com RLS e Realtime
- Pagina `/comunidade` com feed, posts, respostas e moderação por admins
- Hook `useCommunity.ts` com queries, mutations e realtime
- Componentes `CommunityPost.tsx` e `CommunityReplyList.tsx`
- Troca no `BottomNav.tsx`: "Oráculo" (Compass) vira "Comunidade" (MessageCircle)
- Nova rota no `App.tsx`

## 2. Troca do icone "+" na Jornada

Atualmente o canto superior direito da pagina Jornada tem um botão com o icone `Plus` dentro de um quadrado, que leva ao Oráculo. Ele e visualmente genérico.

**Mudança:** Trocar o icone `Plus` por algo mais expressivo e alinhado com o propósito espiritual. Opções:

- **Sparkles** -- transmite magia/inspiração, combina com "iniciar nova consulta"
- **Compass** -- referência direta ao oráculo

A sugestão é usar **Sparkles** pois o Compass já era usado no nav antigo e o Sparkles comunica melhor a ideia de "algo novo e especial". Além disso, o botão pode receber um leve ajuste visual (fundo com gradiente suave ou cor de destaque dourada) para ficar mais convidativo.

### Alteração no arquivo `src/pages/Journey.tsx`

- Trocar `import { Compass, Plus }` por `import { Compass, Sparkles }`
- No botão do canto superior direito, trocar `<Plus>` por `<Sparkles>`
- Opcionalmente, adicionar uma cor de destaque ao fundo do botão (ex: `bg-amber-50 text-amber-600`)

---

## Resumo completo de arquivos

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar tabelas `community_posts` e `community_replies` com RLS |
| `src/pages/Community.tsx` | Criar pagina da comunidade |
| `src/hooks/useCommunity.ts` | Criar hook com queries e mutations |
| `src/components/community/CommunityPost.tsx` | Criar card de post |
| `src/components/community/CommunityReplyList.tsx` | Criar lista de respostas |
| `src/components/BottomNav.tsx` | Trocar Oráculo por Comunidade |
| `src/App.tsx` | Adicionar rota /comunidade |
| `src/pages/Journey.tsx` | Trocar icone Plus por Sparkles no botão superior direito |

