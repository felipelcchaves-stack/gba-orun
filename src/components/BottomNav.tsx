import { Link, useLocation } from "react-router-dom";
import { Home, Compass, BookOpen, Shield } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

const BottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useAdmin();

  const links = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/oraculo", icon: Compass, label: "Oráculo" },
    { to: "/rituais", icon: BookOpen, label: "Rituais" },
  ];

  if (isAdmin) {
    links.push({ to: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
