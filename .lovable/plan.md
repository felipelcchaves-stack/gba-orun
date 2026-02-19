

# Corrigir: Toggle de Cortesia nao persiste

## Problema encontrado

A politica de UPDATE para admins esta correta, mas a tabela `profiles` nao possui uma politica de **SELECT** para admins. A unica politica SELECT e `"Profiles viewable by owner"` (`auth.uid() = user_id`).

Quando o admin envia um PATCH para atualizar o perfil de outro usuario, o PostgREST precisa primeiro localizar (SELECT) a linha para aplica-la ao UPDATE. Como o admin nao consegue "ver" a linha de outro usuario via SELECT direto, o UPDATE retorna 204 mas com 0 linhas afetadas -- o famoso "falha silenciosa".

Confirmacao: O banco mostra `is_courtesy = false` para todos os usuarios, mesmo apos multiplas tentativas de salvamento que retornaram 204.

## Solucao

Adicionar uma politica RLS de **SELECT** na tabela `profiles` permitindo que admins leiam qualquer perfil.

## Alteracoes

### 1. Migracao SQL

```text
CREATE POLICY "Admins can view any profile"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

NOTIFY pgrst, 'reload schema';
```

### 2. Nenhum codigo frontend alterado

O frontend ja esta correto. Uma vez que o admin consiga fazer SELECT em qualquer perfil, o PATCH (que ja possui politica UPDATE valida) passara a funcionar corretamente.

## Resumo

- 1 migracao SQL (1 politica RLS de SELECT)
- 0 arquivos de codigo alterados

