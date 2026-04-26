import type { Listing, Report, SeekerProfile } from "./types";
import { SEED_LISTINGS } from "./seed";

const KEYS = {
  profile: "samalot.profile",
  listings: "samalot.listings",
  seeded: "samalot.seeded.v1",
  saved: "samalot.saved",
  reports: "samalot.reports",
} as const;

// ---------- Profile ----------
export function getProfile(): SeekerProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    return raw ? (JSON.parse(raw) as SeekerProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: SeekerProfile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("samalot:profile-changed"));
}

export function clearProfile() {
  localStorage.removeItem(KEYS.profile);
  window.dispatchEvent(new CustomEvent("samalot:profile-changed"));
}

// ---------- Listings ----------
function ensureSeed() {
  if (localStorage.getItem(KEYS.seeded) !== "1") {
    localStorage.setItem(KEYS.listings, JSON.stringify(SEED_LISTINGS));
    localStorage.setItem(KEYS.seeded, "1");
  }
}

export function getListings(): Listing[] {
  ensureSeed();
  try {
    const raw = localStorage.getItem(KEYS.listings);
    return raw ? (JSON.parse(raw) as Listing[]) : [];
  } catch {
    return [];
  }
}

export function getListing(id: string): Listing | undefined {
  return getListings().find((l) => l.id === id);
}

export function saveListing(l: Listing) {
  const all = getListings();
  const idx = all.findIndex((x) => x.id === l.id);
  if (idx >= 0) all[idx] = l;
  else all.unshift(l);
  localStorage.setItem(KEYS.listings, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("samalot:listings-changed"));
}

export function deleteListing(id: string) {
  const all = getListings().filter((l) => l.id !== id);
  localStorage.setItem(KEYS.listings, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("samalot:listings-changed"));
}

export function approveListing(id: string, approved: boolean) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, isApproved: approved });
}

// ---------- Matching (rule-based, per PRD §7) ----------
export function matchScore(listing: Listing, profile: SeekerProfile): number {
  let score = 0;
  if (profile.locations.includes(listing.locationName)) score++;
  if (listing.price <= profile.budgetMax) score++;
  if (profile.propertyTypes.includes(listing.propertyType)) score++;
  return score;
}

export function uid() {
  return crypto.randomUUID();
}

export function nowISO() {
  return new Date().toISOString();
}

// ---------- Saved listings ----------
export function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.saved);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  localStorage.setItem(KEYS.saved, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("samalot:saved-changed"));
  return next.includes(id);
}

export function getSavedListings(): Listing[] {
  const ids = new Set(getSavedIds());
  return getListings().filter((l) => ids.has(l.id));
}

// ---------- Reports ----------
export function getReports(): Report[] {
  try {
    const raw = localStorage.getItem(KEYS.reports);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

export function addReport(r: Report) {
  const all = getReports();
  all.unshift(r);
  localStorage.setItem(KEYS.reports, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("samalot:reports-changed"));
}

export function resolveReport(id: string) {
  const all = getReports().map((r) => (r.id === id ? { ...r, resolved: true } : r));
  localStorage.setItem(KEYS.reports, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("samalot:reports-changed"));
}

// ---------- View / WhatsApp tracking ----------
export function trackView(id: string) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, views: (l.views || 0) + 1 });
}

export function trackWaClick(id: string) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, waClicks: (l.waClicks || 0) + 1 });
}

// ---------- Lister: my listings (matched by phone) ----------
export function getMyListings(phone: string): Listing[] {
  const clean = (s: string) => s.replace(/[^\d]/g, "").slice(-10);
  const key = clean(phone);
  if (!key) return [];
  return getListings().filter((l) => clean(l.phone) === key || clean(l.whatsapp) === key);
}

export function isExpired(l: Listing): boolean {
  return new Date(l.expiresAt).getTime() < Date.now();
}

export function listingStatus(l: Listing): "pending" | "live" | "expired" | "rejected" {
  if (l.rejectionReason) return "rejected";
  if (!l.isApproved) return "pending";
  if (isExpired(l)) return "expired";
  return "live";
}

export function renewListing(id: string, days: number) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, expiresAt: new Date(Date.now() + days * 86400000).toISOString() });
}

// ---------- Matched seekers (for admin notify) ----------
export function getMatchedSeekers(listing: Listing): { profile: SeekerProfile; score: number }[] {
  const p = getProfile();
  if (!p) return [];
  const score = matchScore(listing, p);
  return score >= 1 ? [{ profile: p, score }] : [];
}

export function rejectListing(id: string, reason: string) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, isApproved: false, rejectionReason: reason });
}

export function markPaid(id: string, paid: boolean) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, isPaid: paid, paidAt: paid ? nowISO() : undefined });
}
