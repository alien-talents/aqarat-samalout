import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight, BedDouble, Building, ChevronLeft, ChevronRight, Crown,
  MapPin, Maximize2, Phone, Layers, Heart, Share2, Flag, Eye, Clock, AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { ReportDialog } from "@/components/ReportDialog";
import { Button } from "@/components/ui/button";
import {
  getListing, getListings, isSaved, toggleSaved, trackView, trackWaClick, listingStatus,
} from "@/lib/store";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | undefined>();
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const l = getListing(id);
    setListing(l);
    setImgIdx(0);
    setSaved(isSaved(id));
    if (l) trackView(id);
  }, [id]);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-20 text-center flex-1">
          <h1 className="font-display text-2xl mb-3">الإعلان مش موجود</h1>
          <Button onClick={() => navigate("/")}>الرجوع للإعلانات</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const status = listingStatus(listing);
  const similar = getListings()
    .filter((l) => l.isApproved && l.id !== listing.id && (l.locationName === listing.locationName || l.propertyType === listing.propertyType))
    .slice(0, 4);

  const phoneClean = listing.whatsapp.replace(/[^\d]/g, "");
  const waText = encodeURIComponent(`السلام عليكم، مهتم بالعقار: ${listing.titleAr}`);
  const waLink = `https://wa.me/${phoneClean}?text=${waText}`;
  const telLink = `tel:${listing.phone}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const onSave = () => {
    const next = toggleSaved(listing.id);
    setSaved(next);
    toast.success(next ? "تم حفظ الإعلان" : "تمت إزالته من المحفوظات");
  };

  const onShare = async () => {
    const data = {
      title: listing.titleAr,
      text: `${listing.titleAr} — ${listing.price.toLocaleString("en-US")} جنيه`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {/* user cancel */}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("تم نسخ رابط الإعلان");
    } catch {
      toast.error("تعذر النسخ");
    }
  };

  const shareWaLink = `https://wa.me/?text=${encodeURIComponent(`${listing.titleAr}\n${shareUrl}`)}`;

  const onWaClick = () => trackWaClick(listing.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowRight className="h-4 w-4" /> الرجوع
        </button>

        {status !== "live" && (
          <div className={cn(
            "rounded-lg border p-3 mb-4 text-sm flex items-center gap-2",
            status === "pending" && "bg-warning/10 border-warning/40 text-warning",
            status === "expired" && "bg-muted border-border text-muted-foreground",
            status === "rejected" && "bg-destructive/10 border-destructive/40 text-destructive",
          )}>
            {status === "pending" && <><Clock className="h-4 w-4" /> هذا الإعلان قيد المراجعة وغير ظاهر للمستخدمين بعد.</>}
            {status === "expired" && <><Clock className="h-4 w-4" /> هذا الإعلان منتهي الصلاحية.</>}
            {status === "rejected" && <><AlertTriangle className="h-4 w-4" /> تم رفض الإعلان: {listing.rejectionReason}</>}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Gallery + body */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted surface-card">
              <img
                src={listing.images[imgIdx]}
                alt={listing.titleAr}
                className="h-full w-full object-cover"
              />
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + listing.images.length) % listing.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background"
                    aria-label="السابق"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % listing.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background"
                    aria-label="التالي"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {listing.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        aria-label={`صورة ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === imgIdx ? "w-6 bg-primary" : "w-1.5 bg-background/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span className={`pill !py-1 !px-3 ${
                  listing.priceType === "sale" ? "bg-primary text-primary-foreground border-primary" : "bg-success text-success-foreground border-success"
                }`}>
                  {listing.priceType === "sale" ? "للبيع" : "للإيجار"}
                </span>
                {listing.isFeatured && (
                  <span className="pill !py-1 !px-3 bg-gradient-gold text-primary-foreground border-transparent">
                    <Crown className="h-3 w-3" /> مميز
                  </span>
                )}
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={onSave}
                  aria-label={saved ? "إزالة من المحفوظات" : "حفظ"}
                  className={cn(
                    "h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center",
                    saved ? "bg-primary text-primary-foreground" : "bg-background/80 hover:bg-background"
                  )}
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                </button>
                <button
                  onClick={onShare}
                  aria-label="مشاركة"
                  className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md hover:bg-background flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="surface-card p-6 space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">{PROPERTY_TYPE_LABELS[listing.propertyType]}</span>
                <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 leading-tight">
                  {listing.titleAr}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {listing.locationName}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
                <Stat icon={Maximize2} label="المساحة" value={`${listing.areaSqm} م²`} />
                {listing.rooms > 0 && <Stat icon={BedDouble} label="الغرف" value={String(listing.rooms)} />}
                {listing.floor > 0 && <Stat icon={Layers} label="الدور" value={String(listing.floor)} />}
                <Stat icon={Building} label="المُعلِن" value={listing.listerName} />
              </div>

              <div className="pt-4 border-t border-border">
                <h2 className="font-bold mb-2">الوصف</h2>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {listing.descriptionAr}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> <span className="ltr-num">{listing.views || 0}</span> مشاهدة
                </span>
                <button
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-1.5 hover:text-destructive transition-colors"
                >
                  <Flag className="h-3.5 w-3.5" /> الإعلان مش صح؟ بلغنا
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="surface-elevated p-6 sticky top-24">
              <div className="text-sm text-muted-foreground">السعر</div>
              <div className="font-display text-3xl font-bold text-primary mt-1">
                <span className="ltr-num">{listing.price.toLocaleString("en-US")}</span>
                <span className="text-base font-body text-muted-foreground mr-1">
                  جنيه{listing.priceType === "rent" ? " / شهر" : ""}
                </span>
              </div>
              <div className="mt-6 space-y-2">
                <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={onWaClick} className="block">
                  <Button className="w-full bg-success text-success-foreground hover:bg-success/90 h-12">
                    تواصل على واتساب
                  </Button>
                </a>
                <a href={telLink} className="block">
                  <Button variant="outline" className="w-full h-12">
                    <Phone className="h-4 w-4 ml-2" /> اتصال
                  </Button>
                </a>
                <a href={shareWaLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="ghost" className="w-full h-10 text-sm">
                    <Share2 className="h-4 w-4 ml-2" /> شارك على واتساب
                  </Button>
                </a>
              </div>
              <div className="mt-4 text-xs text-muted-foreground text-center">
                {listing.listerType === "office" && "مكتب موثّق ✓"}
                {listing.listerType === "broker" && "وسيط معتمد"}
                {listing.listerType === "individual" && "إعلان من المالك مباشرة"}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-4">إعلانات مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ReportDialog listingId={listing.id} open={reportOpen} onOpenChange={setReportOpen} />

      <Footer />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="font-bold mt-1 text-sm">{value}</div>
    </div>
  );
}
