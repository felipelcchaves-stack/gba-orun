
# Ajustar degradê do banner para mostrar mais da foto

## Problema
O degradê atual (`from-black via-black/70 to-transparent`) cobre praticamente toda a imagem, fazendo ela desaparecer. A direção do gradiente também está invertida -- vai da esquerda (preto) para a direita (transparente), mas como a imagem fica à direita, o gradiente deveria ir da direita (transparente) para a esquerda (preto), cobrindo apenas a borda onde o texto encontra a imagem.

## O que sera feito

No arquivo `src/pages/Home.tsx` (linha 116), duas mudancas:

1. **Aumentar a area da imagem**: Trocar `w-[140px]` por `w-[180px]` para a foto ocupar mais espaco
2. **Suavizar o degradê**: Trocar `from-black via-black/70 to-transparent` por `from-black/80 via-black/30 to-transparent` -- isso deixa o lado esquerdo da imagem com um leve escurecimento (para o texto continuar legivel) mas revela a foto no lado direito

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Home.tsx` | Linha 114: `w-[140px]` para `w-[180px]`; Linha 116: gradiente mais suave |

**Total: 1 arquivo, 2 linhas**
