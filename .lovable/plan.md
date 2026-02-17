
# Corrigir banner do modal e avatar do orientador

## Problema 1: Modal sem banner

O ritual "Iba" (e provavelmente outros) tem `image_url: null` no banco de dados. O codigo atual so renderiza o banner quando `ritual.image_url` existe. Quando nao existe, mostra apenas o titulo simples sem nenhum visual.

**Solucao:** Usar `getCategoryImage(ritual.category)` como imagem de fallback. Assim, mesmo sem imagem propria, o modal sempre tera um banner baseado na categoria do ritual (Ebó, Ibori, Orikis, Geral, etc.).

## Problema 2: Avatar do orientador

O componente `InlineGuidance` busca `settings?.guidance_avatar_url` da tabela `app_settings`, mas essa chave nao existe no banco. Resultado: mostra o emoji 🧙 em vez de uma foto.

**Solucao:** Inserir a chave `guidance_avatar_url` na tabela `app_settings` (valor vazio por padrao). O admin pode configurar a URL da imagem do orientador no painel. Enquanto isso, o fallback emoji continua funcionando.

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/oracle/FlowStepRenderer.tsx` | No `LinkedRitualButton`, importar `getCategoryImage` e usar como fallback: `const imageUrl = ritual.image_url \|\| getCategoryImage(ritual.category)`. Remover a condicional `ritual.image_url &&` do banner, mostrando-o sempre. |
| `src/components/RitualHelpButton.tsx` | Mesmo ajuste: importar `getCategoryImage`, definir `imageUrl` com fallback, e mostrar o banner sempre. |
| Migracao SQL | Inserir `guidance_avatar_url` na tabela `app_settings` para que o admin possa configurar. |

## Detalhe tecnico

**Fallback de imagem nos modais (ambos componentes):**

```tsx
import { getCategoryImage } from "@/lib/categories";

// Dentro do componente:
const imageUrl = ritual.image_url || getCategoryImage(ritual.category);

// No JSX - remover a condicional, sempre mostrar o banner:
<div className="relative w-full h-36 sm:h-44 rounded-t-2xl overflow-hidden">
  <img src={imageUrl} alt={ritual.title} className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
  <div className="absolute bottom-3 left-4 right-4">
    <h2 className="text-white font-display font-bold text-lg leading-tight">{ritual.title}</h2>
    <span className="text-white/70 text-xs capitalize">{ritual.category}</span>
  </div>
</div>

// Remover o bloco de fallback que mostra DialogHeader sem imagem
```

**Migracao SQL para avatar do orientador:**

```sql
INSERT INTO app_settings (key, value)
VALUES ('guidance_avatar_url', '')
ON CONFLICT (key) DO NOTHING;
```

Depois de implementar, o admin pode acessar as configuracoes do app e colar a URL de uma foto para o avatar do orientador. Enquanto nao configurar, o emoji 🧙 continua aparecendo normalmente.
