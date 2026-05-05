import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, User as UserIcon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getCurrentUser, getMyNotifications, setSession } from "@/lib/store";
import type { User } from "@/lib/types";
import { setLang, t, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const lang = useLang();
  const loc = useLocation();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const u = getCurrentUser();
      setUser(u);
      setUnread(u ? getMyNotifications(u.id).filter((n) => !n.isRead).length : 0);
    };
    refresh();
    const events = [
      "samalot:session-changed",
      "samalot:notifications-changed",
      "samalot:users-changed",
    ];
    events.forEach((e) => window.addEventListener(e, refresh));
    return () => events.forEach((e) => window.removeEventListener(e, refresh));
  }, []);

  const navItems = [
    { to: "/", label: t("nav.marketplace", lang) },
    { to: "/pricing", label: t("nav.pricing", lang) },
    ...(user ? [{ to: "/dashboard", label: t("nav.dashboard", lang) }] : []),
    ...(user?.isAdmin ? [{ to: "/admin", label: t("nav.admin", lang) }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-gradient-gold flex items-center justify-center font-display font-bold text-primary-foreground">
            S
          </div>
          <span className="font-display font-bold hidden sm:inline">
            {t("brand.name", lang)}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors",
                loc.pathname === it.to && "bg-secondary text-primary",
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4 me-1" />
            {lang === "en" ? "ع" : "EN"}
          </Button>

          {user ? (
            <>
              <Link to="/dashboard?tab=notifications" className="relative">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                {unread > 0 && (
                  <span className="absolute top-1 end-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => nav("/dashboard")}>
                    {t("nav.dashboard", lang)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/listings/new")}>
                    {t("nav.create_listing", lang)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/pricing")}>
                    {t("nav.pricing", lang)}
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem onClick={() => nav("/admin")}>
                      {t("nav.admin", lang)}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSession(null);
                      nav("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 me-2" />
                    {t("nav.logout", lang)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav("/login")}>
                {t("nav.login", lang)}
              </Button>
              <Button
                size="sm"
                className="bg-gradient-gold text-primary-foreground hover:opacity-90"
                onClick={() => nav("/register")}
              >
                {t("nav.register", lang)}
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navItems.map((it) => (
                <DropdownMenuItem key={it.to} onClick={() => nav(it.to)}>
                  {it.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
