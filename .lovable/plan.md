

# Plano: Expandir Categorias, Oracoes e Fortalecer a Jornada Espiritual

## Resumo

O app precisa funcionar como complemento dos cursos de Obi, Ebo, Ori, Iyami e Egbe Orun. O aluno consulta o Oraculo, identifica o que caiu, e o app o guia por toda a trajetoria: qual ebo fazer, se precisa de ibori, se precisa apaziguar Iyami ou Egbe Orun. Alem disso, o admin precisa poder cadastrar oracoes da manha, da noite, de Ori, de Iyami, cantigas -- tudo pelo painel.

---

## O Que Falta Hoje

1. **Categorias limitadas**: Apenas 4 categorias (oriki, ibori, ebo, geral). Faltam: `oracao_manha`, `oracao_noite`, `oracao_ori`, `oracao_iyami`, `cantiga`, `egbe_orun`, `iyami`.
2. **Oraculo nao conecta com oracoes**: Quando o resultado cai, as sugestoes linkam para categorias genericas. Deveria sugerir oracoes especificas (ex: "Reze a oracao da manha de Ori" + link direto).
3. **Admin limitado**: O formulario de ritual so tem 4 categorias no dropdown. O admin nao consegue cadastrar oracoes ou cantigas.
4. **Jornada nao mostra tarefas detalhadas**: A pagina Journey mostra entradas do oraculo mas nao exibe o checklist de tarefas (journey_tasks) que ja esta no banco.

---

## Fase 1 - Expandir Categorias no Sistema

### Tabela `rituals` (sem migracao necessaria)
A coluna `category` ja e `text`, nao e enum. Entao basta expandir as opcoes no codigo.

### Novas categorias:
| Categoria | Label no App | Descricao |
|---|---|---|
| `oriki` | Orikis | Louvacoes aos Orixas |
| `ibori` | Ibori | Cuidados com o Ori |
| `ebo` | Ebo | Oferendas e limpezas |
| `oracao_manha` | Oracoes da Manha | Oracoes para iniciar o dia |
| `oracao_noite` | Oracoes da Noite | Oracoes antes de dormir |
| `oracao_ori` | Oracoes de Ori | Oracoes especificas para o Ori |
| `oracao_iyami` | Oracoes de Iyami | Oracoes para apaziguar Iyami |
| `cantiga` | Cantigas | Cantigas sagradas |
| `egbe_orun` | Egbe Orun | Rituais e oracoes do Egbe Orun |
| `iyami` | Iyami | Rituais de Iyami Osoronga |
| `geral` | Fundamentos | Conteudo geral |

### Arquivos a modificar:
- `src/components/admin/AdminRitualForm.tsx` -- Expandir o dropdown CATEGORIES
- `src/pages/Rituals.tsx` -- Expandir filtros e banners de categoria
- `src/pages/Learn.tsx` -- Expandir modulos/filtros
- `src/pages/Home.tsx` -- Expandir quick access e destaques

---

## Fase 2 - Oraculo Inteligente com Sugestoes Expandidas

### Mapeamento Oracle -> Acoes Detalhadas

Atualizar a constante `ORACLE_RESULTS` em `Oracle.tsx` para que cada resultado sugira acoes mais granulares, incluindo oracoes especificas:

**Oyekun (NAO):**
- Fazer Ebo de Limpeza (categoria: ebo)
- Fazer Ibori (categoria: ibori)
- Verificar Iyami (categoria: iyami)
- Rezar Oracao de Ori (categoria: oracao_ori) -- **NOVO**
- Rezar Oracao da Noite (categoria: oracao_noite) -- **NOVO**

**Okaran (TALVEZ):**
- Ebo Leve (categoria: ebo)
- Fortalecer Ori (categoria: ibori)
- Rezar Oracao da Manha (categoria: oracao_manha) -- **NOVO**

**Ejife (SIM):**
- Oriki de Agradecimento (categoria: oriki)
- Cantiga de Louvor (categoria: cantiga) -- **NOVO**

**Etagun (SIM FORTE):**
- Oriki de Louvor (categoria: oriki)
- Oferenda ao Egbe Orun (categoria: egbe_orun)
- Cantiga Sagrada (categoria: cantiga) -- **NOVO**

**Alafia (PAZ - confirme):**
- Ibori de Protecao (categoria: ibori)
- Oracao de Iyami (categoria: oracao_iyami) -- **NOVO**
- Oracao da Manha (categoria: oracao_manha) -- **NOVO**

### Logica de Match Inteligente
Quando o usuario seleciona o resultado, o app buscara nos rituais cadastrados os que tem `trigger_oracle` correspondente OU os que pertencem a categoria sugerida, priorizando rituais com trigger_oracle exato.

