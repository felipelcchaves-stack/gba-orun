import { useState } from "react";
import { Check, ChevronsUpDown, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useOfferings, type Offering } from "@/hooks/useOfferings";

const CATEGORY_LABELS: Record<string, string> = {
  ebo: "Ebó",
  ibori: "Ibori",
  egbe_orun: "Egbe Orun",
  iyami: "Iyami",
  oracao_ori: "Oração ao Ori",
  geral: "Geral",
};

interface OfferingComboboxProps {
  value: string | null;
  onChange: (offeringId: string | null) => void;
  filterCategory?: string;
  placeholder?: string;
}

const OfferingCombobox = ({ value, onChange, filterCategory, placeholder = "Vincular oferenda..." }: OfferingComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: offerings } = useOfferings();

  const filtered = offerings?.filter(o => !filterCategory || o.category === filterCategory) ?? [];

  const grouped = filtered.reduce<Record<string, Offering[]>>((acc, o) => {
    const cat = o.category || "geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(o);
    return acc;
  }, {});

  const selected = offerings?.find(o => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-left transition-colors hover:bg-muted/50",
            !value && "text-muted-foreground"
          )}
        >
          <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="flex-1 truncate">
            {selected ? selected.title : placeholder}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 z-50" align="start">
        <Command>
          <CommandInput placeholder="Buscar oferenda..." />
          <CommandList>
            <CommandEmpty>Nenhuma oferenda encontrada.</CommandEmpty>
            {value && (
              <CommandGroup>
                <CommandItem
                  value="__clear__"
                  onSelect={() => { onChange(null); setOpen(false); }}
                  className="text-muted-foreground text-xs"
                >
                  ✕ Remover vínculo
                </CommandItem>
              </CommandGroup>
            )}
            {Object.entries(grouped).map(([cat, items]) => (
              <CommandGroup key={cat} heading={CATEGORY_LABELS[cat] || cat}>
                {items.map(o => (
                  <CommandItem
                    key={o.id}
                    value={o.title}
                    onSelect={() => { onChange(o.id); setOpen(false); }}
                    className="flex items-center gap-2"
                  >
                    <Check className={cn("h-3.5 w-3.5 shrink-0", value === o.id ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1 truncate">{o.title}</span>
                    {o.is_premium && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Premium</Badge>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default OfferingCombobox;
