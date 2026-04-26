import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, BellOff, Edit3, LogOut, Sparkles, User, Heart, Building2, Eye, MessageCircle,
  RefreshCw, Trash2, Clock, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/ListingCard";
import {
  clearProfile, deleteListing, getListings, getMyListings, getProfile, getSavedListings,
  isExpired, listingStatus, matchScore, renewListing, saveProfile,
} from "@/lib/store";
import type { Listing, SeekerProfile } from "@/lib/types";
import {
  INTENT_LABELS, PROPERTY_TYPE_LABELS, REASON_LABELS, TIMELINE_LABELS, PACKAGES,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [saved, setSaved] = useState<Listing[]>([]);
  const [listerPhone, setListerPhone] = useState("");

  const refresh = () => {
    setListings(getListings().filter((l) => l.isApproved));
    setSaved(getSavedListings());
  };

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      navigate("/onboarding");
      return;
    }
    setProfile(p);
    setListerPhone(p.phone);
    refresh();

    const onChange = () => refresh();
    window.addEventListener("samalot:listings-changed", onChange);
    window.addEventListener("samalot:saved-changed", onChange);
    return () => {
      window.removeEventListener("samalot:listings-changed", onChange);
      window.removeEventListener("samalot:saved-changed", onChange);
    };
  }, [navigate]);

  const matched = useMemo(
    () => (profile ? listings.filter((l) => matchScore(l, profile) >= 2) : []),
    [profile, listings],
  );

  const myListings = useMemo(() => getMyListings(listerPhone), [listerPhone, listings]);

  if (!profile) return null;

  const toggleNotif = () => {
    const updated = { ...profile, isNotified: !profile.isNotified };
    saveProfile(updated);
    setProfile(updated);
    toast.success(updated.isNotified ? "تم تفعيل الإشعارات" : "تم إيقاف الإشعارات");
  };

  const logout = () => {
    if (!confirm("متأكد إنك عاوز تخرج؟ هيتم حذف بياناتك من الجهاز.")) return;
    clearProfile();
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-8 flex-1 max-w-5xl">
        {/* Hero card */}
        <div className="surface-elevated p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  أهلاً يا {profile.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 ltr-num" dir="ltr">{profile.phone}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={toggleNotif}>
                {profile.isNotified ? <Bell className="h-4 w-4 ml-1" /> : <BellOff className="h-4 w-4 ml-1" />}
                {profile.isNotified ? "الإشعارات مفعلة" : "الإشعارات موقوفة"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")}>
                <Edit3 className="h-4 w-4 ml-1" /> تعديل
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="text-destructive">
                <LogOut className="h-4 w-4 ml-1" /> خروج
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="matches">
              <Sparkles className="h-4 w-4 ml-1.5" /> العروض المناسبة
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Heart className="h-4 w-4 ml-1.5" /> المحفوظة
              {saved.length > 0 && <span className="mr-1.5 ltr-num text-xs">({saved.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="mine">
              <Building2 className="h-4 w-4 ml-1.5" /> إعلاناتي
            </TabsTrigger>
            <TabsTrigger value="prefs">تفضيلاتي</TabsTrigger>
          </TabsList>

          {/* Matched */}
          <TabsContent value="matches">
            {matched.length === 0 ? (
              <EmptyState
                title="لسه مفيش عروض مناسبة"
                subtitle="هنبعتلك إشعار أول ما يجي عرض جديد يناسب اهتماماتك"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matched.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved */}
          <TabsContent value="saved">
            {saved.length === 0 ? (
              <EmptyState
                title="مفيش إعلانات محفوظة"
                subtitle="دوس على ❤️ على أي إعلان عشان تضيفه هنا"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {saved.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My listings (lister dashboard) */}
          <TabsContent value="mine">
            <div className="surface-card p-5 mb-4">
              <label className="text-sm font-medium mb-2 block">اعرض إعلاناتك حسب رقم الواتساب</label>
              <div className="flex gap-2">
                <Input
                  value={listerPhone}
                  onChange={(e) => setListerPhone(e.target.value.replace(/[^\d+]/g, ""))}
                  placeholder="+201xxxxxxxxx"
                  dir="ltr"
                  className="text-left"
                />
                <Button onClick={() => navigate("/post")} className="bg-gradient-gold text-primary-foreground hover:opacity-90 shrink-0">
                  + إعلان جديد
                </Button>
              </div>
            </div>
            {myListings.length === 0 ? (
              <EmptyState
                title="لسه مفيش إعلانات"
                subtitle="ابدأ بإضافة أول إعلان عقار ليك"
                cta={<Link to="/post"><Button className="bg-gradient-gold text-primary-foreground hover:opacity-90">أضف إعلانك الأول</Button></Link>}
              />
            ) : (
              <div className="space-y-3">
                {myListings.map((l) => (
                  <MyListingRow key={l.id} listing={l} onChanged={refresh} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Prefs */}
          <TabsContent value="prefs">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="surface-card p-5 space-y-3">
                <h2 className="font-display text-lg font-bold mb-2">اهتماماتك</h2>
                <Row label="بدور على" value={INTENT_LABELS[profile.intent]} />
                <Row label="السبب" value={REASON_LABELS[profile.reason]} />
                <Row label="المدة" value={TIMELINE_LABELS[profile.timeline]} />
                <Row
                  label="الميزانية"
                  value={<span className="ltr-num text-primary font-bold">{profile.budgetMax.toLocaleString("en-US")} جنيه</span>}
                />
              </div>
              <div className="surface-card p-5 space-y-3">
                <h2 className="font-display text-lg font-bold mb-2">التفضيلات</h2>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">المناطق</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.locations.map((l) => (
                      <span key={l} className="pill !py-0.5 !px-2 !text-[11px]">{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">نوع العقار</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.propertyTypes.map((t) => (
                      <span key={t} className="pill !py-0.5 !px-2 !text-[11px]">{PROPERTY_TYPE_LABELS[t]}</span>
                    ))}
                  </div>
                </div>
                {profile.lifestyleTags.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">نمط الحياة</div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.lifestyleTags.map((t) => (
                        <span key={t} className="pill !py-0.5 !px-2 !text-[11px]">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

function MyListingRow({ listing, onChanged }: { listing: Listing; onChanged: () => void }) {
  const status = listingStatus(listing);
  const onRenew = () => {
    renewListing(listing.id, PACKAGES[listing.packageType].days);
    toast.success("تم تجديد الإعلان");
    onChanged();
  };
  const onDelete = () => {
    if (!confirm("متأكد من حذف الإعلان؟")) return;
    deleteListing(listing.id);
    toast.success("تم حذف الإعلان");
    onChanged();
  };

  return (
    <div className="surface-card p-4 flex flex-col md:flex-row gap-4 items-start">
      <Link to={`/listing/${listing.id}`} className="h-24 w-24 rounded-lg overflow-hidden bg-muted shrink-0 block">
        {listing.images[0] && <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <StatusBadge status={status} />
          <span className="text-xs text-muted-foreground">
            {PROPERTY_TYPE_LABELS[listing.propertyType]} • {listing.locationName}
          </span>
        </div>
        <h3 className="font-bold truncate">{listing.titleAr}</h3>
        <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span>السعر: <span className="text-primary font-bold ltr-num">{listing.price.toLocaleString("en-US")}</span> جنيه</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> <span className="ltr-num">{listing.views || 0}</span> مشاهدة</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> <span className="ltr-num">{listing.waClicks || 0}</span> تواصل</span>
        </div>
        {listing.rejectionReason && (
          <p className="text-xs text-destructive mt-2">سبب الرفض: {listing.rejectionReason}</p>
        )}
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {(status === "expired" || status === "live") && (
          <Button variant="outline" size="sm" onClick={onRenew}>
            <RefreshCw className="h-4 w-4 ml-1" /> تجديد
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReturnType<typeof listingStatus> }) {
  const map = {
    pending: { label: "قيد المراجعة", icon: Clock, cls: "bg-warning/20 text-warning border-warning/40" },
    live: { label: "منشور", icon: Check, cls: "bg-success/20 text-success border-success/40" },
    expired: { label: "منتهي", icon: Clock, cls: "bg-muted text-muted-foreground border-border" },
    rejected: { label: "مرفوض", icon: Trash2, cls: "bg-destructive/20 text-destructive border-destructive/40" },
  } as const;
  const v = map[status];
  const Icon = v.icon;
  return (
    <span className={cn("pill !py-0.5 !px-2 !text-[10px]", v.cls)}>
      <Icon className="h-3 w-3" /> {v.label}
    </span>
  );
}

function EmptyState({ title, subtitle, cta }: { title: string; subtitle: string; cta?: React.ReactNode }) {
  return (
    <div className="surface-card p-12 text-center">
      <p className="font-bold mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
