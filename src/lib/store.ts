import type { Listing, SeekerProfile } from "./types";
import { SEED_LISTINGS } from "./seed";

const KEYS = {
  profile: "samalot.profile",
  listings: "samalot.listings",
  seeded: "samalot.seeded.v1",
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
