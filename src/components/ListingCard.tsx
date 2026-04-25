import { Link } from "react-router-dom";
import { MapPin, Maximize2, BedDouble, Crown } from "lucide-react";
import type { Listing } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
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
        </div>
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
