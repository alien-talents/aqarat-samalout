import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ListingStatusBadge,
  RequestStatusBadge,
} from "@/components/StatusBadge";
import {
  useNotifications,
  useMarkAllNotificationsRead,
} from "@/hooks/useSupabase";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import {
  bookSlot,
  deleteListing,
  getAppointmentsForUser,
  getCurrentUser,
  getListing,
  getMyListings,
  getOpenSlots,
  getProfileByUser,
  getRequestsForOwner,
  getRequestsForUser,
  getUser,
  setRequestStatus,
} from "@/lib/store";
import { fmtDate, fmtDateTime, fmtPrice, t, useLang } from "@/lib/i18n";
import { toast } from "sonner";
import type { Appointment, AppointmentRequest, Listing, Notification } from "@/lib/types";

export default function Dashboard() {
  const lang = useLang();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const me = getCurrentUser();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    [
      "samalot:listings-changed",
      "samalot:requests-changed",
      "samalot:appointments-changed",
      "samalot:notifications-changed",
      "samalot:slots-changed",
      "samalot:profiles-changed",
    ].forEach((e) => window.addEventListener(e, refresh));
    return () => {
      [
        "samalot:listings-changed",
        "samalot:requests-changed",
        "samalot:appointments-changed",
        "samalot:notifications-changed",
        "samalot:slots-changed",
        "samalot:profiles-changed",
      ].forEach((e) => window.removeEventListener(e, refresh));
    };
  }, []);

  // Supabase notifications with real-time
  const { data: supabaseNotifications = [] } = useNotifications(me?.id || '');
  const markAllRead = useMarkAllNotificationsRead();
  useSupabaseRealtime(me?.id);

  const data = useMemo(() => {
    if (!me) return null;
    return {
      listings: getMyListings(me.id),
      requestsMade: getRequestsForUser(me.id),
      requestsReceived: getRequestsForOwner(me.id),
      appts: getAppointmentsForUser(me.id),
      notifs: supabaseNotifications, // Using Supabase notifications
      profile: getProfileByUser(me.id),
      openSlots: getOpenSlots(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, tick, supabaseNotifications]);

  if (!me || !data) {
    nav("/login");
    return null;
  }

  const tab = params.get("tab") || "listings";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">
              {lang === "ar" ? `أهلاً ${me.name}` : `Hello, ${me.name}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(`at.${me.accountType}`, lang)} ·{" "}
              {data.profile?.area || (lang === "ar" ? "ملف غير مكتمل" : "Profile incomplete")}
            </p>
          </div>
          <Link to="/listings/new">
            <Button className="bg-gradient-gold text-primary-foreground">
              {t("nav.create_listing", lang)}
            </Button>
          </Link>
        </div>

        <Tabs value={tab} onValueChange={(v) => setParams({ tab: v })}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="listings">{t("db.tab.listings", lang)}</TabsTrigger>
            <TabsTrigger value="requests">{t("db.tab.requests", lang)}</TabsTrigger>
            <TabsTrigger value="received">{t("db.requests_received", lang)}</TabsTrigger>
            <TabsTrigger value="appointments">{t("db.tab.appointments", lang)}</TabsTrigger>
            <TabsTrigger value="notifications">
              {t("db.tab.notifications", lang)}
              {data.notifs.filter((n) => !n.isRead).length > 0 && (
                <span className="ms-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {data.notifs.filter((n) => !n.isRead).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile">{t("db.tab.profile", lang)}</TabsTrigger>
          </TabsList>

          {/* My Listings */}
          <TabsContent value="listings" className="mt-6 space-y-3">
            {data.listings.length === 0 ? (
              <Empty />
            ) : (
              data.listings.map((l) => <MyListingRow key={l.id} listing={l} />)
            )}
          </TabsContent>

          {/* Requests I made */}
          <TabsContent value="requests" className="mt-6 space-y-3">
            {data.requestsMade.length === 0 ? (
              <Empty />
            ) : (
              data.requestsMade.map((r) => (
                <RequestRow key={r.id} req={r} side="requester" openSlots={data.openSlots} myAppts={data.appts} />
              ))
            )}
          </TabsContent>

          {/* Requests on my listings */}
          <TabsContent value="received" className="mt-6 space-y-3">
            {data.requestsReceived.length === 0 ? (
              <Empty />
            ) : (
              data.requestsReceived.map((r) => (
                <RequestRow key={r.id} req={r} side="owner" openSlots={data.openSlots} myAppts={data.appts} />
              ))
            )}
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments" className="mt-6 space-y-3">
            {data.appts.length === 0 ? (
              <Empty />
            ) : (
              data.appts.map((a) => <AppointmentRow key={a.id} appt={a} />)
            )}
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6 space-y-2">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllRead.mutate(me.id)}
              >
                {lang === "ar" ? "علّم الكل كمقروء" : "Mark all read"}
              </Button>
            </div>
            {data.notifs.length === 0 ? (
              <Empty />
            ) : (
              data.notifs.map((n) => <NotifRow key={n.id} n={n} />)
            )}
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="mt-6">
            <div className="surface-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">
                  {lang === "ar" ? "بياناتك" : "Your info"}
                </h3>
                <Button variant="outline" onClick={() => nav("/profile-setup")}>
                  {lang === "ar" ? "تعديل" : "Edit"}
                </Button>
              </div>
              <Field label={lang === "ar" ? "الاسم" : "Name"} value={me.name} />
              <Field label={lang === "ar" ? "البريد" : "Email"} value={me.email} />
              <Field label="WhatsApp" value={me.whatsapp} />
              <Field label={lang === "ar" ? "نوع الحساب" : "Account type"} value={t(`at.${me.accountType}`, lang)} />
              {data.profile && (
                <>
                  <Field label={lang === "ar" ? "الموقع" : "Location"} value={`${data.profile.area || "—"}, ${data.profile.city || "—"}`} />
                  {data.profile.budgetEgp ? (
                    <Field label={lang === "ar" ? "الميزانية" : "Budget"} value={fmtPrice(data.profile.budgetEgp, lang)} />
                  ) : null}
                  {data.profile.timeline && (
                    <Field label={lang === "ar" ? "الإطار الزمني" : "Timeline"} value={t(`tl.${data.profile.timeline}`, lang)} />
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function Empty() {
  const lang = useLang();
  return (
    <div className="surface-card p-10 text-center text-muted-foreground">
      {t("g.empty", lang)}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border last:border-0 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-end">{value}</span>
    </div>
  );
}

function MyListingRow({ listing }: { listing: Listing }) {
  const lang = useLang();
  return (
    <div className="surface-card p-4 flex flex-wrap items-center gap-4 justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <ListingStatusBadge status={listing.status} />
          <span className="text-xs text-muted-foreground">{fmtDate(listing.createdAt, lang)}</span>
        </div>
        <p className="font-medium">
          {t(`pt.${listing.propertyType}`, lang)} · {listing.area} · {fmtPrice(listing.priceEgp, lang)}
        </p>
        <p className="text-xs text-muted-foreground">
          {listing.viewCount} {lang === "ar" ? "مشاهدة" : "views"}
          {listing.rejectionReason ? ` · ${listing.rejectionReason}` : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <Link to={`/listings/${listing.id}`}>
          <Button variant="outline" size="sm">
            {t("g.view_details", lang)}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm(lang === "ar" ? "حذف الإعلان؟" : "Delete listing?")) deleteListing(listing.id);
          }}
        >
          {lang === "ar" ? "حذف" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

function RequestRow({
  req,
  side,
  openSlots,
  myAppts,
}: {
  req: AppointmentRequest;
  side: "requester" | "owner";
  openSlots: ReturnType<typeof getOpenSlots>;
  myAppts: Appointment[];
}) {
  const lang = useLang();
  const me = getCurrentUser()!;
  const listing = getListing(req.listingId);
  const otherUser = side === "requester" ? getUser(req.listingOwnerId) : getUser(req.requesterId);
  const myApptForReq = myAppts.find((a) => a.requestId === req.id);
  const canBook =
    req.status === "accepted" ||
    (req.status === "appointment_scheduled" && !myApptForReq);

  function book(slotId: string) {
    const appt = bookSlot(slotId, me.id, req.id);
    if (appt)
      toast.success(
        lang === "ar" ? "تم حجز المعاد" : "Slot booked",
      );
  }

  return (
    <div className="surface-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <RequestStatusBadge status={req.status} />
          <span className="text-xs text-muted-foreground ms-2">
            {fmtDateTime(req.createdAt, lang)}
          </span>
        </div>
        {side === "owner" && req.status === "pending_seller" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setRequestStatus(req.id, "accepted")}>
              {t("g.approve", lang)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setRequestStatus(req.id, "rejected", {
                  reason: prompt(lang === "ar" ? "السبب؟" : "Reason?") ?? undefined,
                })
              }
            >
              {t("g.reject", lang)}
            </Button>
          </div>
        )}
      </div>
      <div className="text-sm">
        <p className="font-medium">
          {listing
            ? `${t(`pt.${listing.propertyType}`, lang)} · ${listing.area} · ${fmtPrice(listing.priceEgp, lang)}`
            : "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          {side === "requester" ? (lang === "ar" ? "البائع: " : "Seller: ") : (lang === "ar" ? "المشتري: " : "Buyer: ")}
          {otherUser?.name ?? "—"}
        </p>
        {req.stageNotes && (
          <p className="text-xs text-muted-foreground mt-1 italic">"{req.stageNotes}"</p>
        )}
        {req.rejectionReason && (
          <p className="text-xs text-destructive mt-1">⚠ {req.rejectionReason}</p>
        )}
      </div>
      {canBook && openSlots.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold mb-2">
            {lang === "ar" ? "اختار معاد للمكالمة مع الإدارة:" : "Pick a call slot with admin:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {openSlots.slice(0, 8).map((s) => (
              <Button key={s.id} size="sm" variant="outline" onClick={() => book(s.id)}>
                {fmtDateTime(s.slotStart, lang)}
              </Button>
            ))}
          </div>
        </div>
      )}
      {myApptForReq && (
        <p className="text-xs text-success border-t border-border pt-3">
          ✓ {lang === "ar" ? "معادك: " : "Your call: "}
          {fmtDateTime(myApptForReq.scheduledAt, lang)}
        </p>
      )}
    </div>
  );
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const lang = useLang();
  return (
    <div className="surface-card p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">{fmtDateTime(appt.scheduledAt, lang)}</p>
        <p className="text-xs text-muted-foreground">
          {appt.durationMin} {lang === "ar" ? "دقيقة" : "min"} · {appt.status}
        </p>
      </div>
    </div>
  );
}

function NotifRow({ n }: { n: Notification }) {
  const lang = useLang();
  return (
    <div className={`surface-card p-3 flex items-start gap-3 ${!n.isRead ? "border-s-4 border-primary" : ""}`}>
      <div className="flex-1">
        <p className="font-medium text-sm">{n.title}</p>
        {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
        <p className="text-xs text-muted-foreground mt-1">{fmtDateTime(n.createdAt, lang)}</p>
      </div>
    </div>
  );
}
