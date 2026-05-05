import type {
  User,
  Profile,
  Listing,
  AvailableSlot,
  Subscription,
} from "./types";
import apt1 from "@/assets/listing-apartment-1.jpg";
import apt2 from "@/assets/listing-apartment-2.jpg";
import house1 from "@/assets/listing-house-1.jpg";
import land1 from "@/assets/listing-land-1.jpg";
import land2 from "@/assets/listing-land-1.jpg";
import shop1 from "@/assets/listing-shop-1.jpg";

const ago = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const inDays = (n: number, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

// Mock password hash for "demo1234" — matches store.hashPassword("demo1234")
function h(s: string) {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0;
  return `mock_${n}`;
}
const DEMO_PWD = h("demo1234");

export const SEED_USERS: User[] = [
  {
    id: "admin-1",
    createdAt: ago(60),
    name: "Admin",
    email: "admin@samalot.app",
    whatsapp: "+201000000000",
    passwordHash: DEMO_PWD,
    accountType: "office",
    isActive: true,
    isVerified: true,
    isAdmin: true,
  },
  {
    id: "user-seller-1",
    createdAt: ago(20),
    name: "Ahmed Mahmoud",
    email: "ahmed@example.com",
    whatsapp: "+201001234567",
    passwordHash: DEMO_PWD,
    accountType: "individual",
    isActive: true,
    isVerified: true,
  },
  {
    id: "user-office-1",
    createdAt: ago(40),
    name: "Nile Real Estate",
    email: "nile@example.com",
    whatsapp: "+201112223344",
    passwordHash: DEMO_PWD,
    accountType: "office",
    isActive: true,
    isVerified: true,
  },
  {
    id: "user-buyer-1",
    createdAt: ago(10),
    name: "Hoda Ali",
    email: "hoda@example.com",
    whatsapp: "+201556677889",
    passwordHash: DEMO_PWD,
    accountType: "individual",
    isActive: true,
    isVerified: false,
  },
];

export const SEED_PROFILES: Profile[] = [
  {
    id: "prof-admin",
    userId: "admin-1",
    governorate: "Minya",
    city: "Samalot",
    area: "Downtown",
    generalGoal: "both",
  },
  {
    id: "prof-seller-1",
    userId: "user-seller-1",
    governorate: "Minya",
    city: "Samalot",
    area: "Downtown",
    generalGoal: "sell",
    sellReason: "investment",
    shortTermGoal: "Sell within 3 months",
    longTermGoal: "Move to Cairo by 2026",
    budgetEgp: 0,
    timeline: "3m",
    preferredTypes: ["residential"],
  },
  {
    id: "prof-office-1",
    userId: "user-office-1",
    governorate: "Minya",
    city: "Samalot",
    area: "Downtown",
    generalGoal: "both",
    entityName: "Nile Real Estate",
    platformGoal: "reach_buyers",
    portfolioSize: 18,
    preferredTypes: ["residential", "commercial", "agricultural"],
  },
  {
    id: "prof-buyer-1",
    userId: "user-buyer-1",
    governorate: "Minya",
    city: "Samalot",
    area: "Sheikh Fadl",
    generalGoal: "buy",
    buyReason: "housing",
    shortTermGoal: "Find a family home this year",
    budgetEgp: 700000,
    timeline: "6m",
    preferredTypes: ["residential"],
    preferredAreas: ["Samalot — Downtown", "Sheikh Fadl"],
    areaSqmMin: 90,
    areaSqmMax: 180,
  },
];

export const SEED_SUBS: Subscription[] = [
  {
    id: "sub-buyer-1",
    userId: "user-buyer-1",
    plan: "basic",
    startedAt: ago(5),
    expiresAt: inDays(25),
    isActive: true,
    paymentRef: "MOCK-001",
    amountEgp: 199,
  },
];

export const SEED_LISTINGS: Listing[] = [
  {
    id: "L-1",
    createdAt: ago(2),
    updatedAt: ago(2),
    userId: "user-office-1",
    listingType: "sell",
    propertyType: "residential",
    governorate: "Minya",
    city: "Samalot",
    area: "Downtown",
    fullAddress: "12 Republic St., 3rd floor",
    areaSqm: 120,
    priceEgp: 650000,
    priceType: "negotiable",
    description:
      "Bright 3-bedroom apartment in the heart of Samalot. Modern finish, independent meters, near schools and markets. Move-in ready for a family.",
    images: [apt1, apt2],
    contactPhone: "+201112223344",
    status: "active",
    isFeatured: true,
    viewCount: 24,
  },
  {
    id: "L-2",
    createdAt: ago(5),
    updatedAt: ago(5),
    userId: "user-seller-1",
    listingType: "sell",
    propertyType: "residential",
    governorate: "Minya",
    city: "Samalot",
    area: "Ezbat Salman",
    fullAddress: "Off the main canal road",
    areaSqm: 200,
    priceEgp: 480000,
    priceType: "fixed",
    description:
      "Two-floor village house with 300m courtyard, private well and separate entrance. Suitable for a large family or agri-investment.",
    images: [house1],
    contactPhone: "+201001234567",
    status: "active",
    isFeatured: false,
    viewCount: 11,
  },
  {
    id: "L-3",
    createdAt: ago(1),
    updatedAt: ago(1),
    userId: "user-office-1",
    listingType: "sell",
    propertyType: "agricultural",
    governorate: "Minya",
    city: "Samalot",
    area: "Sheikh Fadl",
    areaSqm: 630,
    priceEgp: 220000,
    priceType: "discussable",
    description:
      "3-qirat agricultural land beside the main canal. Continuous irrigation, suitable for vegetables and fruit. Long-term investment.",
    images: [land1],
    contactPhone: "+201112223344",
    status: "active",
    isFeatured: false,
    viewCount: 8,
  },
  {
    id: "L-4",
    createdAt: ago(3),
    updatedAt: ago(3),
    userId: "user-seller-1",
    listingType: "sell",
    propertyType: "commercial",
    governorate: "Minya",
    city: "Samalot",
    area: "Downtown",
    areaSqm: 40,
    priceEgp: 350000,
    priceType: "negotiable",
    description:
      "Two-entrance shop on a busy main street. Wide frontage, internal bathroom, independent meter. Suitable for any business.",
    images: [shop1],
    contactPhone: "+201001234567",
    status: "active",
    isFeatured: true,
    viewCount: 31,
  },
  {
    id: "L-5",
    createdAt: ago(7),
    updatedAt: ago(7),
    userId: "user-office-1",
    listingType: "sell",
    propertyType: "residential",
    governorate: "Minya",
    city: "Samalot",
    area: "Bani Ahmed",
    areaSqm: 200,
    priceEgp: 380000,
    priceType: "fixed",
    description:
      "Build-ready land plot, permits in place, paved roads on two sides. Ideal for a residential building or villa.",
    images: [land2],
    contactPhone: "+201112223344",
    status: "active",
    isFeatured: false,
    viewCount: 6,
  },
  {
    id: "L-6-pending",
    createdAt: ago(0),
    updatedAt: ago(0),
    userId: "user-seller-1",
    listingType: "sell",
    propertyType: "residential",
    governorate: "Minya",
    city: "Samalot",
    area: "Deir Al-Barsha",
    areaSqm: 150,
    priceEgp: 320000,
    priceType: "negotiable",
    description:
      "150m village house, two floors, small garden. Photos and details on contact.",
    images: [house1],
    contactPhone: "+201001234567",
    status: "pending_review",
    isFeatured: false,
    viewCount: 0,
  },
  {
    id: "L-7-buy",
    createdAt: ago(4),
    updatedAt: ago(4),
    userId: "user-buyer-1",
    listingType: "buy",
    propertyType: "residential",
    governorate: "Minya",
    city: "Samalot",
    area: "Downtown",
    areaSqm: 120,
    priceEgp: 700000,
    priceType: "negotiable",
    description:
      "Family looking for a 3-bedroom apartment in Samalot Downtown. Ready cash, fast close.",
    images: [],
    contactPhone: "+201556677889",
    status: "active",
    isFeatured: false,
    viewCount: 4,
  },
];

export const SEED_SLOTS: AvailableSlot[] = (() => {
  const slots: AvailableSlot[] = [];
  for (let d = 1; d <= 7; d++) {
    for (const h of [10, 12, 16]) {
      const start = new Date();
      start.setDate(start.getDate() + d);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60000);
      slots.push({
        id: `slot-${d}-${h}`,
        createdAt: ago(1),
        slotStart: start.toISOString(),
        slotEnd: end.toISOString(),
        isBooked: false,
      });
    }
  }
  return slots;
})();
