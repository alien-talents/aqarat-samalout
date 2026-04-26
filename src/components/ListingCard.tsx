import { Link } from "react-router-dom";
import { MapPin, Maximize2, BedDouble, Crown, Heart, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";
import { isSaved, toggleSaved, listingStatus } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ListingCard({ listing, showStatus }: { listing: Listing; showStatus?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isSaved(listing.id));
    sync();
    window.addEventListener("samalot:saved-changed", sync);
    return () => window.removeEventListener("samalot:saved-changed", sync);
  }, [listing.id]);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleSaved(listing.id);
    toast.success(next ? "تم حفظ الإعلان" : "تم إزالة الإعلان من المحفوظات");
  };

  const status = listingStatus(listing);

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group surface-card overflow-hidden block transition-all hover:shadow-elevated hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.images[0] && (
          <img
            src={listing.images[0]}
            alt={listing.titleAr}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className={`pill !py-1 !px-2.5 !text-[11px] ${
            listing.priceType === "sale" ? "bg-primary text-primary-foreground border-primary" : "bg-success text-success-foreground border-success"
          }`}>
            {listing.priceType === "sale" ? "للبيع" : "للإيجار"}
          </span>
          {listing.isFeatured && (
            <span className="pill !py-1 !px-2.5 !text-[11px] bg-gradient-gold text-primary-foreground border-transparent">
              <Crown className="h-3 w-3" /> مميز
            </span>
          )}
          {showStatus && status === "pending" && (
            <span className="pill !py-1 !px-2.5 !text-[11px] bg-warning/20 text-warning border-warning/40">
              <Clock className="h-3 w-3" /> قيد المراجعة
            </span>
          )}
          {showStatus && status === "expired" && (
            <span className="pill !py-1 !px-2.5 !text-[11px] bg-muted text-muted-foreground border-border">
              منتهي
            </span>
          )}
        </div>
        <button
          onClick={onSave}
          aria-label={saved ? "إزالة من المحفوظات" : "حفظ الإعلان"}
          className={cn(
            "absolute top-3 left-3 h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all",
            saved
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-foreground hover:bg-background"
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-muted-foreground">{PROPERTY_TYPE_LABELS[listing.propertyType]}</span>
          <span className="font-display text-lg font-bold text-primary ltr-num">
            {listing.price.toLocaleString("en-US")} {listing.priceType === "rent" ? "/شهر" : ""}
            <span className="text-xs font-body text-muted-foreground mr-1">جنيه</span>
          </span>
        </div>
        <h3 className="font-bold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {listing.titleAr}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{listing.locationName}</span>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="ltr-num">{listing.areaSqm}</span> م²
          </span>
          {listing.rooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              <span className="ltr-num">{listing.rooms}</span> غرف
            </span>
          )}
          {listing.listerType !== "individual" && (
            <span className="mr-auto text-primary">
              {listing.listerType === "office" ? "مكتب" : "وسيط"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
