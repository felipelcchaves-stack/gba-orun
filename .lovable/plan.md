
# Corrigir Menu Inferior Invisivel no Chrome/Safari iOS

## Problema

O menu de navegacao inferior (BottomNav) fica escondido atras da barra de ferramentas do navegador em iPhones, especialmente quando o app e aberto pelo WhatsApp (navegador in-app). Isso acontece porque o CSS `env(safe-area-inset-bottom)` -- que adiciona espaco para a barra do navegador -- so funciona quando o `index.html` declara `viewport-fit=cover`, e essa declaracao esta faltando.

## Solucao

Duas correcoes simples:

### 1. Ativar safe-area no viewport (index.html)

Adicionar `viewport-fit=cover` na meta tag viewport. Isso instrui o navegador a informar ao CSS qual e a area segura do dispositivo.

**De:**
```
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Para:**
```
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### 2. Garantir padding seguro no body (index.css)

Adicionar `padding-bottom: env(safe-area-inset-bottom)` no body para que o conteudo das paginas tambem respeite a area segura, evitando que texto ou cards fiquem atras do menu.

## Detalhes Tecnicos

### Arquivos modificados:

- **`index.html`** (linha 5): adicionar `viewport-fit=cover` na meta viewport
- **`src/index.css`**: adicionar `padding-bottom: env(safe-area-inset-bottom)` no body

O `BottomNav` ja usa `pb-[max(0.625rem,env(safe-area-inset-bottom))]`, entao ele vai funcionar corretamente assim que o `viewport-fit=cover` for ativado. Nenhuma mudanca necessaria no componente BottomNav.

Mudanca de 2 linhas em 2 arquivos.
