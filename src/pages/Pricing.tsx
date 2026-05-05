import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  getActiveSub,
  getCurrentUser,
  nowISO,
  saveSub,
  uid,
} from "@/lib/store";
import {
  SELLER_LISTING_FEE_EGP,
  SUBSCRIPTION_PLANS,
} from "@/lib/types";
import type { SubscriptionPlan } from "@/lib/types";
import { t, useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const lang = useLang();
  const nav = useNavigate();
  const me = getCurrentUser();
  const current = me ? getActiveSub(me.id)?.plan ?? "free" : "free";

  function subscribe(plan: SubscriptionPlan) {
    if (!me) {
      nav(`/login?next=/pricing`);
      return;
    }
    const def = SUBSCRIPTION_PLANS.find((p) => p.plan === plan)!;
    const expires = new Date();
    expires.setDate(expires.getDate() + def.durationDays);
    saveSub({
      id: uid(),
      userId: me.id,
      plan,
      startedAt: nowISO(),
      expiresAt: expires.toISOString(),
      isActive: true,
      paymentRef: `MOCK-${Math.floor(Math.random() * 100000)}`,
      amountEgp: def.priceEgp,
    });
    toast.success(
      lang === "ar"
        ? `تم الاشتراك في خطة ${t(`pr.plan.${plan}`, lang)}`
        : `Subscribed to ${t(`pr.plan.${plan}`, lang)} plan`,
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold">{t("pr.title", lang)}</h1>
          <p className="text-muted-foreground mt-3">{t("pr.subtitle", lang)}</p>
          <p className="text-xs text-muted-foreground mt-2 italic">{t("pr.mock_pay", lang)}</p>
        </div>

        {/* Buyer plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((p) => {
            const isCurrent = current === p.plan;
            const isPremium = p.plan === "premium";
            return (
              <div
                key={p.plan}
                className={cn(
                  "surface-card p-6 flex flex-col",
                  isPremium && "border-2 border-primary shadow-elevated",
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold">
                    {t(`pr.plan.${p.plan}`, lang)}
                  </h3>
                  {isPremium && (
                    <span className="rounded-pill bg-gradient-gold text-primary-foreground px-2.5 py-1 text-xs font-medium inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {lang === "ar" ? "موصى بيها" : "Recommended"}
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="font-display text-3xl font-bold">
                    {p.priceEgp === 0 ? "0" : p.priceEgp}
                  </span>
                  <span className="text-muted-foreground ms-1 text-sm">
                    {t("g.egp", lang)}
                    {p.priceEgp > 0 && (lang === "ar" ? " / شهر" : " / mo")}
                  </span>
                </div>
                <ul className="space-y-2 text-sm flex-1">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {t("pr.feat.free", lang)}
                  </li>
                  {p.plan !== "free" && (
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {t("pr.feat.basic", lang)}
                    </li>
                  )}
                  {p.plan === "premium" && (
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {t("pr.feat.premium", lang)}
                    </li>
                  )}
                </ul>
                <Button
                  className={cn(
                    "mt-5 w-full",
                    isPremium && "bg-gradient-gold text-primary-foreground",
                  )}
                  variant={isPremium ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => subscribe(p.plan)}
                >
                  {isCurrent ? t("pr.current", lang) : t("pr.subscribe", lang)}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Seller fee */}
        <div className="max-w-3xl mx-auto mt-10 surface-card p-6">
          <h3 className="font-display text-xl font-bold mb-2">
            {t("pr.seller_fee", lang)}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t("pr.seller_fee_desc", lang)}
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-display text-2xl font-bold">
              {SELLER_LISTING_FEE_EGP}
            </span>
            <span className="text-muted-foreground text-sm">
              {t("g.egp", lang)} {lang === "ar" ? "/ إعلان" : "/ listing"}
            </span>
          </div>
          <Button variant="outline" onClick={() => nav("/listings/new")}>
            {t("nav.create_listing", lang)}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
