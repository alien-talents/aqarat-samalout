import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserByEmail, setSession, verifyPassword } from "@/lib/store";
import { t, useLang } from "@/lib/i18n";
import { toast } from "sonner";

export default function Login() {
  const lang = useLang();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const u = getUserByEmail(email.trim());
    if (!u || !verifyPassword(u.passwordHash, password)) {
      toast.error(lang === "ar" ? "بريد أو كلمة سر غلط" : "Invalid email or password");
      return;
    }
    setSession(u.id);
    const next = params.get("next") || "/dashboard";
    nav(next);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <form
          onSubmit={submit}
          className="surface-elevated w-full max-w-md p-8 space-y-5"
        >
          <div className="space-y-1 text-center">
            <h1 className="font-display text-2xl font-bold">
              {t("nav.login", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "أهلاً تاني" : "Welcome back"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "البريد" : "Email"}</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "كلمة السر" : "Password"}</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo1234"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-gold text-primary-foreground"
          >
            {t("nav.login", lang)}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {lang === "ar" ? "ما عندكش حساب؟" : "No account?"}{" "}
            <Link to="/register" className="text-primary font-medium">
              {t("nav.register", lang)}
            </Link>
          </div>
          <div className="rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1">
            <div className="font-medium">
              {lang === "ar" ? "حسابات تجريبية (كلمة السر: demo1234):" : "Demo accounts (password: demo1234):"}
            </div>
            <div>admin@samalot.app · ahmed@example.com · nile@example.com · hoda@example.com</div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