---

## Fase 3 - Jornada com Checklist de Tarefas

A tabela `journey_tasks` ja existe. O que falta e exibir as tarefas na pagina Journey.

### Mudancas em `Journey.tsx`:
1. Ao exibir uma entrada do dia, buscar as `journey_tasks` associadas
2. Mostrar cada tarefa como item de checklist com:
   - Imagem da categoria
   - Titulo da tarefa
   - Tipo (ebo, ibori, oracao, cantiga...)
   - Checkbox para marcar como concluida
   - Link para o ritual correspondente (se houver)
3. Organizar por periodos: Manha (oracoes da manha), Tarde (ebos, ibori), Noite (oracoes da noite)
4. Barra de progresso: "X de Y tarefas concluidas"

### Hook necessario:
Usar `useJourneyTasks` que ja existe, passando o `journey_id` de cada entrada do dia.

---

## Fase 4 - Admin Expandido

### 4A - Dropdown de Categorias Completo
Atualizar `AdminRitualForm.tsx` e `Admin.tsx` para incluir todas as 11 categorias no dropdown.

### 4B - Filtro por Categoria no Admin
Adicionar um filtro na lista de rituais do admin para o usuario poder ver apenas oracoes, apenas cantigas, etc.

### 4C - Labels Amigaveis
Criar um mapa de traducao `category -> label` para exibir nomes bonitos em vez de slugs (ex: `oracao_manha` -> "Oracoes da Manha").

---

## Fase 5 - Home com Secao de Oracoes do Dia

### Mudancas em `Home.tsx`:
1. Adicionar secao "Oracoes de Hoje" abaixo dos destaques
2. Mostrar oracoes da manha ou da noite conforme o horario do dia (antes das 12h = manha, depois = noite)
3. Quick access expandido com novos icones para Oracoes e Cantigas

---

## Detalhes Tecnicos

### Constante Global de Categorias
Criar um arquivo `src/lib/categories.ts` com o mapeamento completo para reutilizar em todos os lugares:

```text
CATEGORIES = {
  oriki: { label: "Orikis", icon: Sparkles, image: orikiCategory },
  ibori: { label: "Ibori", icon: Heart, image: iboriCategory },
  ebo: { label: "Ebo", icon: Shield, image: eboCategory },
  oracao_manha: { label: "Oracoes da Manha", icon: Sunrise, image: ... },
  oracao_noite: { label: "Oracoes da Noite", icon: Moon, image: ... },
  oracao_ori: { label: "Oracoes de Ori", icon: Heart, image: iboriCategory },
  oracao_iyami: { label: "Oracoes de Iyami", icon: AlertTriangle, image: iyamiCategory },
  cantiga: { label: "Cantigas", icon: Music, image: ... },
  egbe_orun: { label: "Egbe Orun", icon: Users, image: egbeOrunCategory },
  iyami: { label: "Iyami", icon: AlertTriangle, image: iyamiCategory },
  geral: { label: "Fundamentos", icon: BookOpen, image: ... },
}
```

### Arquivos a Criar
| Arquivo | Descricao |
|---|---|
| `src/lib/categories.ts` | Mapa central de categorias com labels, icones e imagens |

### Arquivos a Modificar
| Arquivo | Mudanca |
|---|---|
| `src/pages/Oracle.tsx` | Expandir sugestoes com oracoes e cantigas |
| `src/pages/Journey.tsx` | Exibir checklist de journey_tasks com progresso |
| `src/pages/Home.tsx` | Secao "Oracoes de Hoje" + quick access expandido |
| `src/pages/Rituals.tsx` | Mais categorias nos filtros e banners |
| `src/pages/Learn.tsx` | Mais modulos nos filtros |
| `src/components/admin/AdminRitualForm.tsx` | Dropdown com 11 categorias |
| `src/pages/Admin.tsx` | Filtro por categoria na lista de rituais |

### Nenhuma migracao SQL necessaria
A coluna `category` na tabela `rituals` ja e do tipo `text`, aceitando qualquer valor. As novas categorias sao apenas convencoes no codigo.

---

## Resultado Esperado

O admin podera cadastrar qualquer tipo de conteudo (oracoes da manha, da noite, cantigas, rituais de iyami, etc.) pelo painel. O aluno, ao jogar o Obi e informar o resultado, recebera sugestoes especificas que incluem nao so ebos e ibori, mas tambem oracoes e cantigas relevantes. A jornada mostrara um checklist completo das tarefas espirituais do dia, organizado por periodo, com progresso visual.

