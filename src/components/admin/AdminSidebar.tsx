import { LayoutDashboard, Users, BookOpen, Settings, FileJson, LogOut, Link2, ArrowLeft, MessageCircle, CreditCard, Tag, UtensilsCrossed, Star, GitBranch, FolderOpen, ArrowUpDown, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export type AdminSection = "dashboard" | "users" | "plans" | "categories" | "rituals" | "offerings" | "flows" | "oracle_configs" | "ire_ibi" | "links" | "community" | "promotions" | "guidance" | "reviews" | "settings" | "import";

interface AdminSidebarProps {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onSignOut: () => void;
}

const NAV_ITEMS: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Usuários", icon: Users },
  { key: "plans", label: "Planos", icon: CreditCard },
  { key: "categories", label: "Categorias", icon: FolderOpen },
  { key: "rituals", label: "Rituais e Orações", icon: BookOpen },
  { key: "offerings", label: "Oferendas", icon: UtensilsCrossed },
  { key: "flows", label: "Fluxos do Oráculo", icon: GitBranch },
  { key: "oracle_configs", label: "Caídas do Obi", icon: Dices },
  { key: "ire_ibi", label: "Tipos Iré / Ibi", icon: ArrowUpDown },
  { key: "links", label: "Links de Ajuda", icon: Link2 },
  { key: "community", label: "Comunidade", icon: MessageCircle },
  { key: "promotions", label: "Promoções", icon: Tag },
  { key: "guidance", label: "Orientações", icon: MessageCircle },
  { key: "reviews", label: "Avaliações", icon: Star },
  { key: "settings", label: "Configurações", icon: Settings },
  { key: "import", label: "Importar", icon: FileJson },
];

const AdminSidebar = ({ active, onNavigate, onSignOut }: AdminSidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-display font-bold text-foreground">Painel Admin</h2>
        <p className="text-xs text-muted-foreground mt-1">Gestão do Gbá Orun</p>
        <button
          onClick={() => navigate("/")}
          className="mt-3 flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao App
        </button>
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
