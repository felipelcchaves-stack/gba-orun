
# Protecao contra Compartilhamento de Conta (Dispositivo Unico)

## Problema

Usuarios premium podem compartilhar suas credenciais com outros, permitindo que multiplas pessoas usem a mesma conta em aparelhos diferentes. Como o app pode ser usado uma vez por dia, isso facilita ainda mais o compartilhamento.

## Solucao: Bloqueio por Dispositivo com Confirmacao

O sistema vai funcionar assim:

1. Cada vez que o usuario faz login, o app gera um identificador unico do dispositivo (fingerprint) e salva no banco de dados
2. Nas proximas vezes que o usuario abrir o app, o sistema verifica se o dispositivo atual e o mesmo registrado
3. Se for um dispositivo diferente, em vez de deslogar automaticamente, aparece uma mensagem de aviso antes de permitir a troca

### Fluxo do Usuario

```text
Usuario faz login
       |
  Gera fingerprint do dispositivo
       |
  Tem dispositivo registrado no banco?
       |
  +--------+---------+
  |                   |
  NAO                SIM
  |                   |
  Registra e         E o mesmo dispositivo?
  permite acesso     |
                +-----+------+
                |            |
               SIM          NAO
                |            |
              Acesso       Modal de aviso:
              normal       "Se voce logar neste
                           dispositivo, o anterior
                           sera desativado.
                           Para alterar, entre em
                           contato com o suporte
                           do Gba-Orun."
                                |
                        +-------+-------+
                        |               |
                    "Continuar"     "Cancelar"
                        |               |
                    Atualiza         Desloga
                    dispositivo      o usuario
                    no banco
```

## Alteracoes Necessarias

### 1. Nova coluna na tabela `profiles`

Adicionar dois campos:
- `device_id` (text, nullable) -- identificador unico do dispositivo
- `device_changed_at` (timestamp, nullable) -- quando o dispositivo foi trocado pela ultima vez

### 2. Geracao do Fingerprint do Dispositivo

Um identificador unico sera gerado combinando informacoes do navegador (User Agent, resolucao de tela, timezone, idioma) e salvo no localStorage. Isso cria um ID estavel para cada navegador/dispositivo.

### 3. Hook `useDeviceGuard.ts`

Novo hook que:
- Gera o fingerprint do dispositivo atual
- Compara com o `device_id` salvo no perfil do usuario
- Se for diferente, retorna um estado indicando que precisa de confirmacao
- Se for igual ou se nao houver device_id salvo, permite acesso normal

### 4. Modal de Aviso de Troca de Dispositivo (`DeviceChangeModal.tsx`)

Um dialog que aparece quando o usuario tenta acessar de um dispositivo diferente, com a mensagem:

> "Detectamos que voce esta acessando de um novo dispositivo. Se continuar, o dispositivo anterior sera desativado e voce nao podera mais usa-lo sem entrar em contato com o suporte do Gba-Orun."

Opcoes:
- **"Continuar aqui"**: Atualiza o device_id no banco e permite acesso
- **"Cancelar"**: Desloga o usuario

### 5. Integracao no ProtectedRoute

O `ProtectedRoute` vai incluir a verificacao de dispositivo. Se houver conflito, mostra o modal antes de renderizar a pagina.

### 6. Painel Admin -- Coluna de Dispositivo

Na tabela de usuarios do admin, sera possivel ver qual dispositivo esta vinculado e resetar o dispositivo de um usuario (caso ele entre em contato com o suporte pedindo troca).

## Detalhes Tecnicos

### Fingerprint do Dispositivo

Sera gerado no frontend usando uma combinacao de:
- `navigator.userAgent`
- `screen.width + screen.height`
- `Intl.DateTimeFormat().resolvedOptions().timeZone`
- `navigator.language`
- Um UUID aleatorio gerado uma unica vez e salvo no localStorage

O UUID no localStorage e o fator principal -- garante unicidade mesmo se dois dispositivos tiverem configuracoes identicas. Se o usuario limpar o localStorage, um novo fingerprint sera gerado e ele precisara confirmar a troca.

### Migracao SQL

Adicionar colunas em `profiles`:
- `device_id TEXT`
- `device_changed_at TIMESTAMPTZ`

### Arquivos a criar/modificar

| Arquivo | Acao |
|---|---|
| Migracao SQL | Adicionar colunas device_id e device_changed_at em profiles |
| `src/lib/deviceFingerprint.ts` | Funcao para gerar e recuperar o fingerprint do dispositivo |
| `src/hooks/useDeviceGuard.ts` | Hook que verifica e gerencia o bloqueio por dispositivo |
| `src/components/DeviceChangeModal.tsx` | Modal de aviso de troca de dispositivo |
| `src/components/ProtectedRoute.tsx` | Integrar verificacao de dispositivo |
| `src/components/admin/AdminUsers.tsx` | Adicionar coluna de dispositivo e botao de reset |
| `src/hooks/useAdminData.ts` | Sem alteracao (admin_list_profiles ja retorna tudo de profiles) |

### Excecoes

- Admins nao terao restricao de dispositivo (para facilitar gestao)
- Usuarios free (nao-premium) tambem terao a restricao, pois podem ganhar acesso premium futuramente e ja estarao com o dispositivo vinculado
- A funcao `admin_list_profiles` ja retorna dados de profiles, entao o device_id aparecera automaticamente na listagem

### Reset de Dispositivo pelo Admin

Na tabela de usuarios, cada linha tera um botao "Resetar Dispositivo" que limpa o `device_id` do usuario, permitindo que ele vincule um novo aparelho no proximo login.
