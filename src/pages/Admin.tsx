import { FormEvent, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  deleteSlot,
  getAppointments,
  getListings,
  getRequests,
  getSlots,
  getSubs,
  getUser,
  getUsers,
  saveSlot,
  setListingStatus,
  setRequestStatus,
  uid,
  nowISO,
} from "@/lib/store";
import { fmtDate, fmtDateTime, fmtPrice, t, useLang } from "@/lib/i18n";
import type { RequestStatus } from "@/lib/types";

const PROGRESS: RequestStatus[] = [
  "pending_admin",
  "pending_seller",
  "accepted",
  "appointment_scheduled",
  "in_discussion",
  "negotiating",
  "deal_done",
  "deal_failed",
];

export default function Admin() {
  const lang = useLang();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    [
      "samalot:listings-changed",
      "samalot:requests-changed",
      "samalot:slots-changed",
      "samalot:appointments-changed",
      "samalot:users-changed",
      "samalot:subs-changed",
    ].forEach((e) => window.addEventListener(e, refresh));
    return () => {
      [
        "samalot:listings-changed",
        "samalot:requests-changed",
        "samalot:slots-changed",
        "samalot:appointments-changed",
        "samalot:users-changed",
        "samalot:subs-changed",
      ].forEach((e) => window.removeEventListener(e, refresh));
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = tick;
  const listings = getListings();
  const requests = getRequests();
  const slots = getSlots();
  const appts = getAppointments();
  const users = getUsers();
  const subs = getSubs();

  const totalRequests = requests.length;
  const approved = requests.filter((r) =>
    ["pending_seller", "accepted", "appointment_scheduled", "in_discussion", "negotiating", "deal_done"].includes(r.status),
  ).length;
  const approvalRate = totalRequests ? Math.round((approved / totalRequests) * 100) : 0;
  const deals = requests.filter((r) => r.status === "deal_done").length;
  const revenue = subs
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + (s.amountEgp ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="font-display text-3xl font-bold mb-6">{t("nav.admin", lang)}</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Kpi label={t("ad.kpi.requests", lang)} value={String(totalRequests)} />
          <Kpi label={t("ad.kpi.approval", lang)} value={`${approvalRate}%`} />
          <Kpi label={t("ad.kpi.deals", lang)} value={String(deals)} />
          <Kpi label={t("ad.kpi.revenue", lang)} value={fmtPrice(revenue, lang)} />
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="requests">{t("ad.tab.requests", lang)}</TabsTrigger>
            <TabsTrigger value="calendar">{t("ad.tab.calendar", lang)}</TabsTrigger>
            <TabsTrigger value="listings">{t("ad.tab.listings", lang)}</TabsTrigger>
            <TabsTrigger value="users">{t("ad.tab.users", lang)}</TabsTrigger>
          </TabsList>

          {/* Request queue */}
          <TabsContent value="requests" className="mt-6 space-y-3">
            {requests.length === 0 ? (
              <Empty />
            ) : (
              requests.map((r) => {
                const buyer = getUser(r.requesterId);
                const seller = getUser(r.listingOwnerId);
                return (
                  <div key={r.id} className="surface-card p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <RequestStatusBadge status={r.status} />
                      <span className="text-xs text-muted-foreground">{fmtDateTime(r.createdAt, lang)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">{lang === "ar" ? "المشتري" : "Buyer"}</p>
                        <p className="font-medium">{buyer?.name} · {buyer ? t(`at.${buyer.accountType}`, lang) : ""}</p>
                        <p className="text-xs text-muted-foreground">{buyer?.whatsapp}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{lang === "ar" ? "البائع" : "Seller"}</p>
                        <p className="font-medium">{seller?.name} · {seller ? t(`at.${seller.accountType}`, lang) : ""}</p>
                        <p className="text-xs text-muted-foreground">{seller?.whatsapp}</p>
                      </div>
                    </div>
                    {r.stageNotes && <p className="text-xs italic text-muted-foreground">"{r.stageNotes}"</p>}
                    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                      {r.status === "pending_admin" && (
                        <>
                          <Button size="sm" onClick={() => setRequestStatus(r.id, "pending_seller")}>
                            {t("g.approve", lang)}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setRequestStatus(r.id, "rejected", {
                                reason: prompt(lang === "ar" ? "السبب؟" : "Reason?") ?? undefined,
                              })
                            }
                          >
                            {t("g.reject", lang)}
                          </Button>
                        </>
                      )}
                      <select
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={r.status}
                        onChange={(e) => setRequestStatus(r.id, e.target.value as RequestStatus)}
                      >
                        {PROGRESS.map((s) => (
                          <option key={s} value={s}>
                            {t(`rq.status.${s}`, lang)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Calendar / Slots */}
          <TabsContent value="calendar" className="mt-6 space-y-4">
            <SlotForm />
            <div className="space-y-2">
              {slots.length === 0 ? (
                <Empty />
              ) : (
                slots.map((s) => (
                  <div key={s.id} className="surface-card p-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{fmtDateTime(s.slotStart, lang)}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.isBooked ? (lang === "ar" ? "محجوز" : "Booked") : (lang === "ar" ? "متاح" : "Open")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteSlot(s.id)}>
                      {lang === "ar" ? "حذف" : "Remove"}
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="surface-card p-4">
              <h3 className="font-semibold mb-2">{lang === "ar" ? "كل المواعيد المحجوزة" : "All booked appointments"}</h3>
              {appts.length === 0 ? (
                <Empty />
              ) : (
                appts.map((a) => {
                  const u = getUser(a.userId);
                  return (
                    <div key={a.id} className="flex justify-between text-sm border-b border-border last:border-0 py-2">
                      <span>{fmtDateTime(a.scheduledAt, lang)} · {u?.name}</span>
                      <span className="text-muted-foreground">{a.status}</span>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Listings review */}
          <TabsContent value="listings" className="mt-6 space-y-3">
            {listings.length === 0 ? (
              <Empty />
            ) : (
              listings.map((l) => {
                const owner = getUser(l.userId);
                return (
                  <div key={l.id} className="surface-card p-4 flex items-center gap-4 justify-between flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ListingStatusBadge status={l.status} />
                        <span className="text-xs text-muted-foreground">{fmtDate(l.createdAt, lang)}</span>
                      </div>
                      <p className="font-medium">
                        {t(`pt.${l.propertyType}`, lang)} · {l.area} · {fmtPrice(l.priceEgp, lang)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {owner?.name} ({owner ? t(`at.${owner.accountType}`, lang) : ""})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {l.status === "pending_review" && (
                        <>
                          <Button size="sm" onClick={() => setListingStatus(l.id, "active")}>
                            {t("g.approve", lang)}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setListingStatus(l.id, "rejected", prompt(lang === "ar" ? "السبب؟" : "Reason?") ?? undefined)
                            }
                          >
                            {t("g.reject", lang)}
                          </Button>
                        </>
                      )}
                      {l.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => setListingStatus(l.id, "closed")}>
                          {lang === "ar" ? "إغلاق" : "Close"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="mt-6 space-y-2">
            {users.map((u) => {
              const sub = subs.find((s) => s.userId === u.id && s.isActive);
              return (
                <div key={u.id} className="surface-card p-3 flex items-center justify-between text-sm flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{u.name} {u.isAdmin && "👑"}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.email} · {u.whatsapp} · {t(`at.${u.accountType}`, lang)}
                    </p>
                  </div>
                  <span className="text-xs rounded-pill border border-border px-2 py-0.5">
                    {sub ? t(`pr.plan.${sub.plan}`, lang) : t("pr.plan.free", lang)}
                  </span>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Empty() {
  const lang = useLang();
  return <div className="surface-card p-10 text-center text-muted-foreground">{t("g.empty", lang)}</div>;
}

function SlotForm() {
  const lang = useLang();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);

  function add(e: FormEvent) {
    e.preventDefault();
    if (!date || !time) return;
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + duration * 60000);
    saveSlot({
      id: uid(),
      createdAt: nowISO(),
      slotStart: start.toISOString(),
      slotEnd: end.toISOString(),
      isBooked: false,
    });
    setDate("");
    setTime("");
  }

  return (
    <form onSubmit={add} className="surface-card p-4 flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">{lang === "ar" ? "اليوم" : "Date"}</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{lang === "ar" ? "الوقت" : "Time"}</Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{lang === "ar" ? "المدة (دقيقة)" : "Duration (min)"}</Label>
        <Input type="number" min={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-24" />
      </div>
      <Button type="submit" className="bg-gradient-gold text-primary-foreground">
        {lang === "ar" ? "إضافة معاد متاح" : "Add slot"}
      </Button>
    </form>
  );
}
