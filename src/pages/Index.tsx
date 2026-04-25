import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Sparkles, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getListings, getProfile, matchScore } from "@/lib/store";
import type { Listing, SeekerProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/samalot-hero.jpg";

type Filter = "all" | "sale" | "rent" | "land" | "samalot" | "village";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "sale", label: "للبيع" },
  { id: "rent", label: "للإيجار" },
  { id: "land", label: "أراضي" },
  { id: "samalot", label: "سمالوط" },
  { id: "village", label: "القرى" },
];

export default function Index() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => {
      setListings(getListings().filter((l) => l.isApproved));
      setProfile(getProfile());
    };
    refresh();
    window.addEventListener("samalot:listings-changed", refresh);
    window.addEventListener("samalot:profile-changed", refresh);
    return () => {
      window.removeEventListener("samalot:listings-changed", refresh);
      window.removeEventListener("samalot:profile-changed", refresh);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...listings];
    if (filter === "sale") list = list.filter((l) => l.priceType === "sale");
    if (filter === "rent") list = list.filter((l) => l.priceType === "rent");
    if (filter === "land") list = list.filter((l) => l.propertyType === "land_agri" || l.propertyType === "land_build");
    if (filter === "samalot") list = list.filter((l) => l.locationArea === "samalot");
    if (filter === "village") list = list.filter((l) => l.locationArea === "village");
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(
        (l) => l.titleAr.includes(q) || l.descriptionAr.includes(q) || l.locationName.includes(q)
      );
    }
    // Sort: featured first, then by match score (if profile), then by recency
    list.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (profile) {
        const sa = matchScore(a, profile);
        const sb = matchScore(b, profile);
        if (sa !== sb) return sb - sa;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [listings, filter, search, profile]);

  const matched = profile ? listings.filter((l) => matchScore(l, profile) >= 2).slice(0, 4) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img src={heroImg} alt="سمالوط" className="h-full w-full object-cover opacity-30" width={1600} height={900} />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <Sparkles className="h-3 w-3" />
              أول سوق عقاري محلي في سمالوط
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              قولنا إيه اللي <span className="gradient-text">بتدور عليه</span>
              <br />
              وهنجيبهولك.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              من الملاك مباشرة. مع مكاتب موثوقة. بدون عمولات خفية. إعلانات مفلترة على ذوقك في سمالوط والقرى المجاورة.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {!profile && (
                <Link to="/onboarding">
                  <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                    ابدأ — قولنا اهتماماتك
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                </Link>
              )}
              <Link to="/post">
                <Button size="lg" variant="outline">
                  أضف إعلانك
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Matched section */}
      {profile && matched.length > 0 && (
        <section className="container pt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                مختارة لك يا {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="ltr-num">{matched.length}</span> عرض مناسب لاهتماماتك
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matched.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Search + Filters */}
      <section className="container py-8 md:py-10">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالعنوان أو المنطقة..."
              className="pr-10"
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <SlidersHorizontal className="h-4 w-4 ml-2" />
            فلاتر متقدمة
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn("pill", filter === f.id && "pill-active")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">كل الإعلانات</h2>
          <span className="text-sm text-muted-foreground">
            <span className="ltr-num">{filtered.length}</span> نتيجة
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <p className="text-muted-foreground">مفيش إعلانات مطابقة. جرب فلتر تاني.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
