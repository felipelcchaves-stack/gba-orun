

# Plano: Perfil Completo + Dark Mode + Dashboard Espiritual

## O Que Existe Hoje

A pagina de perfil (`/perfil`) mostra apenas o email, XP, stats e conquistas. Nao tem como o usuario editar seu nome, trocar senha, escolher sua religiao, definir um dia de cuidado espiritual, nem alternar entre tema claro e escuro. O dashboard (Home) so mostra rituais e oracoes, sem nenhum indicador personalizado de como o usuario esta com seus cuidados.

## O Que Vai Mudar

### 1. Perfil Completo e Editavel

A pagina de perfil sera reorganizada em secoes claras:

**Secao: Dados Pessoais**
- Nome de exibicao (editavel)
- Email (somente leitura)
- Religiao/Tradicao: seletor com opcoes (Candomble, Umbanda, Ifa, Outra, Prefiro nao dizer)
- Dia de Cuidado Espiritual: seletor de dia da semana (Segunda a Domingo) -- o dia que o usuario reserva para se cuidar espiritualmente

**Secao: Seguranca**
- Alterar senha: campos "Nova senha" e "Confirmar senha" com botao salvar
- Usa `supabase.auth.updateUser({ password })` -- nao precisa da senha atual

**Secao: Aparencia**
- Toggle Dark Mode / Light Mode
- Preview instantaneo ao alternar

**Secao: Conta**
- Botao "Sair" (logout)

### 2. Dark Mode Funcional

O projeto ja tem as variaveis CSS para `.dark` e `darkMode: ["class"]` no Tailwind, alem do pacote `next-themes` instalado. So falta:
- Adicionar o `ThemeProvider` do `next-themes` no `App.tsx`
- Colocar o toggle no perfil

### 3. Dashboard Espiritual na Home

Um novo card na Home que mostra o "Status Espiritual" do usuario, considerando o dia de cuidado que ele definiu no perfil:

**Card "Seu Cuidado Espiritual":**
- Se hoje e o dia de cuidado: destaque dourado com mensagem "Hoje e seu dia de cuidado! Ja consultou o Oraculo?"
- Se o dia ja passou esta semana e nao houve consulta: alerta laranja "Voce perdeu seu dia de cuidado esta semana"
- Se o dia ainda vai chegar: mensagem neutra "Seu proximo cuidado e na [dia]. Faltam X dias"
- Barra de progresso semanal: quantos dias o usuario fez atividade esta semana vs. meta
- Ultima consulta: "Sua ultima consulta foi ha X dias" com resultado resumido

Isso cria urgencia e habito.

---

## Migracao de Banco de Dados

Adicionar 2 colunas na tabela `profiles`:

| Coluna | Tipo | Default | Descricao |
|---|---|---|---|
| religion | text | null | Candomble, Umbanda, Ifa, Outra |
| care_day | integer | null | 0=Domingo, 1=Segunda... 6=Sabado |

As RLS policies ja existem e cobrem update pelo dono.

## Detalhes Tecnicos

### Arquivos a Criar

| Arquivo | Descricao |
|---|---|
| `src/hooks/useProfile.ts` | Hook para buscar e atualizar dados do perfil (nome, religiao, care_day) |
| `src/components/profile/ProfileForm.tsx` | Formulario de dados pessoais (nome, religiao, dia de cuidado) |
| `src/components/profile/PasswordForm.tsx` | Formulario de alteracao de senha |
| `src/components/profile/ThemeToggle.tsx` | Toggle dark/light mode |
| `src/components/home/SpiritualCareCard.tsx` | Card do dashboard com status de cuidado espiritual |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/pages/Profile.tsx` | Reescrever com secoes: Dados, Seguranca, Aparencia, Conta |
| `src/pages/Home.tsx` | Adicionar SpiritualCareCard abaixo do greeting |
| `src/App.tsx` | Envolver app com ThemeProvider do next-themes |
| `src/main.tsx` | Nenhuma mudanca necessaria |

### Fluxo do Dark Mode
1. `ThemeProvider` do `next-themes` com `attribute="class"` e `defaultTheme="light"`
2. Toggle no perfil usa `useTheme()` do `next-themes`
3. As variaveis CSS `.dark` ja existem no `index.css` -- tudo muda automaticamente

### Fluxo do Card Espiritual na Home
1. Busca `profiles.care_day` do usuario
2. Busca ultima entrada de `user_journey` do usuario
3. Calcula: hoje e dia de cuidado? O dia ja passou? Quantos dias ativos esta semana?
4. Renderiza o card com a mensagem e barra de progresso adequadas

### Alteracao de Senha
Usa `supabase.auth.updateUser({ password: novaSenha })` -- funciona para usuario ja logado, nao precisa da senha antiga.

---

## Resultado Esperado

O usuario abre o perfil e ve um formulario limpo para editar nome, escolher sua religiao (Candomble, Umbanda, Ifa), definir seu dia de cuidado espiritual, trocar de senha e alternar entre tema claro/escuro. Na Home, ele ve um card personalizado que diz "Hoje e seu dia de cuidado! Consulte o Oraculo" ou "Faltam 3 dias para seu cuidado semanal", criando habito e engajamento.

