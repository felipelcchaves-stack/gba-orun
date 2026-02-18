

# Remover duplicacao e melhorar textos da Jornada

## Problema

Quando o usuario nao tem tarefas no dia, dois blocos quase identicos aparecem na tela:
1. O **TodayHeroCard** com "Consultar o Obi"
2. Um card separado logo abaixo, tambem com "Consultar Obi"

Isso polui a tela e confunde o usuario.

## Solucao

### 1. Remover bloco duplicado em `src/pages/Journey.tsx`

Eliminar o bloco de estado vazio (linhas 124-137) que renderiza o segundo CTA "Nenhuma consulta hoje / Consultar Obi". O TodayHeroCard ja cumpre essa funcao sozinho.

### 2. Atualizar textos no `src/components/journey/TodayHeroCard.tsx`

Trocar os textos para algo mais espiritual e menos generico:

- **Titulo (estado vazio):** "Comece sua rotina espiritual" -> "Hoje e dia de cultuar seu Orisa"
- **Subtitulo:** "Consulte o Obi para receber suas orientacoes do dia." -> "Descubra o que a ancestralidade preparou para voce."
- **Botao CTA:** "Consultar o Obi" -> "Iniciar meu Ritual"
- **Icone do botao:** Trocar Compass por um icone mais tematico (ex: Flame ou Sparkles)

### Resumo das mudancas

| Arquivo | Mudanca |
|---|---|
| `src/pages/Journey.tsx` | Remover bloco de estado vazio duplicado (linhas 124-137) |
| `src/components/journey/TodayHeroCard.tsx` | Atualizar textos do CTA e do estado vazio |

Nenhuma mudanca no banco de dados. Apenas ajustes de texto e remocao de codigo redundante.

