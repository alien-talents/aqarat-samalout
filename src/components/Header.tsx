import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Building2, Home, Plus, ShieldCheck, User, Moon, Sun } from "lucide-react";
import { getProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("samalot.theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("samalot.theme", theme);
  }, [theme]);

  useEffect(() => {
    const update = () => setHasProfile(!!getProfile());
    update();
    window.addEventListener("samalot:profile-changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("samalot:profile-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const links = [
    { to: "/", label: "الإعلانات", icon: Home },
    { to: "/post", label: "أضف إعلان", icon: Plus },
    { to: "/admin", label: "الإدارة", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold gradient-text">عقارات سمالوط</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">سوق العقارات المحلي</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="تبديل الوضع"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => navigate(hasProfile ? "/profile" : "/onboarding")}
            className="flex items-center gap-2 rounded-pill bg-gradient-gold px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{hasProfile ? "حسابي" : "ابدأ"}</span>
          </button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden border-t border-border">
        <div className="container flex items-center justify-around">
          {links.map((l) => {
            const active = location.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
