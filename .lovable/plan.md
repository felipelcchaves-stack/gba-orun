
# Adicionar texto ao botao de nova consulta na Jornada

## Problema

O botao no canto superior direito da pagina "Minha Jornada" e apenas um icone (Sparkles), sem texto. Nao fica claro para o usuario que ele pode iniciar uma nova consulta clicando ali.

## Solucao

Transformar o icone isolado em um botao com texto "Nova consulta" ao lado do icone, estilizado como um CTA (call-to-action) suave que combina com o design da pagina.

## Detalhes Tecnicos

### Arquivo: `src/pages/Journey.tsx` (linhas 96-98)

Trocar o Link atual (icone sozinho) por um Link com texto:

- Manter o icone `Sparkles` mas adicionar o texto **"Nova consulta"** ao lado
- Estilo: `bg-accent/15` com `text-accent` (dourado), `rounded-2xl`, `px-4 py-2.5`, `font-semibold text-sm`
- Usar `flex items-center gap-2` para alinhar icone e texto
- Manter `shadow-card` e `hover:shadow-soft` para consistencia visual
- O resultado sera um botao tipo "pill" dourado que convida o usuario a consultar o oraculo

Mudanca de 3 linhas em um unico arquivo.
