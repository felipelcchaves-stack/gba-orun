

# Plano: Combobox para Vincular Rituais/Rezas as Tarefas da Jornada

## Resumo

Adicionar um **combobox de busca** (searchable dropdown) em dois locais estrategicos:

1. **Tela de Diagnostico (StepDiagnosis)**: Depois que o fluxo do oraculo gera as tarefas, o usuario (ou voce como admin) pode clicar em cada tarefa e vincular um ritual/reza especifico antes de iniciar a jornada.

2. **Formulario de Ritual no Admin (AdminRitualForm)**: Ao cadastrar ou editar um ritual, voce pode indicar para quais **tipos de tarefa** aquele ritual serve (ex: "Este ritual e uma Oracao de Ori" ou "Este e um Ebo de Limpeza"), facilitando a vinculacao automatica.

---

## O Que Vai Mudar

### 1. Combobox nas Tarefas do Diagnostico

Na tela final do oraculo (StepDiagnosis), cada tarefa listada tera:
- Um **botao/icone** de link ao lado
- Ao clicar, abre um **combobox com busca** mostrando todos os rituais cadastrados, filtrados pela categoria da tarefa
- O usuario seleciona o ritual desejado e ele fica vinculado aquela tarefa
- Quando salvar a jornada, o `ritual_id` ja vai junto

Isso permite que voce (como lider espiritual) escolha exatamente qual reza ou ritual a pessoa deve fazer para cada tarefa.

### 2. Campo de Tipo de Tarefa no Admin

No formulario de criacao/edicao de rituais (`AdminRitualForm`), adicionar:
- Um campo **"Tipos de Tarefa Associados"** com multi-select (chips)
- Opcoes: Ebo, Ibori, Oracao de Ori, Oracao de Iyami, Cantiga, Egbe Orun, Oracao da Manha, Oracao da Noite, Oriki
- Isso sera salvo no campo `trigger_oracle` (ou em um novo campo `task_types`) para que o sistema saiba sugerir automaticamente esse ritual quando a tarefa correspondente aparecer

### 3. Sugestao Automatica Inteligente

Quando o oraculo gerar as tarefas, o sistema vai:
1. Buscar rituais que tenham a mesma `category` da tarefa
2. Pre-selecionar o ritual mais relevante no combobox
3. Permitir que o usuario troque se quiser

---

## Detalhes Tecnicos

### Componente: `RitualCombobox`

Novo componente reutilizavel usando os componentes `Popover` + `Command` (cmdk) ja existentes no projeto:

```text
+------------------------------------------+
| [icone busca] Buscar ritual...           |
+------------------------------------------+
| Ebo                                      |
|   - Ebo de Limpeza Espiritual           |
|   - Ebo de Prosperidade                  |
| Ibori                                    |
|   - Ibori de Protecao do Ori            |
| Oracoes                                  |
|   - Oracao da Manha - Oduduwa           |
+------------------------------------------+
```

- Agrupado por categoria
- Filtravel por texto
- Mostra badge "Premium" quando aplicavel
- Pode receber prop `filterCategory` para mostrar so rituais de uma categoria

### Arquivos a Criar

| Arquivo | Descricao |
|---|---|
| `src/components/RitualCombobox.tsx` | Combobox reutilizavel com busca para selecionar rituais |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/oracle/StepDiagnosis.tsx` | Adicionar estado local para `ritual_id` por tarefa + RitualCombobox em cada item da lista |
| `src/components/admin/AdminRitualForm.tsx` | Adicionar campo multi-select de "Tipos de Tarefa Associados" usando chips |
| `src/components/journey/JourneyEntryCard.tsx` | Adicionar botao para trocar ritual vinculado em tarefas ja salvas (opcional, segunda fase) |

### Mudancas no StepDiagnosis

O componente vai manter um estado local:

```text
taskOverrides: Map<number, string | null>  // indice da tarefa -> ritual_id escolhido
```

Cada tarefa na lista tera o combobox ao lado. Ao salvar, o `ritual_id` do override sera usado no lugar da busca automatica atual.

### Mudancas no AdminRitualForm

Adicionar um campo com checkboxes ou chips para marcar quais `task_type` esse ritual atende. Isso sera salvo como texto separado por virgula no campo `trigger_oracle` (reaproveitando o campo existente) com prefixo `task:`, por exemplo: `task:ebo,task:ibori`.

Alternativamente, podemos usar a `category` ja existente que ja faz esse match naturalmente -- nesse caso, basta garantir que o admin escolha a categoria correta e o sistema ja vincula automaticamente.

### Fluxo Completo

```text
1. Admin cadastra ritual "Oracao do Ori para Fortalecimento"
   -> Categoria: "oracao_ori"

2. Usuario faz consulta ao oraculo
   -> Resultado: Ori precisa de cuidado
   -> Tarefa gerada: "Oracao de Ori" (category: oracao_ori)

3. Na tela de diagnostico:
   -> Tarefa "Oracao de Ori" aparece com combobox
   -> Combobox pre-seleciona "Oracao do Ori para Fortalecimento" (match por category)
   -> Usuario pode trocar para outro ritual se quiser

4. Ao clicar "Iniciar Rotina":
   -> Tarefa salva com ritual_id vinculado
   -> Na Jornada, usuario clica na tarefa -> abre o ritual para leitura
```

---

## Resultado Esperado

Na tela de diagnostico do oraculo, cada tarefa tera um combobox que permite vincular um ritual/reza especifico. O sistema sugere automaticamente com base na categoria, mas o usuario pode trocar. No admin, ao cadastrar rituais, a categoria ja define para quais tarefas ele sera sugerido. Isso permite que o lider espiritual pre-configure os rituais e o usuario tenha autonomia para escolher suas proprias rezas.

