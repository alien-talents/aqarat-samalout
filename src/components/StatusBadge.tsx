import type { ListingStatus, RequestStatus } from "@/lib/types";
import { t, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  // listing
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-warning/15 text-warning border-warning/30",
  active: "bg-success/15 text-success border-success/30",
  closed: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  // request
  pending_admin: "bg-warning/15 text-warning border-warning/30",
  pending_seller: "bg-primary/15 text-primary border-primary/30",
  accepted: "bg-success/15 text-success border-success/30",
  appointment_scheduled: "bg-primary/15 text-primary border-primary/30",
  in_discussion: "bg-secondary text-secondary-foreground",
  negotiating: "bg-secondary text-secondary-foreground",
  deal_done: "bg-success text-success-foreground",
  deal_failed: "bg-destructive/15 text-destructive border-destructive/30",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const lang = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border border-transparent px-2.5 py-0.5 text-xs font-medium",
        COLORS[status],
      )}
    >
      {t(`ls.${status}`, lang)}
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const lang = useLang();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border border-transparent px-2.5 py-0.5 text-xs font-medium",
        COLORS[status],
      )}
    >
      {t(`rq.status.${status}`, lang)}
    </span>
  );
}
