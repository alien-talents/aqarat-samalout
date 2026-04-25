import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AREAS,
  INTENT_LABELS,
  LIFESTYLE_TAGS,
  PROPERTY_TYPE_LABELS,
  REASON_LABELS,
  TIMELINE_LABELS,
  type Intent,
  type PropertyType,
  type Reason,
  type SeekerProfile,
  type Timeline,
} from "@/lib/types";
import { saveProfile, uid, nowISO } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = ["النية", "السبب", "المنطقة", "نوع العقار", "الميزانية", "نمط الحياة", "بياناتك"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<SeekerProfile>>({
    intent: undefined,
    reason: undefined,
    locations: [],
    propertyTypes: [],
    areaPref: "",
    roomsPref: "",
    budgetMax: 500000,
    timeline: undefined,
    lifestyleTags: [],
    locationNotes: "",
    extraNotes: "",
    name: "",
    phone: "",
  });

  const update = <K extends keyof SeekerProfile>(k: K, v: SeekerProfile[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleArr = <T,>(arr: T[] | undefined, v: T): T[] => {
    const a = arr || [];
    return a.includes(v) ? a.filter((x) => x !== v) : [...a, v];
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!data.intent;
      case 1: return !!data.reason;
      case 2: return (data.locations?.length || 0) > 0;
      case 3: return (data.propertyTypes?.length || 0) > 0 && !!data.areaPref;
      case 4: return !!data.budgetMax && !!data.timeline;
      case 5: return true;
      case 6: return !!data.name && !!data.phone && data.phone.length >= 10;
    }
  };

  const finish = () => {
    const profile: SeekerProfile = {
      id: uid(),
      createdAt: nowISO(),
      name: data.name!,
      phone: data.phone!,
      intent: data.intent!,
      reason: data.reason!,
      locations: data.locations || [],
      propertyTypes: data.propertyTypes || [],
      areaPref: data.areaPref || "",
      roomsPref: data.roomsPref || "",
      budgetMax: data.budgetMax || 0,
      timeline: data.timeline!,
      lifestyleTags: data.lifestyleTags || [],
      locationNotes: data.locationNotes || "",
      extraNotes: data.extraNotes || "",
      isNotified: true,
    };
    saveProfile(profile);
    toast.success("تم إنشاء حسابك بنجاح", { description: "هنبعتلك إشعار لما يجي عرض يناسبك" });
    navigate("/profile");
  };

  return (
    <div className="container max-w-2xl py-8 md:py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>الخطوة <span className="ltr-num">{step + 1}</span> من <span className="ltr-num">{STEPS.length}</span></span>
          <span className="font-medium text-foreground">{STEPS[step]}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-gold transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="surface-card p-6 md:p-8 min-h-[400px]">
        {step === 0 && (
          <Step title="بتدور على إيه؟" subtitle="اختار اللي بيعبر عنك دلوقتي">
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(INTENT_LABELS) as Intent[]).map((k) => (
                <ChoiceCard
                  key={k}
                  selected={data.intent === k}
                  onClick={() => update("intent", k)}
                  label={INTENT_LABELS[k]}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="ليه؟" subtitle="إيه السبب اللي بيخليك تدور على عقار؟">
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.keys(REASON_LABELS) as Reason[]).map((k) => (
                <ChoiceCard
                  key={k}
                  selected={data.reason === k}
                  onClick={() => update("reason", k)}
                  label={REASON_LABELS[k]}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="المنطقة اللي بتفضلها" subtitle="اختار منطقة أو أكتر">
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <PillChoice
                  key={a}
                  selected={data.locations?.includes(a)}
                  onClick={() => update("locations", toggleArr(data.locations, a))}
                  label={a}
                />
              ))}
              <PillChoice
                selected={data.locations?.includes("مفيش تفضيل")}
                onClick={() => update("locations", toggleArr(data.locations, "مفيش تفضيل"))}
                label="مفيش تفضيل"
              />
            </div>
            <div className="mt-6">
              <label className="text-sm font-medium mb-2 block">ملاحظات إضافية عن المنطقة (اختياري)</label>
              <Input
                value={data.locationNotes}
                onChange={(e) => update("locationNotes", e.target.value)}
                placeholder="مثال: قريب من مستشفى الحياة"
              />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="نوع العقار" subtitle="اختار نوع أو أكتر">
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((k) => (
                <PillChoice
                  key={k}
                  selected={data.propertyTypes?.includes(k)}
                  onClick={() => update("propertyTypes", toggleArr(data.propertyTypes, k))}
                  label={PROPERTY_TYPE_LABELS[k]}
                />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">المساحة</label>
                <select
                  value={data.areaPref}
                  onChange={(e) => update("areaPref", e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">اختار</option>
                  <option value="<80">أقل من 80م²</option>
                  <option value="80-120">80 - 120م²</option>
                  <option value="120-200">120 - 200م²</option>
                  <option value=">200">أكتر من 200م²</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">عدد الغرف</label>
                <select
                  value={data.roomsPref}
                  onChange={(e) => update("roomsPref", e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">مش مهم</option>
                  <option value="1">غرفة واحدة</option>
                  <option value="2">غرفتين</option>
                  <option value="3">٣ غرف</option>
                  <option value="4+">٤ غرف أو أكتر</option>
                </select>
              </div>
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step title="الميزانية والوقت" subtitle="حدد الحد الأقصى للسعر والمدة المتوقعة">
            <div>
              <label className="text-sm font-medium mb-2 block">الحد الأقصى للميزانية</label>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={10000}
                value={data.budgetMax}
                onChange={(e) => update("budgetMax", Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-center mt-2">
                <span className="font-display text-3xl font-bold text-primary ltr-num">
                  {(data.budgetMax || 0).toLocaleString("en-US")}
                </span>
                <span className="text-sm text-muted-foreground mr-2">جنيه</span>
              </div>
            </div>
            <div className="mt-8">
              <label className="text-sm font-medium mb-3 block">المدة المتوقعة</label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(TIMELINE_LABELS) as Timeline[]).map((k) => (
                  <ChoiceCard
                    key={k}
                    selected={data.timeline === k}
                    onClick={() => update("timeline", k)}
                    label={TIMELINE_LABELS[k]}
                  />
                ))}
              </div>
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="نمط الحياة" subtitle="إيه اللي مهم بالنسبة لك في المنطقة؟ (اختياري)">
            <div className="flex flex-wrap gap-2 mb-6">
              {LIFESTYLE_TAGS.map((t) => (
                <PillChoice
                  key={t}
                  selected={data.lifestyleTags?.includes(t)}
                  onClick={() => update("lifestyleTags", toggleArr(data.lifestyleTags, t))}
                  label={t}
                />
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">أي تفضيلات إضافية</label>
              <Textarea
                value={data.extraNotes}
                onChange={(e) => update("extraNotes", e.target.value)}
                placeholder="اكتب أي تفاصيل تانية عاوزنا ناخد بالنا منها"
                rows={3}
              />
            </div>
          </Step>
        )}

        {step === 6 && (
          <Step title="بياناتك" subtitle="عشان نقدر نتواصل معاك ونبعتلك العروض المناسبة">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">الاسم</label>
                <Input
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="اسمك الأول"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">رقم الواتساب</label>
                <Input
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/[^\d+]/g, ""))}
                  placeholder="+201xxxxxxxxx"
                  dir="ltr"
                  className="text-left"
                  maxLength={15}
                />
              </div>
              <div className="rounded-lg bg-secondary p-4 text-sm flex gap-3 items-start">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground leading-relaxed">
                  هنبعتلك إشعار على واتساب لما يجي عرض يناسب اهتماماتك — مش هنزعجك. أقصى ٣ إشعارات في الأسبوع.
                </span>
              </div>
            </div>
          </Step>
        )}
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? navigate("/") : setStep((s) => s - 1))}
        >
          <ChevronRight className="h-4 w-4 ml-1" />
          {step === 0 ? "رجوع" : "السابق"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
            className="bg-gradient-gold text-primary-foreground hover:opacity-90 min-w-[140px]"
          >
            التالي
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
        ) : (
          <Button
            disabled={!canNext()}
            onClick={finish}
            className="bg-gradient-gold text-primary-foreground hover:opacity-90 min-w-[140px]"
          >
            <Check className="h-4 w-4 ml-1" />
            إنشاء الحساب
          </Button>
        )}
      </div>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
      {children}
    </div>
  );
}

function ChoiceCard({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border-2 text-right font-medium transition-all",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      {label}
    </button>
  );
}

function PillChoice({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("pill", selected && "pill-active")}>
      {label}
    </button>
  );
}
