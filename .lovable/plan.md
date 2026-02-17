

# Plano: Pular pergunta "Ire ou Ibi?" quando o Obi ja determinou

## Problema

Quando o usuario seleciona um resultado do Obi (ex: Oyekun = Ibi, Ejife = Ire), o sistema ja sabe se veio em Ire ou Ibi atraves do campo `default_ire_ibi` de cada resultado. Porem, o Step 3 (StepIreIbi) sempre comeca perguntando "Veio em Ire ou Ibi?" com dois botoes grandes, forcando o usuario a repetir uma informacao que o sistema ja tem.

## Solucao

Passar o `default_ire_ibi` do resultado do Obi como prop para o `StepIreIbi`. O componente inicializa `selectedCategory` com esse valor, pulando direto para a tela de selecao do subtipo (ex: "Que tipo de Ibi?").

O usuario ainda pode voltar e trocar de Ire para Ibi se quiser (botao Voltar), mas o fluxo padrao ja vai direto pro subtipo correto.

## Alteracoes

### Arquivo 1: `src/pages/Oracle.tsx`

- No Step 2 (StepObiResult), ao receber o resultado, buscar o `default_ire_ibi` correspondente e salvar no estado
- Passar o `defaultCategory` como prop para StepIreIbi no Step 3

### Arquivo 2: `src/components/oracle/StepIreIbi.tsx`

- Adicionar prop `defaultCategory?: "ire" | "ibi"` na interface
- Inicializar `selectedCategory` com `defaultCategory` ao inves de `null`
- Assim, se vier "ibi" do Obi, o componente ja abre direto na lista de subtipos de Ibi

## Detalhes Tecnicos

```text
// Oracle.tsx - Step 2: salvar default_ire_ibi junto com o resultado
{step === 2 && (
  <StepObiResult onSelect={(key) => {
    // Buscar o default_ire_ibi do resultado selecionado
    const config = dbConfigs?.find(c => c.result_key === key);
    const fallback = OBI_RESULTS_FALLBACK.find(r => r.key === key);
    const defaultIreIbi = config?.default_ire_ibi || fallback?.default_ire_ibi || "ibi";
    setState(s => ({ ...s, result: key, defaultIreIbi }));
    setStep(3);
  }} />
)}

// Oracle.tsx - Step 3: passar defaultCategory
{step === 3 && (
  <StepIreIbi
    obiResult={state.result!}
    defaultCategory={state.defaultIreIbi as "ire" | "ibi"}
    onSelect={...}
  />
)}

// StepIreIbi.tsx - usar defaultCategory como valor inicial
interface Props {
  obiResult: string;
  defaultCategory?: "ire" | "ibi";
  onSelect: (category: "ire" | "ibi", typeId: string, typeName: string) => void;
}

const StepIreIbi = ({ obiResult, defaultCategory, onSelect }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<"ire" | "ibi" | null>(
    defaultCategory || null
  );
  // ...resto igual
};
```

## Resultado

- Oyekun (default: ibi) -> pula direto pra "Que tipo de Ibi?"
- Ejife (default: ire) -> pula direto pra "Que tipo de Ire?"
- Usuario pode voltar e trocar se o Olu errou a natureza
