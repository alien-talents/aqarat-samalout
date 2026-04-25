import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, BellOff, Edit3, LogOut, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/ListingCard";
import { clearProfile, getListings, getProfile, matchScore, saveProfile } from "@/lib/store";
import type { Listing, SeekerProfile } from "@/lib/types";
import {
  INTENT_LABELS,
  PROPERTY_TYPE_LABELS,
  REASON_LABELS,
  TIMELINE_LABELS,
} from "@/lib/types";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      navigate("/onboarding");
      return;
    }
    setProfile(p);
    setListings(getListings().filter((l) => l.isApproved));
  }, [navigate]);

  if (!profile) return null;

  const matched = listings.filter((l) => matchScore(l, profile) >= 2);

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
            <div className="flex gap-2">
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

        {/* Profile summary */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
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

        {/* Matched */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> العروض المناسبة لك
            </h2>
            <Link to="/" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          {matched.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <p className="text-muted-foreground">لسه مفيش عروض مناسبة لاهتماماتك. هنبعتلك إشعار أول ما يجي عرض جديد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matched.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
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
