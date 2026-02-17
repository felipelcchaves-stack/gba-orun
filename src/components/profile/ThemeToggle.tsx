import { useTheme } from "next-themes";
import { Sun, Moon, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-semibold">Aparência</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDark ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-accent" />}
          <Label className="cursor-pointer">{isDark ? "Modo Escuro" : "Modo Claro"}</Label>
        </div>
        <Switch checked={isDark} onCheckedChange={v => setTheme(v ? "dark" : "light")} />
      </div>
    </div>
  );
};

export default ThemeToggle;
