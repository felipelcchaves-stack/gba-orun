import { LayoutDashboard, Users, BookOpen, Sparkles, Settings, FileJson, LogOut, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSection = "dashboard" | "users" | "rituals" | "oracle" | "links" | "settings" | "import";

interface AdminSidebarProps {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onSignOut: () => void;
}

const NAV_ITEMS: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Usuários", icon: Users },
  { key: "rituals", label: "Rituais", icon: BookOpen },
  { key: "oracle", label: "Oráculo", icon: Sparkles },
  { key: "links", label: "Links de Ajuda", icon: Link2 },
  { key: "settings", label: "Configurações", icon: Settings },
  { key: "import", label: "Importar", icon: FileJson },
];

const AdminSidebar = ({ active, onNavigate, onSignOut }: AdminSidebarProps) => {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-display font-bold text-foreground">Painel Admin</h2>
        <p className="text-xs text-muted-foreground mt-1">Gestão do Gbá Orun</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active === key
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
