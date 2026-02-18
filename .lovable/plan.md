
# Corrigir navegacao do botao Voltar no RitualReader

## Problema

O botao "Voltar" na pagina de leitura de rituais (`RitualReader.tsx`, linha 62) usa um link fixo para `/rituais`. Quando o usuario chega ali vindo da tela "Aprender" (`/aprender`), o botao leva para a pagina errada ("Rituais Sagrados" com chips de filtro), em vez de voltar para a tela "Aprender".

## Solucao

Trocar o `<Link to="/rituais">` por um botao que usa `navigate(-1)` do React Router. Isso faz o botao voltar sempre para a pagina anterior no historico, seja ela `/aprender`, `/rituais`, ou qualquer outra origem.

## Detalhes Tecnicos

### Arquivo: `src/pages/RitualReader.tsx`

1. Importar `useNavigate` do `react-router-dom` (no lugar de ou alem de `Link`)
2. Na linha 62, trocar o `<Link to="/rituais">` por um `<button onClick={() => navigate(-1)}>` com os mesmos estilos
3. Manter a mesma aparencia visual (icone ArrowLeft + texto "Voltar")

Mudanca pontual de 3 linhas -- sem impacto em nenhum outro arquivo.
