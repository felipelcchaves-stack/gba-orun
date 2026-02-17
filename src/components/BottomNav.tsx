import { Link, useLocation } from "react-router-dom";
import { Home, Compass, BookOpen, Map, User, Shield, GraduationCap } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

const BottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useAdmin();

  const links = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/oraculo", icon: Compass, label: "Oráculo" },
    { to: "/jornada", icon: Map, label: "Jornada" },
    { to: "/aprender", icon: GraduationCap, label: "Aprender" },
    { to: "/perfil", icon: User, label: "Perfil" },
  ];

  if (isAdmin) {
    links.push({ to: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50">
      <div className="flex items-center justify-around px-1 py-2.5 max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-foreground mt-[-2px]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
