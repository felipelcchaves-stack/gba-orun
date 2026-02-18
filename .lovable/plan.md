
# Melhorar UX da Pagina de Login (Mobile-First)

## O que muda

### 1. Remover toda logica de registro
- Remover o tipo `"signup"` do `AuthMode` (fica so `"login" | "forgot"`)
- Remover estado `name` e import de `signUp`, `trackLead`
- Remover o bloco "Nao tem conta? Registre-se" (linhas 127-133)
- Remover o bloco "Ja tem conta? Entrar" (linhas 134-140)
- Remover o input de nome (linhas 70-78)
- Remover o branch de signup do `handleSubmit` (linhas 38-44)
- Simplificar os dicionarios `titles` e `subtitles` (remover entrada "signup")

### 2. Mascote Agemo e saudacao
- Adicionar emoji de camaleao acima do titulo com saudacao: "Axe! Bem-vindo de volta."
- Visual leve e acolhedor, alinhado ao conceito "Duolingo Espiritual"

### 3. Inputs maiores com icones
- Adicionar icone `Mail` dentro do campo de email e `Lock` dentro do campo de senha
- Aumentar padding dos inputs de `py-3` para `py-4` (alvo de toque minimo 48px)
- Adicionar toggle de visibilidade da senha com icone `Eye` / `EyeOff`
- Novo estado `showPassword` para controlar tipo do input (text/password)

### 4. Botao "gordinho" (Soft UI)
- Aumentar padding do botao para `py-4`
- Bordas mais arredondadas: `rounded-2xl`
- Efeito de pressionar: `active:scale-[0.98] transition-transform`
- Sombra suave

### 5. Layout mobile otimizado
- Botao "Voltar" vira icone-only no canto superior esquerdo (posicao absoluta)
- Safe-area padding para dispositivos com notch: `pb-[env(safe-area-inset-bottom)]`
- Animacao `animate-fade-in` nos elementos do formulario

### 6. Rodape simplificado
- No modo "login": so mostra "Esqueci minha senha"
- No modo "forgot": so mostra "Voltar ao login"
- Sem nenhuma mencao a registro

---

## Detalhes tecnicos

**Arquivo unico:** `src/pages/Auth.tsx`

- `AuthMode` passa de `"login" | "signup" | "forgot"` para `"login" | "forgot"`
- Remover imports: `signUp` do useAuth, `trackLead`
- Remover estado: `name`
- Adicionar imports: `Mail`, `Lock`, `Eye`, `EyeOff` do lucide-react
- Adicionar estado: `showPassword` (boolean)
- Inputs com wrapper `div relative` para posicionar icones internos
- Botao Voltar: `Link` com classe `absolute top-6 left-5` renderizando so o icone `ArrowLeft`
