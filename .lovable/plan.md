

# Tornar "Status em Ifá" obrigatório e visível no Dashboard

## O que ja esta funcionando

- Grafico de pizza "Distribuicao por Status em Ifa" no dashboard admin
- Barra "Sem Ifa" no grafico de lacunas de conhecimento
- Filtro "Nao tem Ifa" na tabela de usuarios
- Campo "Status em Ifa" no formulario de perfil
- Campo condicional no wizard de onboarding

## O que sera ajustado

### 1. Onboarding: tornar a pergunta obrigatoria

No `OnboardingWizard.tsx`, o botao "Continuar" do Step 0 sera bloqueado quando a religiao for `candomble`, `ifa` ou `umbanda` e o campo `ifaStatus` estiver vazio. Isso garante que ninguem passe sem responder.

Tambem sera adicionada uma mensagem visual de alerta caso tente prosseguir sem preencher.

### 2. Tabela Admin: adicionar badge de Ifa por usuario

No `AdminDashboard.tsx`, na coluna "Conhecimento" da tabela de ultimos usuarios, sera adicionado um badge colorido mostrando o titulo Ifa do usuario (ex: "Babalawo" em azul, "Iyanifa" em roxo, "Omo Ifa" em verde, "Sem Ifa" em cinza).

## Detalhe tecnico

### Arquivo 1: `src/components/onboarding/OnboardingWizard.tsx`

- Adicionar validacao no botao "Continuar" do Step 0:
  - Se `showIfaQuestion` e `ifaStatus` vazio, desabilitar o botao
  - Mostrar texto de orientacao abaixo do select quando vazio

### Arquivo 2: `src/components/admin/AdminDashboard.tsx`

- Na secao de badges de conhecimento (linha ~288-306), adicionar badge do status Ifa:
  - Babalawo: badge azul
  - Iyanifa: badge roxo
  - Omo Ifa: badge verde
  - Sem Ifa / null: badge cinza "Sem Ifa"

### Arquivos modificados: 2

1. `src/components/onboarding/OnboardingWizard.tsx`
2. `src/components/admin/AdminDashboard.tsx`

