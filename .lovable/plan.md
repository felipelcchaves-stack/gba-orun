

# Corrigir: Admin nao consegue salvar "Cortesia"

## Problema encontrado

A coluna `is_courtesy` existe no banco e o codigo frontend esta correto, mas o campo nunca e salvo porque a tabela `profiles` **nao tem politica RLS permitindo que admins facam UPDATE**. A unica politica de UPDATE exige `auth.uid() = user_id`, entao quando o admin tenta atualizar o perfil de outro usuario, a operacao falha silenciosamente.

Confirmacao: os dois usuarios ativos no banco estao com `is_courtesy = false` mesmo apos tentativa de edicao.

## Solucao

Adicionar uma politica RLS na tabela `profiles` permitindo que admins facao UPDATE em qualquer perfil.

## Alteracoes

### 1. Migracao SQL
Criar uma nova politica RLS na tabela `profiles`:

```text
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
```

Isso permitira que o admin salve `is_courtesy`, `subscription_status` e qualquer outro campo ao editar usuarios no painel.

### 2. Notificar PostgREST
Executar `NOTIFY pgrst, 'reload schema'` para garantir que o cache seja atualizado.

## Resumo

- 1 migracao SQL (1 politica RLS)
- 0 arquivos de codigo alterados (o frontend ja esta correto)
