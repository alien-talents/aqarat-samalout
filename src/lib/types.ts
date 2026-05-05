// Samalot Real Estate — PRD v2 domain types
// Mirrors §9 Database Schema, frontend-only (localStorage)

export type AccountType = "individual" | "broker" | "office" | "developer";
export type GeneralGoal = "sell" | "buy" | "both";

export type SellReason =
  | "housing"
  | "investment"
  | "emergency"
  | "travel"
  | "local_move"
  | "no_longer_needed";

export type BuyReason = "housing" | "investment" | "rental_income" | "family_future";

export type Timeline = "under_1m" | "3m" | "6m" | "1y" | "flexible";

export type PlatformGoal =
  | "faster_sales"
  | "organized_sales"
  | "reach_buyers"
  | "geographic_expansion";

export type PropertyType =
  | "residential"
  | "commercial"
  | "agricultural"
  | "industrial"
  | "mountain";

export type ListingType = "sell" | "buy" | "swap";
export type PriceType = "fixed" | "negotiable" | "discussable";
export type ListingStatus = "draft" | "pending_review" | "active" | "closed" | "rejected";

export type SubscriptionPlan = "free" | "basic" | "premium";

export type RequestStatus =
  | "pending_admin"
  | "pending_seller"
  | "accepted"
  | "rejected"
  | "appointment_scheduled"
  | "in_discussion"
  | "negotiating"
  | "deal_done"
  | "deal_failed";

export type AppointmentStatus = "pending" | "confirmed" | "done" | "missed" | "cancelled";

export type NotificationType =
  | "request_received"
  | "request_approved_by_admin"
  | "request_accepted_by_seller"
  | "request_rejected"
  | "appointment_confirmed"
  | "appointment_reminder"
  | "deal_done"
  | "deal_failed"
  | "listing_approved"
  | "listing_rejected";

// ---------- Tables ----------

export interface User {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  whatsapp: string;
  // NOTE: localStorage-only mock; never use for real auth.
  passwordHash: string;
  accountType: AccountType;
  isActive: boolean;
  isVerified: boolean;
  isAdmin?: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  // shared
  governorate?: string;
  city?: string;
  area?: string;
  generalGoal?: GeneralGoal;
  // individual
  sellReason?: SellReason;
  buyReason?: BuyReason;
  shortTermGoal?: string;
  longTermGoal?: string;
  budgetEgp?: number;
  timeline?: Timeline;
  // company / office
  entityName?: string;
  platformGoal?: PlatformGoal;
  portfolioSize?: number;
  // preferences (all)
  preferredTypes?: PropertyType[];
  preferredAreas?: string[];
  areaSqmMin?: number;
  areaSqmMax?: number;
  specialization?: string;
  extraNotes?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startedAt: string;
  expiresAt?: string;
  isActive: boolean;
  paymentRef?: string;
  amountEgp?: number;
}

export interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;

  listingType: ListingType;
  propertyType: PropertyType;

  // public location
  governorate: string;
  city: string;
  area: string;

  // hidden until appointment approval
  fullAddress?: string;

  // public specs
  areaSqm: number;
  priceEgp: number;
  priceType: PriceType;

  // subscriber-only
  description: string;
  images: string[];
  videoUrl?: string;

  // hidden contact
  contactPhone: string;

  status: ListingStatus;
  rejectionReason?: string;
  adminNotes?: string;
  isFeatured: boolean;
  viewCount: number;
}

export interface AppointmentRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  listingId: string;
  listingOwnerId: string;
  status: RequestStatus;
  rejectionReason?: string;
  adminNotes?: string;
  stageNotes?: string;
  requesterApptId?: string;
  ownerApptId?: string;
}

export interface AvailableSlot {
  id: string;
  createdAt: string;
  slotStart: string;
  slotEnd: string;
  isBooked: boolean;
  bookedFor?: string; // appointment id
}

export interface Appointment {
  id: string;
  createdAt: string;
  userId: string;
  requestId: string;
  slotId: string;
  scheduledAt: string;
  durationMin: number;
  status: AppointmentStatus;
  adminNotes?: string;
}

export interface Notification {
  id: string;
  createdAt: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  isRead: boolean;
  relatedId?: string;
}

// ---------- Constants ----------

export const ACCOUNT_TYPES: AccountType[] = ["individual", "broker", "office", "developer"];
export const PROPERTY_TYPES: PropertyType[] = [
  "residential",
  "commercial",
  "agricultural",
  "industrial",
  "mountain",
];
export const LISTING_TYPES: ListingType[] = ["sell", "buy", "swap"];
export const PRICE_TYPES: PriceType[] = ["fixed", "negotiable", "discussable"];
export const TIMELINES: Timeline[] = ["under_1m", "3m", "6m", "1y", "flexible"];
export const SELL_REASONS: SellReason[] = [
  "housing",
  "investment",
  "emergency",
  "travel",
  "local_move",
  "no_longer_needed",
];
export const BUY_REASONS: BuyReason[] = ["housing", "investment", "rental_income", "family_future"];
export const PLATFORM_GOALS: PlatformGoal[] = [
  "faster_sales",
  "organized_sales",
  "reach_buyers",
  "geographic_expansion",
];

export const SUBSCRIPTION_PLANS: {
  plan: SubscriptionPlan;
  priceEgp: number;
  durationDays: number;
}[] = [
  { plan: "free", priceEgp: 0, durationDays: 36500 },
  { plan: "basic", priceEgp: 199, durationDays: 30 },
  { plan: "premium", priceEgp: 499, durationDays: 30 },
];

// Both-pay model: sellers pay a small flat listing fee
export const SELLER_LISTING_FEE_EGP = 50;
