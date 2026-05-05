import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCurrentUser,
  nowISO,
  saveListing,
  uid,
} from "@/lib/store";
import {
  LISTING_TYPES,
  PRICE_TYPES,
  PROPERTY_TYPES,
  SELLER_LISTING_FEE_EGP,
} from "@/lib/types";
import type { Listing, ListingType, PriceType, PropertyType } from "@/lib/types";
import { t, useLang } from "@/lib/i18n";
import { toast } from "sonner";

export default function NewListing() {
  const lang = useLang();
  const nav = useNavigate();
  const user = getCurrentUser();

  const [listingType, setListingType] = useState<ListingType>("sell");
  const [propertyType, setPropertyType] = useState<PropertyType>("residential");
  const [governorate, setGovernorate] = useState("Minya");
  const [city, setCity] = useState("Samalot");
  const [area, setArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [areaSqm, setAreaSqm] = useState<number | "">("");
  const [priceEgp, setPriceEgp] = useState<number | "">("");
  const [priceType, setPriceType] = useState<PriceType>("negotiable");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.whatsapp ?? "");
  const [imagesText, setImagesText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  if (!user) {
    nav("/login?next=/listings/new");
    return null;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const id = uid();
    const listing: Listing = {
      id,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      userId: user!.id,
      listingType,
      propertyType,
      governorate,
      city,
      area,
      fullAddress: fullAddress || undefined,
      areaSqm: Number(areaSqm) || 0,
      priceEgp: Number(priceEgp) || 0,
      priceType,
      description,
      images: imagesText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
      videoUrl: videoUrl || undefined,
      contactPhone,
      status: "pending_review",
      isFeatured: false,
      viewCount: 0,
    };
    saveListing(listing);
    toast.success(
      lang === "ar"
        ? `تم إرسال الإعلان للمراجعة (رسم ${SELLER_LISTING_FEE_EGP} ج.م)`
        : `Listing submitted for review (${SELLER_LISTING_FEE_EGP} EGP fee)`,
    );
    nav("/dashboard?tab=listings");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">
            {t("nav.create_listing", lang)}
          </h1>
          <p className="text-muted-foreground mb-6">
            {lang === "ar"
              ? `رسم الإعلان: ${SELLER_LISTING_FEE_EGP} ج.م — يتم التحصيل يدوياً (تجريبي).`
              : `Listing fee: ${SELLER_LISTING_FEE_EGP} EGP — collected manually (mock).`}
          </p>

          <form onSubmit={submit} className="space-y-6">
            <section className="surface-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold">
                {lang === "ar" ? "النوع" : "Type"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "نوع الإعلان" : "Listing type"}</Label>
                  <Select value={listingType} onValueChange={(v) => setListingType(v as ListingType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LISTING_TYPES.map((lt) => (
                        <SelectItem key={lt} value={lt}>
                          {t(`lt.${lt}`, lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "نوع العقار" : "Property type"}</Label>
                  <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {t(`pt.${p}`, lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="surface-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold">
                {lang === "ar" ? "الموقع" : "Location"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المحافظة" : "Governorate"}</Label>
                  <Input value={governorate} onChange={(e) => setGovernorate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المدينة" : "City"}</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المنطقة" : "Area"}</Label>
                  <Input value={area} onChange={(e) => setArea(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "ar" ? "العنوان الكامل (مخفي حتى الموافقة)" : "Full address (hidden until approval)"}
                </Label>
                <Input value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
              </div>
            </section>

            <section className="surface-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold">
                {lang === "ar" ? "التفاصيل" : "Specs"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "المساحة (م²)" : "Area (sqm)"}</Label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={areaSqm}
                    onChange={(e) => setAreaSqm(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "السعر (ج.م)" : "Price (EGP)"}</Label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={priceEgp}
                    onChange={(e) => setPriceEgp(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "طبيعة السعر" : "Price nature"}</Label>
                  <Select value={priceType} onValueChange={(v) => setPriceType(v as PriceType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {t(`prc.${p}`, lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "الوصف الكامل" : "Full description"}</Label>
                <Textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "ar" ? "روابط الصور (سطر لكل واحدة)" : "Image URLs (one per line)"}
                </Label>
                <Textarea
                  rows={3}
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "ar" ? "رابط فيديو (اختياري)" : "Video URL (optional)"}
                </Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "ar" ? "رقم التواصل (مخفي حتى الموافقة)" : "Contact phone (hidden until approval)"}
                </Label>
                <Input
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </section>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => nav("/dashboard")}>
                {t("g.cancel", lang)}
              </Button>
              <Button type="submit" className="bg-gradient-gold text-primary-foreground">
                {t("g.submit", lang)}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
