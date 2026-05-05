import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User as UserIcon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, logout } from "@/hooks/useAuth";
import { setLang, t, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { PWABadge } from "./PWAInstallPrompt";
import { toast } from "sonner";

export function Header() {
  const lang = useLang();
  const loc = useLocation();
  const nav = useNavigate();
  const { user, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(lang === "ar" ? "تم تسجيل الخروج" : "Logged out successfully");
      nav("/");
    } catch (error) {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

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
              <NotificationBell userId={user.id} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PWABadge />
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
                  <DropdownMenuItem onClick={handleLogout}>
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
