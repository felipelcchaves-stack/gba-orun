

# Atualizar imagem e degradê do banner "Jornada Espiritual"

## O que sera feito

Manter o layout atual do banner (texto a esquerda, imagem a direita com degradê sobreposto), fazendo duas mudancas:

1. **Trocar a imagem** da direita pela foto enviada (Oluwo Ifatokun com a pomba branca), copiando o arquivo para `src/assets/hero-banner.jpg`
2. **Escurecer o degradê** que cobre a transicao entre texto e imagem -- trocar de `from-secondary via-secondary/60 to-transparent` (tom marrom/avermelhado atual) para um degradê preto/escuro (`from-black via-black/70 to-transparent`), harmonizando com a foto
3. **Ajustar o fundo** do lado esquerdo do banner para combinar com o degradê escuro (de `bg-secondary` para `bg-black` ou `bg-neutral-900`)
4. **Ajustar cores do texto** para garantir contraste sobre o fundo escuro (textos em branco)

## Detalhes tecnicos

### Arquivo: `src/assets/hero-banner.jpg`
Copiar a imagem enviada pelo usuario para substituir o arquivo atual.

### Arquivo: `src/pages/Home.tsx` (bloco do hero banner, ~linhas 97-112)

Mudancas no JSX:
- Trocar `bg-secondary` do container por `bg-black`
- Trocar `text-secondary-foreground` dos textos por `text-white` e `text-white/70`
- Trocar o degradê `from-secondary via-secondary/60 to-transparent` por `from-black via-black/70 to-transparent`

| Arquivo | Acao |
|---------|------|
| `src/assets/hero-banner.jpg` | Substituir pela foto enviada |
| `src/pages/Home.tsx` | Ajustar cores do banner (fundo preto, degradê escuro, texto branco) |

**Total: 2 arquivos modificados**

