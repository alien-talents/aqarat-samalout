import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCurrentUser,
  getProfileByUser,
  saveProfile,
  uid,
} from "@/lib/store";
import {
  BUY_REASONS,
  PLATFORM_GOALS,
  PROPERTY_TYPES,
  SELL_REASONS,
  TIMELINES,
} from "@/lib/types";
import type {
  BuyReason,
  GeneralGoal,
  PlatformGoal,
  Profile,
  PropertyType,
  SellReason,
  Timeline,
} from "@/lib/types";
import { t, useLang } from "@/lib/i18n";
import { toast } from "sonner";

export default function ProfileSetup() {
  const lang = useLang();
  const nav = useNavigate();
  const user = getCurrentUser();

  // shared
  const [governorate, setGovernorate] = useState("Minya");
  const [city, setCity] = useState("Samalot");
  const [area, setArea] = useState("");
  const [generalGoal, setGeneralGoal] = useState<GeneralGoal>("buy");

  // individual
  const [sellReason, setSellReason] = useState<SellReason | "">("");
  const [buyReason, setBuyReason] = useState<BuyReason | "">("");
  const [shortTermGoal, setShortTermGoal] = useState("");
  const [longTermGoal, setLongTermGoal] = useState("");
  const [budgetEgp, setBudgetEgp] = useState<number | "">("");
  const [timeline, setTimeline] = useState<Timeline>("flexible");

  // company
  const [entityName, setEntityName] = useState("");
  const [platformGoal, setPlatformGoal] = useState<PlatformGoal>("reach_buyers");
  const [portfolioSize, setPortfolioSize] = useState<number | "">("");

  // preferences
  const [preferredTypes, setPreferredTypes] = useState<PropertyType[]>([]);
  const [preferredAreas, setPreferredAreas] = useState("");
  const [areaSqmMin, setAreaSqmMin] = useState<number | "">("");
  const [areaSqmMax, setAreaSqmMax] = useState<number | "">("");
  const [specialization, setSpecialization] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  useEffect(() => {
    if (!user) {
      nav("/login");
      return;
    }
    const p = getProfileByUser(user.id);
    if (p) {
      setGovernorate(p.governorate ?? "");
      setCity(p.city ?? "");
      setArea(p.area ?? "");
      setGeneralGoal(p.generalGoal ?? "buy");
      setSellReason(p.sellReason ?? "");
      setBuyReason(p.buyReason ?? "");
      setShortTermGoal(p.shortTermGoal ?? "");
      setLongTermGoal(p.longTermGoal ?? "");
      setBudgetEgp(p.budgetEgp ?? "");
      setTimeline(p.timeline ?? "flexible");
      setEntityName(p.entityName ?? "");
      setPlatformGoal(p.platformGoal ?? "reach_buyers");
      setPortfolioSize(p.portfolioSize ?? "");
      setPreferredTypes(p.preferredTypes ?? []);
      setPreferredAreas((p.preferredAreas ?? []).join(", "));
      setAreaSqmMin(p.areaSqmMin ?? "");
      setAreaSqmMax(p.areaSqmMax ?? "");
      setSpecialization(p.specialization ?? "");
      setExtraNotes(p.extraNotes ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const isCompany = user.accountType !== "individual";

  function togglePref(p: PropertyType) {
    setPreferredTypes((curr) =>
      curr.includes(p) ? curr.filter((x) => x !== p) : [...curr, p],
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const existing = getProfileByUser(user.id);
    const profile: Profile = {
      id: existing?.id ?? uid(),
      userId: user.id,
      governorate,
      city,
      area,
      generalGoal,
      sellReason: sellReason || undefined,
      buyReason: buyReason || undefined,
      shortTermGoal,
      longTermGoal,
      budgetEgp: budgetEgp === "" ? undefined : Number(budgetEgp),
      timeline,
      entityName: isCompany ? entityName : undefined,
      platformGoal: isCompany ? platformGoal : undefined,
      portfolioSize:
        isCompany && portfolioSize !== "" ? Number(portfolioSize) : undefined,
      preferredTypes,
      preferredAreas: preferredAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      areaSqmMin: areaSqmMin === "" ? undefined : Number(areaSqmMin),
      areaSqmMax: areaSqmMax === "" ? undefined : Number(areaSqmMax),
      specialization,
      extraNotes,
    };
    saveProfile(profile);
    toast.success(lang === "ar" ? "تم حفظ الملف" : "Profile saved");
    nav("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">
              {lang === "ar" ? "أكمل ملفك" : "Complete your profile"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {lang === "ar"
                ? "كل ما زادت التفاصيل، كل ما لقينالك مطابقة أحسن."
                : "The more we know, the better we match."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-8">
            {/* Shared */}
            <section className="surface-card p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">
                {lang === "ar" ? "بيانات أساسية" : "Basics"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المحافظة" : "Governorate"}</Label>
                  <Input value={governorate} onChange={(e) => setGovernorate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المدينة" : "City"}</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المنطقة" : "Area"}</Label>
                  <Input value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "هدفك العام" : "General goal"}</Label>
                <Select value={generalGoal} onValueChange={(v) => setGeneralGoal(v as GeneralGoal)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sell">{t("gg.sell", lang)}</SelectItem>
                    <SelectItem value="buy">{t("gg.buy", lang)}</SelectItem>
                    <SelectItem value="both">{t("gg.both", lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Individual fields */}
            {!isCompany && (
              <section className="surface-card p-6 space-y-4">
                <h2 className="font-display text-xl font-bold">
                  {lang === "ar" ? "تفاصيل شخصية" : "Personal details"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(generalGoal === "sell" || generalGoal === "both") && (
                    <div className="space-y-2">
                      <Label>{lang === "ar" ? "سبب البيع" : "Reason for selling"}</Label>
                      <Select value={sellReason} onValueChange={(v) => setSellReason(v as SellReason)}>
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {SELL_REASONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {t(`sr.${r}`, lang)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {(generalGoal === "buy" || generalGoal === "both") && (
                    <div className="space-y-2">
                      <Label>{lang === "ar" ? "سبب الشراء" : "Reason for buying"}</Label>
                      <Select value={buyReason} onValueChange={(v) => setBuyReason(v as BuyReason)}>
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUY_REASONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {t(`br.${r}`, lang)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "هدف قصير المدى" : "Short-term goal"}</Label>
                    <Input
                      value={shortTermGoal}
                      onChange={(e) => setShortTermGoal(e.target.value)}
                      placeholder={lang === "ar" ? "مثلاً: بيع خلال ٣ شهور" : "e.g. Sell within 3 months"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "هدف طويل المدى" : "Long-term goal"}</Label>
                    <Input
                      value={longTermGoal}
                      onChange={(e) => setLongTermGoal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {lang === "ar" ? "الميزانية (ج.م)" : "Budget (EGP)"}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={budgetEgp}
                      onChange={(e) =>
                        setBudgetEgp(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "الإطار الزمني" : "Timeline"}</Label>
                    <Select value={timeline} onValueChange={(v) => setTimeline(v as Timeline)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMELINES.map((tl) => (
                          <SelectItem key={tl} value={tl}>
                            {t(`tl.${tl}`, lang)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            )}

            {/* Company fields */}
            {isCompany && (
              <section className="surface-card p-6 space-y-4">
                <h2 className="font-display text-xl font-bold">
                  {lang === "ar" ? "بيانات الشركة / المكتب" : "Company / Office"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "اسم المكتب / الشركة" : "Office / Company name"}</Label>
                    <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "هدفك من المنصة" : "Platform goal"}</Label>
                    <Select value={platformGoal} onValueChange={(v) => setPlatformGoal(v as PlatformGoal)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_GOALS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {t(`pg.${p}`, lang)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "هدف قصير المدى" : "Short-term goal"}</Label>
                    <Input value={shortTermGoal} onChange={(e) => setShortTermGoal(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "هدف طويل المدى" : "Long-term goal"}</Label>
                    <Input value={longTermGoal} onChange={(e) => setLongTermGoal(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{lang === "ar" ? "حجم المحفظة" : "Portfolio size (units)"}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={portfolioSize}
                      onChange={(e) =>
                        setPortfolioSize(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Preferences */}
            <section className="surface-card p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">
                {lang === "ar" ? "التفضيلات" : "Preferences"}
              </h2>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "أنواع العقارات المفضلة" : "Preferred property types"}</Label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2 rounded-pill border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary"
                    >
                      <Checkbox
                        checked={preferredTypes.includes(p)}
                        onCheckedChange={() => togglePref(p)}
                      />
                      {t(`pt.${p}`, lang)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "ar" ? "المناطق المفضلة (مفصولة بفاصلة)" : "Preferred areas (comma-separated)"}
                </Label>
                <Input
                  value={preferredAreas}
                  onChange={(e) => setPreferredAreas(e.target.value)}
                  placeholder="Samalot — Downtown, Sheikh Fadl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "أقل مساحة (م²)" : "Min area (sqm)"}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={areaSqmMin}
                    onChange={(e) =>
                      setAreaSqmMin(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "أقصى مساحة (م²)" : "Max area (sqm)"}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={areaSqmMax}
                    onChange={(e) =>
                      setAreaSqmMax(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "تخصص (اختياري)" : "Specialization (optional)"}</Label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "ملاحظات إضافية" : "Additional notes"}</Label>
                <Textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </section>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => nav("/dashboard")}>
                {t("g.cancel", lang)}
              </Button>
              <Button type="submit" className="bg-gradient-gold text-primary-foreground">
                {t("g.save", lang)}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
