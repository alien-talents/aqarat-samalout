import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Eye, Trash2, X, Clock, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { approveListing, deleteListing, getListings } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "pending" | "approved" | "all";

export default function Admin() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [tab, setTab] = useState<Tab>("pending");

  const refresh = () => setListings(getListings());

  useEffect(() => {
    refresh();
    window.addEventListener("samalot:listings-changed", refresh);
    return () => window.removeEventListener("samalot:listings-changed", refresh);
  }, []);

  const counts = useMemo(() => ({
    pending: listings.filter((l) => !l.isApproved).length,
    approved: listings.filter((l) => l.isApproved).length,
    all: listings.length,
  }), [listings]);

  const filtered = listings.filter((l) =>
    tab === "pending" ? !l.isApproved : tab === "approved" ? l.isApproved : true
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-10 flex-1">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
              <ListChecks className="h-7 w-7 text-primary" /> لوحة الإدارة
            </h1>
            <p className="text-muted-foreground mt-1">مراجعة الإعلانات والموافقة عليها قبل النشر</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="في الانتظار" value={counts.pending} highlight />
            <Stat label="منشور" value={counts.approved} />
            <Stat label="الإجمالي" value={counts.all} />
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {([
            { id: "pending", label: "في انتظار المراجعة" },
            { id: "approved", label: "منشور" },
            { id: "all", label: "الكل" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span className="mr-1.5 text-xs ltr-num">({t.id === "pending" ? counts.pending : t.id === "approved" ? counts.approved : counts.all})</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="surface-card p-12 text-center text-muted-foreground">
            مفيش إعلانات في هذا التبويب
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => (
              <AdminRow
                key={l.id}
                listing={l}
                onApprove={() => {
                  approveListing(l.id, !l.isApproved);
                  toast.success(l.isApproved ? "تم إخفاء الإعلان" : "تم نشر الإعلان");
                }}
                onDelete={() => {
                  if (confirm("متأكد من حذف الإعلان؟")) {
                    deleteListing(l.id);
                    toast.success("تم حذف الإعلان");
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("surface-card px-4 py-3 text-center min-w-[90px]", highlight && "border-primary/40")}>
      <div className={cn("font-display text-2xl font-bold ltr-num", highlight && "text-primary")}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function AdminRow({ listing, onApprove, onDelete }: { listing: Listing; onApprove: () => void; onDelete: () => void }) {
  return (
    <div className="surface-card p-4 flex flex-col md:flex-row gap-4 items-start">
      <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
        {listing.images[0] && <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {!listing.isApproved ? (
            <span className="pill !py-0.5 !px-2 !text-[10px] bg-warning/20 text-warning border-warning/40">
              <Clock className="h-3 w-3" /> في الانتظار
            </span>
          ) : (
            <span className="pill !py-0.5 !px-2 !text-[10px] bg-success/20 text-success border-success/40">
              <Check className="h-3 w-3" /> منشور
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {PROPERTY_TYPE_LABELS[listing.propertyType]} • {listing.locationName}
          </span>
        </div>
        <h3 className="font-bold truncate">{listing.titleAr}</h3>
        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3">
          <span>المُعلِن: <span className="text-foreground">{listing.listerName}</span></span>
          <span>السعر: <span className="text-primary font-bold ltr-num">{listing.price.toLocaleString("en-US")}</span> جنيه</span>
          <span>الباقة: {listing.packageType === "basic" ? "عادي" : listing.packageType === "featured" ? "مميز" : "مكتب"}</span>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Link to={`/listing/${listing.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 ml-1" /> معاينة
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={onApprove}
          className={listing.isApproved ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-success text-success-foreground hover:bg-success/90"}
        >
          {listing.isApproved ? (<><X className="h-4 w-4 ml-1" /> إخفاء</>) : (<><Check className="h-4 w-4 ml-1" /> موافقة</>)}
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
