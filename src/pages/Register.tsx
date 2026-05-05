import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerWithEmail } from "@/hooks/useAuth";
import type { AccountType } from "@/lib/types";
import { ACCOUNT_TYPES } from "@/lib/types";
import { t, useLang } from "@/lib/i18n";
import { toast } from "sonner";

export default function Register() {
  const lang = useLang();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await registerWithEmail(email.trim(), password, {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        account_type: accountType,
      });
      toast.success(lang === "ar" ? "تم إنشاء الحساب" : "Account created successfully");
      nav("/profile-setup");
    } catch (error: any) {
      toast.error(error.message || (lang === "ar" ? "حدث خطأ" : "An error occurred"));
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
              {t("nav.register", lang)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("brand.tagline", lang)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{lang === "ar" ? "الاسم الكامل" : "Full name"}</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "رقم واتساب" : "WhatsApp number"}</Label>
            <Input
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+201..."
            />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "البريد" : "Email"}</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "كلمة السر" : "Password"}</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "نوع الحساب" : "Account type"}</Label>
            <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {t(`at.${a}`, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-gold text-primary-foreground"
          >
            {isLoading 
              ? (lang === "ar" ? "جاري التسجيل..." : "Creating account...")
              : t("g.next", lang)}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {lang === "ar" ? "عندك حساب؟" : "Have an account?"}{" "}
            <Link to="/login" className="text-primary font-medium">
              {t("nav.login", lang)}
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
