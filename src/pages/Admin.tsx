import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, Eye, Trash2, X, Clock, ListChecks, Flag, Users, Bell, DollarSign,
  Building2, ShieldCheck, Send, AlertTriangle, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  approveListing, deleteListing, getListings, getProfile, getReports, listingStatus,
  markPaid, matchScore, rejectListing, resolveReport,
} from "@/lib/store";
import type { Listing, Report } from "@/lib/types";
import { PROPERTY_TYPE_LABELS, PACKAGES, INTENT_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [rejecting, setRejecting] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const refresh = () => {
    setListings(getListings());
    setReports(getReports());
  };

  useEffect(() => {
    refresh();
    window.addEventListener("samalot:listings-changed", refresh);
    window.addEventListener("samalot:reports-changed", refresh);
    return () => {
      window.removeEventListener("samalot:listings-changed", refresh);
      window.removeEventListener("samalot:reports-changed", refresh);
    };
  }, []);

  const stats = useMemo(() => {
    const pending = listings.filter((l) => !l.isApproved && !l.rejectionReason);
    const approved = listings.filter((l) => l.isApproved);
    const rejected = listings.filter((l) => !!l.rejectionReason);
    const live = approved.filter((l) => new Date(l.expiresAt).getTime() > Date.now());
    const paidThisMonth = listings.filter((l) => {
      if (!l.isPaid || !l.paidAt) return false;
      const d = new Date(l.paidAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const revenue = paidThisMonth.reduce((sum, l) => sum + PACKAGES[l.packageType].price, 0);
    const profile = getProfile();
    return {
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      live: live.length,
      reports: reports.filter((r) => !r.resolved).length,
      seekers: profile ? 1 : 0,
      revenue,
      totalListings: listings.length,
    };
  }, [listings, reports]);

  const pending = listings.filter((l) => !l.isApproved && !l.rejectionReason);
  const allReports = reports;

  const onReject = () => {
    if (!rejecting || !rejectReason.trim()) {
      toast.error("اكتب سبب الرفض");
      return;
    }
    rejectListing(rejecting.id, rejectReason.trim());
    toast.success("تم رفض الإعلان مع إرسال السبب");
    setRejecting(null);
    setRejectReason("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-10 flex-1">
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" /> لوحة الإدارة
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الإعلانات، الباحثين، البلاغات، والإيرادات</p>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Kpi icon={Clock} label="في انتظار المراجعة" value={stats.pending} highlight />
          <Kpi icon={Building2} label="إعلان منشور" value={stats.live} />
          <Kpi icon={Users} label="باحثون مسجلون" value={stats.seekers} />
          <Kpi icon={DollarSign} label="إيراد الشهر (جنيه)" value={stats.revenue} />
        </div>

        <Tabs defaultValue="approval" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="approval">
              <Clock className="h-4 w-4 ml-1.5" />
              المراجعة <span className="mr-1.5 ltr-num text-xs">({stats.pending})</span>
            </TabsTrigger>
            <TabsTrigger value="listings">
              <ListChecks className="h-4 w-4 ml-1.5" />
              كل الإعلانات
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Flag className="h-4 w-4 ml-1.5" />
              البلاغات <span className="mr-1.5 ltr-num text-xs">({stats.reports})</span>
            </TabsTrigger>
            <TabsTrigger value="seekers">
              <Users className="h-4 w-4 ml-1.5" />
              الباحثون
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 ml-1.5" />
              الإيرادات
            </TabsTrigger>
          </TabsList>

          {/* Approval Queue */}
          <TabsContent value="approval" className="space-y-3">
            {pending.length === 0 ? (
              <EmptyState text="مفيش إعلانات في انتظار المراجعة" />
            ) : (
              pending.map((l) => (
                <AdminRow
                  key={l.id}
                  listing={l}
                  onApprove={() => {
                    approveListing(l.id, true);
                    toast.success("تم نشر الإعلان");
                  }}
                  onReject={() => setRejecting(l)}
                  onDelete={() => {
                    if (confirm("متأكد من حذف الإعلان؟")) {
                      deleteListing(l.id);
                      toast.success("تم الحذف");
                    }
                  }}
                />
              ))
            )}
          </TabsContent>

          {/* All listings */}
          <TabsContent value="listings" className="space-y-3">
            {listings.length === 0 ? (
              <EmptyState text="لسه مفيش إعلانات" />
            ) : (
              listings.map((l) => (
                <AdminRow
                  key={l.id}
                  listing={l}
                  showNotify
                  onApprove={() => {
                    approveListing(l.id, !l.isApproved);
                    toast.success(l.isApproved ? "تم الإخفاء" : "تم النشر");
                  }}
                  onReject={() => setRejecting(l)}
                  onDelete={() => {
                    if (confirm("متأكد من حذف الإعلان؟")) {
                      deleteListing(l.id);
                      toast.success("تم الحذف");
                    }
                  }}
                  onMarkPaid={() => {
                    markPaid(l.id, !l.isPaid);
                    toast.success(l.isPaid ? "تم التراجع عن الدفع" : "تم تسجيل الدفع");
                  }}
                />
              ))
            )}
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-3">
            {allReports.length === 0 ? (
              <EmptyState text="مفيش بلاغات حالياً" />
            ) : (
              allReports.map((r) => {
                const l = listings.find((x) => x.id === r.listingId);
                return (
                  <div key={r.id} className={cn("surface-card p-4", r.resolved && "opacity-60")}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="pill !py-0.5 !px-2 !text-[10px] bg-destructive/20 text-destructive border-destructive/40">
                            <AlertTriangle className="h-3 w-3" /> {r.reason}
                          </span>
                          {r.resolved && (
                            <span className="pill !py-0.5 !px-2 !text-[10px] bg-success/20 text-success border-success/40">
                              <Check className="h-3 w-3" /> تم الحل
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground ltr-num">
                            {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        <h3 className="font-bold truncate">
                          {l ? l.titleAr : "[الإعلان محذوف]"}
                        </h3>
                        {r.notes && <p className="text-sm text-muted-foreground mt-1">{r.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        {l && (
                          <Link to={`/listing/${l.id}`}>
                            <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                          </Link>
                        )}
                        {!r.resolved && (
                          <Button size="sm" onClick={() => { resolveReport(r.id); toast.success("تم تأكيد البلاغ"); }}>
                            <Check className="h-4 w-4 ml-1" /> تم الحل
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Seekers */}
          <TabsContent value="seekers">
            <SeekersPanel listings={listings.filter((l) => l.isApproved)} />
          </TabsContent>

          {/* Revenue */}
          <TabsContent value="revenue">
            <RevenuePanel listings={listings} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject reason dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">رفض الإعلان</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value.slice(0, 300))}
            placeholder="اكتب سبب الرفض (مثال: صور غير حقيقية، معلومات ناقصة...)"
            rows={4}
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setRejecting(null)}>إلغاء</Button>
            <Button onClick={onReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("surface-card p-4", highlight && "border border-primary/40")}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={cn("font-display text-2xl font-bold ltr-num", highlight && "text-primary")}>
        {value.toLocaleString("en-US")}
      </div>
    </div>
  );
}

function AdminRow({
  listing, onApprove, onReject, onDelete, onMarkPaid, showNotify,
}: {
  listing: Listing;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onMarkPaid?: () => void;
  showNotify?: boolean;
}) {
  const status = listingStatus(listing);
  const profile = getProfile();
  const matchedCount = profile && matchScore(listing, profile) >= 1 ? 1 : 0;

  const sendNotify = () => {
    if (!profile) {
      toast.error("لا يوجد باحثون مسجلون بعد");
      return;
    }
    const wa = `https://wa.me/${profile.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`عرض جديد يناسب اهتماماتك: ${listing.titleAr}`)}`;
    window.open(wa, "_blank");
    toast.success(`تم فتح واتساب لإرسال إشعار لـ ${matchedCount} باحث`);
  };

  return (
    <div className="surface-card p-4 flex flex-col md:flex-row gap-4 items-start">
      <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
        {listing.images[0] && <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <StatusBadge status={status} />
          {listing.isPaid && (
            <span className="pill !py-0.5 !px-2 !text-[10px] bg-success/20 text-success border-success/40">
              <Check className="h-3 w-3" /> مدفوع
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {PROPERTY_TYPE_LABELS[listing.propertyType]} • {listing.locationName}
          </span>
        </div>
        <h3 className="font-bold truncate">{listing.titleAr}</h3>
        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
          <span>المُعلِن: <span className="text-foreground">{listing.listerName}</span></span>
          <span>السعر: <span className="text-primary font-bold ltr-num">{listing.price.toLocaleString("en-US")}</span> جنيه</span>
          <span>الباقة: {PACKAGES[listing.packageType].label}</span>
          <span className="ltr-num" dir="ltr">{listing.phone}</span>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto flex-wrap">
        <Link to={`/listing/${listing.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 ml-1" /> معاينة
          </Button>
        </Link>
        {showNotify && status === "live" && (
          <Button variant="outline" size="sm" onClick={sendNotify}>
            <Send className="h-4 w-4 ml-1" /> إشعار <span className="ltr-num">({matchedCount})</span>
          </Button>
        )}
        {onMarkPaid && (
          <Button variant="outline" size="sm" onClick={onMarkPaid}>
            <DollarSign className="h-4 w-4 ml-1" /> {listing.isPaid ? "إلغاء" : "تسجيل دفع"}
          </Button>
        )}
        <Button
          size="sm"
          onClick={onApprove}
          className={listing.isApproved ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-success text-success-foreground hover:bg-success/90"}
        >
          {listing.isApproved ? (<><X className="h-4 w-4 ml-1" /> إخفاء</>) : (<><Check className="h-4 w-4 ml-1" /> موافقة</>)}
        </Button>
        {!listing.isApproved && !listing.rejectionReason && (
          <Button variant="outline" size="sm" onClick={onReject} className="text-destructive">
            رفض
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
    pending: { label: "قيد المراجعة", cls: "bg-warning/20 text-warning border-warning/40", Icon: Clock },
    live: { label: "منشور", cls: "bg-success/20 text-success border-success/40", Icon: Check },
    expired: { label: "منتهي", cls: "bg-muted text-muted-foreground border-border", Icon: Clock },
    rejected: { label: "مرفوض", cls: "bg-destructive/20 text-destructive border-destructive/40", Icon: X },
  } as const;
  const v = map[status];
  return (
    <span className={cn("pill !py-0.5 !px-2 !text-[10px]", v.cls)}>
      <v.Icon className="h-3 w-3" /> {v.label}
    </span>
  );
}

function SeekersPanel({ listings }: { listings: Listing[] }) {
  const profile = getProfile();
  if (!profile) {
    return <EmptyState text="لسه مفيش باحثون مسجلون. شارك رابط الموقع لجمع أول الباحثين." />;
  }
  const matched = listings.filter((l) => matchScore(l, profile) >= 2);
  return (
    <div className="space-y-3">
      <div className="surface-card p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-lg">{profile.name}</h3>
            <p className="text-sm text-muted-foreground ltr-num" dir="ltr">{profile.phone}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/${profile.phone.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 ml-1" /> واتساب
              </Button>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
          <Mini label="بدور على" value={INTENT_LABELS[profile.intent]} />
          <Mini label="الميزانية" value={`${profile.budgetMax.toLocaleString("en-US")} جنيه`} ltr />
          <Mini label="المناطق" value={`${profile.locations.length} منطقة`} />
          <Mini label="عروض مناسبة" value={`${matched.length} عرض`} />
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("font-bold text-sm mt-0.5", ltr && "ltr-num")}>{value}</div>
    </div>
  );
}

function RevenuePanel({ listings }: { listings: Listing[] }) {
  const paid = listings.filter((l) => l.isPaid);
  const unpaid = listings.filter((l) => !l.isPaid && l.isApproved);
  const total = paid.reduce((s, l) => s + PACKAGES[l.packageType].price, 0);
  const pending = unpaid.reduce((s, l) => s + PACKAGES[l.packageType].price, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="surface-card p-5">
          <div className="text-xs text-muted-foreground">إجمالي المحصّل</div>
          <div className="font-display text-3xl font-bold text-primary mt-1 ltr-num">{total.toLocaleString("en-US")}</div>
          <div className="text-xs text-muted-foreground mt-1">جنيه</div>
        </div>
        <div className="surface-card p-5">
          <div className="text-xs text-muted-foreground">بانتظار التحصيل</div>
          <div className="font-display text-3xl font-bold mt-1 ltr-num">{pending.toLocaleString("en-US")}</div>
          <div className="text-xs text-muted-foreground mt-1">جنيه</div>
        </div>
      </div>
      <div className="surface-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-bold">الإعلانات المدفوعة</div>
        {paid.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">لسه مفيش مدفوعات مسجلة</div>
        ) : (
          <div className="divide-y divide-border">
            {paid.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.titleAr}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.listerName} • {PACKAGES[l.packageType].label}
                  </div>
                </div>
                <div className="text-primary font-bold ltr-num shrink-0">
                  {PACKAGES[l.packageType].price} جنيه
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="surface-card p-12 text-center text-muted-foreground">{text}</div>
  );
}
