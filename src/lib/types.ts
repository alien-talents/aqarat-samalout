// Domain types for عقارات سمالوط
export type Intent = "buy" | "rent" | "sell" | "both";
export type Reason = "live" | "invest" | "sidehustle" | "necessity" | "relocate";
export type Timeline = "3m" | "6m" | "1y";
export type PriceType = "sale" | "rent";
export type PropertyType =
  | "apartment"
  | "house"
  | "land_agri"
  | "land_build"
  | "commercial"
  | "building";
export type PackageType = "basic" | "featured" | "office";
export type ListerType = "individual" | "broker" | "office";

export interface SeekerProfile {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  intent: Intent;
  reason: Reason;
  locations: string[];
  propertyTypes: PropertyType[];
  areaPref: string;
  roomsPref: string;
  budgetMax: number;
  timeline: Timeline;
  lifestyleTags: string[];
  locationNotes: string;
  extraNotes: string;
  isNotified: boolean;
}

export interface Listing {
  id: string;
  createdAt: string;
  titleAr: string;
  descriptionAr: string;
  price: number;
  priceType: PriceType;
  propertyType: PropertyType;
  areaSqm: number;
  rooms: number;
  floor: number;
  locationName: string;       // specific area/village name e.g. "وسط البلد"
  locationArea: "samalot" | "village";
  villageName?: string;
  phone: string;
  whatsapp: string;
  images: string[];           // URLs (data URLs in MVP)
  isFeatured: boolean;
  isApproved: boolean;
  packageType: PackageType;
  listerType: ListerType;
  listerName: string;
  expiresAt: string;
}

export const AREAS = [
  "سمالوط — وسط البلد",
  "عزبة سلمان",
  "الشيخ فضل",
  "ههيا",
  "بني أحمد",
  "دير البرشا",
  "ملوي (قريب)",
];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "شقة",
  house: "منزل",
  land_agri: "أرض زراعية",
  land_build: "أرض بناء",
  commercial: "محل تجاري",
  building: "عمارة",
};

export const INTENT_LABELS: Record<Intent, string> = {
  buy: "شراء عقار",
  rent: "استئجار",
  sell: "بيع عقار",
  both: "بيع وشراء",
};

export const REASON_LABELS: Record<Reason, string> = {
  live: "سكن واستقرار",
  invest: "استثمار شخصي",
  sidehustle: "دخل إضافي",
  necessity: "ضرورة أو ظرف",
  relocate: "سفر أو انتقال",
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  "3m": "خلال 3 شهور",
  "6m": "خلال 6 شهور",
  "1y": "خلال سنة",
};

export const LIFESTYLE_TAGS = [
  "هادية وعيلية",
  "قريبة من المدارس",
  "قريبة من المستشفيات",
  "على طريق رئيسي",
  "بعيدة عن الضوضاء",
  "قريبة من المساجد",
  "في منطقة شعبية / متوسطة",
  "راقية / هادية",
  "قريبة من الزراعة والطبيعة",
  "سهولة الانتقال للقاهرة",
];

export const PACKAGES: Record<
  PackageType,
  { label: string; price: number; days: number; desc: string }
> = {
  basic: { label: "إعلان عادي", price: 30, days: 30, desc: "إعلان قياسي لمدة 30 يوم" },
  featured: { label: "إعلان مميز", price: 100, days: 60, desc: "يظهر دائماً في المقدمة + شارة ذهبية" },
  office: { label: "اشتراك مكتب", price: 200, days: 30, desc: "إعلانات غير محدودة + شارة مكتب" },
};
