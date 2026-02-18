

# Tornar o Link de Instalacao Visivel para o Usuario

## Problema

A pagina `/instalar` existe e funciona, mas ninguem consegue chega-la porque:

1. Nao existe nenhum link ou botao no app apontando para `/instalar` (nem no menu inferior, nem na Home, nem no Perfil)
2. O evento `beforeinstallprompt` so e capturado quando o usuario ja esta na pagina, mas ele nunca navega ate la

## Solucao

Adicionar um link visivel na pagina de **Perfil** (`src/pages/Profile.tsx`) com um botao "Instalar App", pois e o local mais natural para essa acao (junto de configuracoes da conta). Tambem capturar o evento `beforeinstallprompt` globalmente no `App.tsx` para nao perder a oportunidade de instalacao.

### 1. Capturar `beforeinstallprompt` globalmente

Criar um hook `src/hooks/useInstallPrompt.ts` que:
- Escuta o evento `beforeinstallprompt` no nivel global (window)
- Armazena o evento em um state
- Detecta se e iOS
- Detecta se ja esta instalado (standalone)
- Exporta: `deferredPrompt`, `isIOS`, `isInstalled`, `triggerInstall()`

### 2. Adicionar botao "Instalar App" na pagina Perfil

No `src/pages/Profile.tsx`, importar o hook e exibir um card/botao com icone de download:
- Se ja instalado: nao exibir nada
- Se Android com prompt disponivel: botao "Instalar App" que aciona o prompt diretamente
- Se iOS: botao que navega para `/instalar` (onde tem as instrucoes passo a passo)
- Se Android sem prompt: botao que navega para `/instalar` (instrucoes manuais)

### 3. Simplificar a pagina Install.tsx

Atualizar `/instalar` para tambem usar o novo hook, removendo a logica duplicada de captura do evento.

## Detalhes Tecnicos

### Arquivos:
- **`src/hooks/useInstallPrompt.ts`** (novo): hook global para capturar beforeinstallprompt
- **`src/pages/Profile.tsx`**: adicionar botao de instalacao
- **`src/pages/Install.tsx`**: refatorar para usar o novo hook

### Fluxo do usuario:

```text
Usuario abre Perfil --> Ve botao "Instalar App"
  --> Android: clica e instala direto
  --> iOS: clica e ve instrucoes passo a passo em /instalar
```

Mudancas em 2 arquivos existentes + 1 novo hook.

