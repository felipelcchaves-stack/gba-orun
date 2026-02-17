import { useState } from "react";
import { Check, ChevronsUpDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useRituals, type Ritual } from "@/hooks/useRituals";
import { getCategoryLabel, ALL_CATEGORY_KEYS } from "@/lib/categories";

interface RitualComboboxProps {
  value: string | null;
  onChange: (ritualId: string | null) => void;
  filterCategory?: string;
  placeholder?: string;
}

const RitualCombobox = ({ value, onChange, filterCategory, placeholder = "Vincular ritual..." }: RitualComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: rituals } = useRituals();

  const filtered = rituals?.filter(r => !filterCategory || r.category === filterCategory) ?? [];

  // Group by category
  const grouped = filtered.reduce<Record<string, Ritual[]>>((acc, r) => {
    const cat = r.category || "geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const selected = rituals?.find(r => r.id === value);

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
          <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="flex-1 truncate">
            {selected ? selected.title : placeholder}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 z-50" align="start">
        <Command>
          <CommandInput placeholder="Buscar ritual..." />
          <CommandList>
            <CommandEmpty>Nenhum ritual encontrado.</CommandEmpty>
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
              <CommandGroup key={cat} heading={getCategoryLabel(cat)}>
                {items.map(r => (
                  <CommandItem
                    key={r.id}
                    value={r.title}
                    onSelect={() => { onChange(r.id); setOpen(false); }}
                    className="flex items-center gap-2"
                  >
                    <Check className={cn("h-3.5 w-3.5 shrink-0", value === r.id ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1 truncate">{r.title}</span>
                    {r.is_premium && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Premium</Badge>}
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

export default RitualCombobox;
