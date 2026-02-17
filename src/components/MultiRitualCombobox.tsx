import { useState } from "react";
import { X, Check, ChevronsUpDown, BookOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useRituals, type Ritual } from "@/hooks/useRituals";
import { getCategoryLabel } from "@/lib/categories";

interface MultiRitualComboboxProps {
  value: string[];
  onChange: (ritualIds: string[]) => void;
  filterCategory?: string;
  placeholder?: string;
}

const MultiRitualCombobox = ({ value, onChange, filterCategory, placeholder = "Adicionar ritual..." }: MultiRitualComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: rituals } = useRituals();

  const filtered = rituals?.filter(r => !filterCategory || r.category === filterCategory) ?? [];

  // Group by category (excluding already selected)
  const available = filtered.filter(r => !value.includes(r.id));
  const grouped = available.reduce<Record<string, Ritual[]>>((acc, r) => {
    const cat = r.category || "geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const selectedRituals = value.map(id => rituals?.find(r => r.id === id)).filter(Boolean) as Ritual[];

  const addRitual = (id: string) => {
    onChange([...value, id]);
    setOpen(false);
  };

  const removeRitual = (id: string) => {
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className="space-y-1.5">
      {/* Selected chips */}
      {selectedRituals.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedRituals.map(r => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium"
            >
              <BookOpen className="h-3 w-3" />
              <span className="truncate max-w-[140px]">{r.title}</span>
              <button
                type="button"
                onClick={() => removeRitual(r.id)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add button / combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors w-full"
          >
            <Plus className="h-3 w-3" />
            <span>{placeholder}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 z-50" align="start">
          <Command>
            <CommandInput placeholder="Buscar ritual..." />
            <CommandList>
              <CommandEmpty>Nenhum ritual encontrado.</CommandEmpty>
              {Object.entries(grouped).map(([cat, items]) => (
                <CommandGroup key={cat} heading={getCategoryLabel(cat)}>
                  {items.map(r => (
                    <CommandItem
                      key={r.id}
                      value={r.title}
                      onSelect={() => addRitual(r.id)}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-60" />
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
    </div>
  );
};

export default MultiRitualCombobox;
