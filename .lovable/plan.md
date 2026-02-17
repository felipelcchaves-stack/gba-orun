
# Plano: Estado Vazio do Dashboard, Nome Real e Icones no Aprender

Tres ajustes de UX: mostrar estado vazio no painel de equilibrio espiritual, exibir o nome real do usuario, e mover os icones de acesso rapido para a aba Aprender.

---

## 1. Dashboard Equilibrio Espiritual - Estado Vazio

**Problema:** Quando o usuario nao tem nenhuma tarefa na jornada, o hook `useSpiritualAnalysis` retorna score 50 para todas as energias (por causa do `if (total === 0) return 50`), mostrando dados "fantasma" que nao refletem a realidade.

**Solucao:** Detectar quando o usuario nao tem nenhuma tarefa e mostrar um estado vazio amigavel com uma mensagem convidando a iniciar a jornada.

**Alteracoes:**
- `src/components/home/SpiritualEnergyDashboard.tsx`: Verificar se todas as energias tem `total === 0`. Se sim, renderizar um card com mensagem tipo "Comece sua jornada espiritual para ver seu equilibrio aqui" com link para `/jornada`.
- Tambem ocultar o `SpiritualEvolutionChart` quando nao ha dados (mesma logica).

---

## 2. Nome Real do Usuario (em vez de "Visitante")

**Problema:** A Home usa `user?.user_metadata?.display_name` que pode estar vazio, resultando em "Ola, Visitante!". O nome real esta na tabela `profiles.display_name`.

**Solucao:** Importar o hook `useProfile` na Home e usar o `display_name` da tabela profiles como fonte primaria.

**Alteracoes:**
- `src/pages/Home.tsx`:
  - Importar `useProfile` de `@/hooks/useProfile`
  - Buscar `profile?.display_name` como prioridade, com fallback para `user?.user_metadata?.display_name`, e por ultimo exibir apenas "Ola!" sem complemento se nenhum nome existir

---

## 3. Icones de Acesso Rapido na Aba Aprender

**Problema:** Os icones de categorias (Obi, Rituais, Ibori, Oriki, Ebo, Oracoes, Cantigas) na Home duplicam funcionalidade que ja esta na aba Aprender.

**Solucao:** Mover a grade de icones tematicos coloridos para o topo da pagina Aprender, acima dos chips de filtro. Na Home, manter apenas os atalhos mais relevantes (Oraculo, Jornada, Ofertas).

**Alteracoes:**
- `src/pages/Learn.tsx`:
  - Adicionar a grade de icones tematicos com scroll horizontal no topo (antes dos chips de filtro)
  - Cada icone filtra a categoria correspondente ao ser clicado (em vez de navegar para outra rota)
  - Icones: Compass (Obi -> navega para /oraculo), BookOpen (Rituais), Heart (Ibori), Sparkles (Oriki), Shield (Ebo), Sunrise (Oracoes), Music (Cantigas)

- `src/pages/Home.tsx`:
  - Reduzir o `QUICK_ACCESS` para manter apenas: Oraculo, Jornada e Ofertas (os 3 que nao sao categorias de conteudo)
  - Remover os icones de categorias que agora vivem no Aprender

---

## Resumo de arquivos

| Arquivo | Acao |
|---|---|
| `src/components/home/SpiritualEnergyDashboard.tsx` | Adicionar estado vazio quando total de tarefas = 0 |
| `src/components/home/SpiritualEvolutionChart.tsx` | Ocultar quando nao ha dados |
| `src/pages/Home.tsx` | Usar useProfile para nome real; reduzir Quick Access |
| `src/pages/Learn.tsx` | Adicionar grade de icones tematicos com filtro por categoria |
