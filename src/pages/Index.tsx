import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Sparkles, Inbox, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListings } from "@/hooks/useSupabase";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { getCurrentUser } from "@/lib/store";
import type { Listing, ListingType, PropertyType } from "@/lib/types";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/types";
import { t, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/samalot-hero.jpg";

type Sort = "newest" | "price_asc" | "price_desc";

export default function Index() {
  const lang = useLang();
  const [filterLT, setFilterLT] = useState<ListingType | "all">("all");
  const [filterPT, setFilterPT] = useState<PropertyType | "all">("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [search, setSearch] = useState("");
  const user = getCurrentUser();
  
  // Fetch listings from Supabase
  const { data: listings = [], isLoading, error } = useListings({
    status: 'active',
    listingType: filterLT === "all" ? undefined : filterLT,
    propertyType: filterPT === "all" ? undefined : filterPT,
  });
  
  // Enable real-time updates
  useSupabaseRealtime(user?.id);

  const filtered = useMemo(() => {
    let list = [...listings];
    if (filterLT !== "all") list = list.filter((l) => l.listingType === filterLT);
    if (filterPT !== "all") list = list.filter((l) => l.propertyType === filterPT);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.area.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      switch (sort) {
        case "price_asc":
          return a.priceEgp - b.priceEgp;
        case "price_desc":
          return b.priceEgp - a.priceEgp;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [listings, filterLT, filterPT, sort, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Samalot"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="container relative py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <Sparkles className="h-3 w-3" />
              {t("brand.tagline", lang)}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              {t("hero.title_a", lang)} <span className="gradient-text">—</span>
              <br />
              {t("hero.title_b", lang)}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              {t("hero.subtitle", lang)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {!user && (
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-gold text-primary-foreground hover:opacity-90"
                  >
                    {t("hero.cta_register", lang)}
                    <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" />
                  </Button>
                </Link>
              )}
              <a href="#marketplace">
                <Button size="lg" variant="outline">
                  {t("hero.cta_browse", lang)}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section id="marketplace" className="container py-10">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("g.search", lang)}
              className="ps-10"
            />
          </div>
          <Select value={filterLT} onValueChange={(v) => setFilterLT(v as any)}>
            <SelectTrigger className="md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("mp.filter.all", lang)}</SelectItem>
              {LISTING_TYPES.map((lt) => (
                <SelectItem key={lt} value={lt}>
                  {t(`lt.${lt}`, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPT} onValueChange={(v) => setFilterPT(v as any)}>
            <SelectTrigger className="md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("mp.filter.all", lang)}</SelectItem>
              {PROPERTY_TYPES.map((pt) => (
                <SelectItem key={pt} value={pt}>
                  {t(`pt.${pt}`, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="md:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("mp.sort.newest", lang)}</SelectItem>
              <SelectItem value="price_asc">{t("mp.sort.price_asc", lang)}</SelectItem>
              <SelectItem value="price_desc">{t("mp.sort.price_desc", lang)}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">{t("mp.heading", lang)}</h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {lang === "ar" ? "نتيجة" : "results"}
          </span>
        </div>

        {isLoading ? (
          <div className="surface-card p-12 text-center">
            <Loader2 className="h-10 w-10 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-muted-foreground">
              {lang === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        ) : error ? (
          <div className="surface-card p-12 text-center">
            <p className="text-red-500">
              {lang === "ar" ? "حدث خطأ في تحميل البيانات" : "Error loading data"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t("mp.no_results", lang)}</p>
          </div>
        ) : (
          <div className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
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
