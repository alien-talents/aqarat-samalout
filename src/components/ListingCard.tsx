import { Link } from "react-router-dom";
import { Lock, MapPin, Maximize2, Sparkles } from "lucide-react";
import type { Listing, User } from "@/lib/types";
import { fmtPrice, fmtSqm, t, useLang } from "@/lib/i18n";
import { getUser } from "@/lib/store";

export function ListingCard({ listing }: { listing: Listing }) {
  const lang = useLang();
  const owner: User | undefined = getUser(listing.userId);

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="surface-card group overflow-hidden hover:shadow-elevated transition-shadow flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {/* Photos blurred for non-subscribers — done via CSS in panel; card shows a neutral cover */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Lock className="h-7 w-7 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-medium">{t("card.locked_photos", lang)}</p>
          </div>
        </div>
        {listing.isFeatured && (
          <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-pill bg-gradient-gold text-primary-foreground px-2.5 py-1 text-xs font-medium shadow-sm">
            <Sparkles className="h-3 w-3" />
            {t("card.featured", lang)}
          </span>
        )}
        <span className="absolute top-3 end-3 rounded-pill bg-background/90 px-2.5 py-1 text-xs font-medium border border-border">
          {t(`lt.${listing.listingType}`, lang)}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display font-bold text-lg gradient-text">
            {fmtPrice(listing.priceEgp, lang)}
          </span>
          <span className="text-xs text-muted-foreground">
            {t(`prc.${listing.priceType}`, lang)}
          </span>
        </div>

        <div className="text-sm font-medium line-clamp-1">
          {t(`pt.${listing.propertyType}`, lang)} · {fmtSqm(listing.areaSqm, lang)}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {listing.area}, {listing.city}
          </span>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-border">
          <span className="text-muted-foreground">
            {owner ? t(`at.${owner.accountType}`, lang) : "—"}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Maximize2 className="h-3 w-3" />
            {listing.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
