import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveListing, uid, nowISO } from "@/lib/store";
import {
  AREAS,
  PACKAGES,
  PROPERTY_TYPE_LABELS,
  type ListerType,
  type PackageType,
  type PriceType,
  type PropertyType,
  type Listing,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PostListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titleAr: "",
    descriptionAr: "",
    price: 0,
    priceType: "sale" as PriceType,
    propertyType: "apartment" as PropertyType,
    areaSqm: 0,
    rooms: 0,
    floor: 0,
    locationName: AREAS[0],
    villageName: "",
    phone: "",
    listerName: "",
    listerType: "individual" as ListerType,
    packageType: "basic" as PackageType,
    images: [] as string[],
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onUpload = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - form.images.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        update("images", [...form.images, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (i: number) => update("images", form.images.filter((_, idx) => idx !== i));

  const valid = form.titleAr && form.descriptionAr && form.price > 0 && form.areaSqm > 0 && form.phone.length >= 10 && form.listerName;

  const submit = () => {
    const pkg = PACKAGES[form.packageType];
    const listing: Listing = {
      id: uid(),
      createdAt: nowISO(),
      titleAr: form.titleAr,
      descriptionAr: form.descriptionAr,
      price: form.price,
      priceType: form.priceType,
      propertyType: form.propertyType,
      areaSqm: form.areaSqm,
      rooms: form.rooms,
      floor: form.floor,
      locationName: form.locationName,
      locationArea: form.locationName.includes("سمالوط") ? "samalot" : "village",
      villageName: form.villageName || undefined,
      phone: form.phone,
      whatsapp: form.phone,
      images: form.images,
      isFeatured: form.packageType !== "basic",
      isApproved: false,
      packageType: form.packageType,
      listerType: form.listerType,
      listerName: form.listerName,
      expiresAt: new Date(Date.now() + pkg.days * 86400000).toISOString(),
    };
    saveListing(listing);
    toast.success("تم استلام إعلانك بنجاح", {
      description: "هيتم مراجعته خلال 24 ساعة قبل النشر",
    });
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container max-w-3xl py-10 flex-1">
        <h1 className="font-display text-3xl md:text-4xl font-bold">أضف إعلانك</h1>
        <p className="text-muted-foreground mt-2">اكتب تفاصيل عقارك وحدد الباقة المناسبة</p>

        <div className="mt-8 space-y-6">
          {/* Basic info */}
          <Section title="بيانات العقار">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="نوع العرض">
                <div className="flex gap-2">
                  <button
                    onClick={() => update("priceType", "sale")}
                    className={cn("pill flex-1 justify-center", form.priceType === "sale" && "pill-active")}
                  >
                    للبيع
                  </button>
                  <button
                    onClick={() => update("priceType", "rent")}
                    className={cn("pill flex-1 justify-center", form.priceType === "rent" && "pill-active")}
                  >
                    للإيجار
                  </button>
                </div>
              </Field>
              <Field label="نوع العقار">
                <select
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value as PropertyType)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((k) => (
                    <option key={k} value={k}>{PROPERTY_TYPE_LABELS[k]}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="عنوان الإعلان">
              <Input
                value={form.titleAr}
                onChange={(e) => update("titleAr", e.target.value.slice(0, 100))}
                placeholder="مثال: شقة 120م في وسط البلد — تشطيب سوبر لوكس"
              />
            </Field>

            <Field label="الوصف">
              <Textarea
                value={form.descriptionAr}
                onChange={(e) => update("descriptionAr", e.target.value.slice(0, 1000))}
                placeholder="اكتب تفاصيل العقار: الموقع، الميزات، طريقة الدفع..."
                rows={5}
              />
            </Field>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="السعر (جنيه)">
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => update("price", Number(e.target.value))}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
              <Field label="المساحة (م²)">
                <Input
                  type="number"
                  value={form.areaSqm || ""}
                  onChange={(e) => update("areaSqm", Number(e.target.value))}
                  dir="ltr"
                  className="text-left"
                />
              </Field>
              <Field label="عدد الغرف">
                <Input
                  type="number"
                  value={form.rooms || ""}
                  onChange={(e) => update("rooms", Number(e.target.value))}
                  dir="ltr"
                  className="text-left"
                  placeholder="0 = لا يوجد"
                />
              </Field>
            </div>

            <Field label="المنطقة">
              <select
                value={form.locationName}
                onChange={(e) => update("locationName", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
          </Section>

          {/* Photos */}
          <Section title="الصور (حتى 5 صور)">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {form.images.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden surface-card">
                  <img src={src} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImg(i)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    aria-label="حذف"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
          </Section>

          {/* Lister */}
          <Section title="بيانات المُعلِن">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="الاسم">
                <Input
                  value={form.listerName}
                  onChange={(e) => update("listerName", e.target.value.slice(0, 50))}
                  placeholder="اسمك أو اسم المكتب"
                />
              </Field>
              <Field label="رقم الواتساب">
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/[^\d+]/g, ""))}
                  placeholder="+201xxxxxxxxx"
                  dir="ltr"
                  className="text-left"
                  maxLength={15}
                />
              </Field>
            </div>
            <Field label="نوع المُعلِن">
              <div className="flex gap-2 flex-wrap">
                {(["individual", "broker", "office"] as ListerType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => update("listerType", t)}
                    className={cn("pill", form.listerType === t && "pill-active")}
                  >
                    {t === "individual" ? "مالك" : t === "broker" ? "وسيط" : "مكتب"}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          {/* Package */}
          <Section title="اختر الباقة">
            <div className="grid md:grid-cols-3 gap-3">
              {(Object.keys(PACKAGES) as PackageType[]).map((k) => {
                const p = PACKAGES[k];
                const selected = form.packageType === k;
                return (
                  <button
                    key={k}
                    onClick={() => update("packageType", k)}
                    className={cn(
                      "p-5 rounded-lg border-2 text-right transition-all",
                      selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{p.label}</span>
                      {k !== "basic" && <Crown className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="font-display text-2xl font-bold text-primary">
                      <span className="ltr-num">{p.price}</span>
                      <span className="text-sm font-body text-muted-foreground mr-1">
                        جنيه{k === "office" ? "/شهر" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{p.desc}</p>
                    {selected && <Check className="h-4 w-4 text-primary mt-2" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
              💸 الدفع يتم يدوياً عبر فودافون كاش / إنستاباي بعد مراجعة الإعلان وسنتواصل معك على الواتساب لتأكيد الدفع.
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate("/")}>إلغاء</Button>
            <Button
              disabled={!valid}
              onClick={submit}
              className="bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              إرسال للمراجعة
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6 space-y-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      {children}
    </div>
  );
}
