import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithEmail } from "@/hooks/useAuth";
import { t, useLang } from "@/lib/i18n";
import { toast } from "sonner";

export default function Login() {
  const lang = useLang();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await loginWithEmail(email.trim(), password);
      toast.success(lang === "ar" ? "تم تسجيل الدخول" : "Logged in successfully");
      const next = params.get("next") || "/dashboard";
      nav(next);
    } catch (error: any) {
      toast.error(lang === "ar" ? "بريد أو كلمة سر غلط" : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
            className="w-full bg-gradient-gold text-primary-foreground"
          >
            {isLoading 
              ? (lang === "ar" ? "جاري الدخول..." : "Logging in...")
              : t("nav.login", lang)}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {lang === "ar" ? "ما عندكش حساب؟" : "No account?"}{" "}
            <Link to="/register" className="text-primary font-medium">
              {t("nav.register", lang)}
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
