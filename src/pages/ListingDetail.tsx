import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Lock,
  MapPin,
  Maximize2,
  Phone,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getCurrentPlan,
  getCurrentUser,
  getListing,
  getRequests,
  getUser,
  nowISO,
  saveRequest,
  trackListingView,
  uid,
} from "@/lib/store";
import type { Listing, User } from "@/lib/types";
import { fmtDate, fmtPrice, fmtSqm, t, useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { ListingStatusBadge } from "@/components/StatusBadge";

export default function ListingDetail() {
  const { id = "" } = useParams();
  const lang = useLang();
  const nav = useNavigate();
  const me = getCurrentUser();
  const [listing, setListing] = useState<Listing | undefined>(getListing(id));
  const [owner, setOwner] = useState<User | undefined>(
    listing ? getUser(listing.userId) : undefined,
  );
  const [requestOpen, setRequestOpen] = useState(false);
  const [stageNotes, setStageNotes] = useState("");

  useEffect(() => {
    trackListingView(id);
    const refresh = () => {
      const l = getListing(id);
      setListing(l);
      setOwner(l ? getUser(l.userId) : undefined);
    };
    refresh();
    window.addEventListener("samalot:listings-changed", refresh);
    return () => window.removeEventListener("samalot:listings-changed", refresh);
  }, [id]);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-20 text-center">
          <p className="text-muted-foreground">{t("g.empty", lang)}</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">
            ← {t("nav.marketplace", lang)}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwn = me?.id === listing.userId;
  const plan = getCurrentPlan(me?.id);
  const isSubscriber = plan === "basic" || plan === "premium" || isOwn || !!me?.isAdmin;

  // Approved request unlocks contact + full address
  const myRequest = me
    ? getRequests().find(
        (r) => r.listingId === listing.id && r.requesterId === me.id,
      )
    : undefined;
  const contactUnlocked =
    isOwn ||
    me?.isAdmin ||
    (myRequest?.status &&
      [
        "accepted",
        "appointment_scheduled",
        "in_discussion",
        "negotiating",
        "deal_done",
      ].includes(myRequest.status));

  function submitRequest() {
    if (!me) {
      nav(`/login?next=/listings/${listing!.id}`);
      return;
    }
    if (!isSubscriber) {
      nav("/pricing");
      return;
    }
    if (myRequest) {
      toast.info(
        lang === "ar" ? "عندك طلب قائم بالفعل" : "You already have a pending request",
      );
      return;
    }
    saveRequest({
      id: uid(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      requesterId: me.id,
      listingId: listing!.id,
      listingOwnerId: listing!.userId,
      status: "pending_admin",
      stageNotes,
    });
    toast.success(t("rq.thanks", lang));
    setRequestOpen(false);
    nav("/dashboard?tab=requests");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("nav.marketplace", lang)}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6">
          {/* Main */}
          <div className="space-y-6">
            {/* Photos */}
            <div className="surface-card overflow-hidden">
              {isSubscriber && listing.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {listing.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-full aspect-[4/3] object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">{t("g.locked", lang)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("g.unlock", lang)}
                    </p>
                    <Button
                      onClick={() => nav("/pricing")}
                      className="mt-4 bg-gradient-gold text-primary-foreground"
                    >
                      {t("ld.subscribe_to_view", lang)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary card (always visible) */}
            <div className="surface-card p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-pill bg-secondary px-3 py-1 text-xs font-medium">
                  {t(`lt.${listing.listingType}`, lang)}
                </span>
                <span className="rounded-pill bg-secondary px-3 py-1 text-xs font-medium">
                  {t(`pt.${listing.propertyType}`, lang)}
                </span>
                {listing.isFeatured && (
                  <span className="rounded-pill bg-gradient-gold text-primary-foreground px-3 py-1 text-xs font-medium inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {t("card.featured", lang)}
                  </span>
                )}
                {(isOwn || me?.isAdmin) && <ListingStatusBadge status={listing.status} />}
              </div>

              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <span className="font-display text-3xl font-bold gradient-text">
                  {fmtPrice(listing.priceEgp, lang)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t(`prc.${listing.priceType}`, lang)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                <Stat
                  icon={<Maximize2 className="h-4 w-4" />}
                  label={lang === "ar" ? "المساحة" : "Area"}
                  value={fmtSqm(listing.areaSqm, lang)}
                />
                <Stat
                  icon={<MapPin className="h-4 w-4" />}
                  label={t("ld.location_public", lang)}
                  value={`${listing.area}, ${listing.city}`}
                />
                <Stat
                  icon={<Eye className="h-4 w-4" />}
                  label={lang === "ar" ? "المشاهدات" : "Views"}
                  value={String(listing.viewCount)}
                />
              </div>
            </div>

            {/* Side panel content (subscribers) */}
            <div className="surface-card p-6 space-y-4">
              <h2 className="font-display text-xl font-bold">
                {t("ld.full_details", lang)}
              </h2>
              {isSubscriber ? (
                <>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      {t("ld.description", lang)}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("ld.location_full", lang)}
                    </h3>
                    {contactUnlocked && listing.fullAddress ? (
                      <p className="text-sm text-foreground">{listing.fullAddress}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        🔒 {t("ld.location_full_locked", lang)}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {lang === "ar" ? "رقم التواصل" : "Contact phone"}
                    </h3>
                    {contactUnlocked ? (
                      <a
                        href={`tel:${listing.contactPhone}`}
                        className="text-primary font-medium ltr-num"
                      >
                        {listing.contactPhone}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        🔒 {t("ld.contact_locked", lang)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-md border border-border bg-secondary/40 p-6 text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">{t("g.locked", lang)}</p>
                  <Button
                    onClick={() => nav("/pricing")}
                    className="mt-3 bg-gradient-gold text-primary-foreground"
                  >
                    {t("g.unlock", lang)}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 self-start">
            <div className="surface-elevated p-5 space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("ld.posted_by", lang)}
              </p>
              <div>
                <p className="font-display font-bold">{owner?.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {owner ? t(`at.${owner.accountType}`, lang) : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {fmtDate(listing.createdAt, lang)}
              </p>
              {!isOwn && (
                <Button
                  className="w-full bg-gradient-gold text-primary-foreground"
                  onClick={() => {
                    if (!me) return nav(`/login?next=/listings/${listing.id}`);
                    if (!isSubscriber) return nav("/pricing");
                    setRequestOpen(true);
                  }}
                  disabled={!!myRequest}
                >
                  {myRequest
                    ? t(`rq.status.${myRequest.status}`, lang)
                    : t("ld.request_appointment", lang)}
                  {!myRequest && <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" />}
                </Button>
              )}
              {isOwn && (
                <Button variant="outline" className="w-full" onClick={() => nav("/dashboard?tab=listings")}>
                  {lang === "ar" ? "إدارة الإعلان" : "Manage listing"}
                </Button>
              )}
            </div>

            <div className="surface-card p-5 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">
                {lang === "ar" ? "كيف بيتم التواصل؟" : "How contact works"}
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{lang === "ar" ? "تطلب معاد" : "You request an appointment"}</li>
                <li>{lang === "ar" ? "الإدارة تراجع" : "Admin reviews"}</li>
                <li>{lang === "ar" ? "البائع يقبل" : "Seller accepts"}</li>
                <li>{lang === "ar" ? "كل طرف يحجز معاد منفصل مع الإدارة" : "Each party books a separate call with admin"}</li>
              </ol>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ld.request_appointment", lang)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "اكتب أي ملاحظات حابب توصلها للإدارة قبل ما يراجعوا طلبك."
              : "Add any notes you want the admin to see before reviewing."}
          </p>
          <Textarea
            rows={4}
            value={stageNotes}
            onChange={(e) => setStageNotes(e.target.value)}
            placeholder={lang === "ar" ? "ملاحظاتك (اختياري)" : "Your notes (optional)"}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRequestOpen(false)}>
              {t("g.cancel", lang)}
            </Button>
            <Button onClick={submitRequest} className="bg-gradient-gold text-primary-foreground">
              {t("g.submit", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
