// Bilingual EN/AR i18n with RTL support
import { useEffect, useState } from "react";

export type Lang = "en" | "ar";

const LANG_KEY = "samalot.lang";

export function getLang(): Lang {
  const v = (typeof window !== "undefined" && localStorage.getItem(LANG_KEY)) as Lang | null;
  return v === "ar" || v === "en" ? v : "en";
}

export function setLang(l: Lang) {
  localStorage.setItem(LANG_KEY, l);
  applyLangToDocument(l);
  window.dispatchEvent(new CustomEvent("samalot:lang-changed"));
}

export function applyLangToDocument(l: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(getLang());
  useEffect(() => {
    const onChange = () => setLangState(getLang());
    window.addEventListener("samalot:lang-changed", onChange);
    return () => window.removeEventListener("samalot:lang-changed", onChange);
  }, []);
  return lang;
}

// ---------- Strings ----------
type Dict = Record<string, { en: string; ar: string }>;

const D: Dict = {
  // brand
  "brand.name": { en: "Samalot Real Estate", ar: "عقارات سمالوط" },
  "brand.tagline": { en: "Real Seller. Real Buyer. Two Steps.", ar: "بائع حقيقي. مشتري حقيقي. خطوتين." },

  // nav
  "nav.marketplace": { en: "Marketplace", ar: "السوق" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحتي" },
  "nav.admin": { en: "Admin", ar: "الإدارة" },
  "nav.pricing": { en: "Pricing", ar: "الاشتراكات" },
  "nav.login": { en: "Log in", ar: "دخول" },
  "nav.register": { en: "Register", ar: "تسجيل" },
  "nav.logout": { en: "Log out", ar: "خروج" },
  "nav.create_listing": { en: "Create Listing", ar: "أضف إعلان" },

  // generic
  "g.cancel": { en: "Cancel", ar: "إلغاء" },
  "g.save": { en: "Save", ar: "حفظ" },
  "g.next": { en: "Next", ar: "التالي" },
  "g.back": { en: "Back", ar: "رجوع" },
  "g.submit": { en: "Submit", ar: "إرسال" },
  "g.confirm": { en: "Confirm", ar: "تأكيد" },
  "g.approve": { en: "Approve", ar: "موافقة" },
  "g.reject": { en: "Reject", ar: "رفض" },
  "g.optional": { en: "(optional)", ar: "(اختياري)" },
  "g.required": { en: "Required", ar: "مطلوب" },
  "g.loading": { en: "Loading…", ar: "جاري التحميل…" },
  "g.empty": { en: "Nothing here yet.", ar: "لا يوجد شيء بعد." },
  "g.locked": { en: "Locked — Subscribers only", ar: "مغلق — للمشتركين فقط" },
  "g.unlock": { en: "Subscribe to unlock", ar: "اشترك للفتح" },
  "g.view_details": { en: "View details", ar: "عرض التفاصيل" },
  "g.egp": { en: "EGP", ar: "ج.م" },
  "g.sqm": { en: "sqm", ar: "م²" },
  "g.search": { en: "Search…", ar: "ابحث…" },

  // hero
  "hero.title_a": { en: "Tell us what you want", ar: "قولنا إيه اللي بتدور عليه" },
  "hero.title_b": { en: "we'll find it.", ar: "وهنجيبهولك." },
  "hero.subtitle": {
    en: "A matching platform connecting real sellers and real buyers in Samalot. Admin verifies, coordinates, and drives every deal.",
    ar: "منصة مطابقة بتوصل البائع الحقيقي بالمشتري الحقيقي في سمالوط. الإدارة بتراجع وبتنسق وبتقفل كل صفقة.",
  },
  "hero.cta_register": { en: "Register to get started", ar: "ابدأ — سجّل دلوقتي" },
  "hero.cta_browse": { en: "Browse listings", ar: "تصفح الإعلانات" },

  // marketplace
  "mp.heading": { en: "All listings", ar: "كل الإعلانات" },
  "mp.no_results": { en: "No results match your filters.", ar: "ما فيش نتايج بتطابق الفلاتر." },
  "mp.filter.all": { en: "All", ar: "الكل" },
  "mp.filter.sell": { en: "For sale", ar: "للبيع" },
  "mp.filter.buy": { en: "Wanted", ar: "مطلوب" },
  "mp.filter.swap": { en: "Swap", ar: "استبدال" },
  "mp.sort.newest": { en: "Newest", ar: "الأحدث" },
  "mp.sort.price_asc": { en: "Price: Low to High", ar: "السعر: الأقل أولاً" },
  "mp.sort.price_desc": { en: "Price: High to Low", ar: "السعر: الأعلى أولاً" },

  // card
  "card.featured": { en: "Featured", ar: "مميز" },
  "card.locked_photos": { en: "Photos locked", ar: "الصور مقفلة" },
  "card.contact_locked": { en: "Contact hidden", ar: "التواصل مخفي" },

  // listing detail
  "ld.summary": { en: "Summary", ar: "ملخص" },
  "ld.full_details": { en: "Full details", ar: "تفاصيل كاملة" },
  "ld.description": { en: "Description", ar: "الوصف" },
  "ld.location_public": { en: "General location", ar: "الموقع العام" },
  "ld.location_full": { en: "Full address", ar: "العنوان الكامل" },
  "ld.location_full_locked": {
    en: "Full address shared after appointment is approved.",
    ar: "هيتم مشاركة العنوان الكامل بعد الموافقة على المعاد.",
  },
  "ld.contact_locked": {
    en: "Contact phone shared after appointment is approved by admin and seller.",
    ar: "رقم التواصل بيتشارك بعد موافقة الإدارة والبائع على المعاد.",
  },
  "ld.request_appointment": { en: "Request Appointment", ar: "اطلب معاد" },
  "ld.subscribe_to_view": { en: "Subscribe to view", ar: "اشترك للعرض" },
  "ld.posted_by": { en: "Posted by", ar: "إعلان من" },

  // request flow
  "rq.thanks": {
    en: "Request submitted. Admin will review and notify you.",
    ar: "تم إرسال الطلب. الإدارة هتراجع وهتبلغك.",
  },
  "rq.status.pending_admin": { en: "Awaiting admin review", ar: "في انتظار مراجعة الإدارة" },
  "rq.status.pending_seller": { en: "Awaiting seller response", ar: "في انتظار رد البائع" },
  "rq.status.accepted": { en: "Accepted — book your slot", ar: "تمت الموافقة — احجز معادك" },
  "rq.status.rejected": { en: "Rejected", ar: "مرفوض" },
  "rq.status.appointment_scheduled": { en: "Appointment scheduled", ar: "تم تحديد المعاد" },
  "rq.status.in_discussion": { en: "In discussion", ar: "في مرحلة النقاش" },
  "rq.status.negotiating": { en: "Negotiating", ar: "في التفاوض" },
  "rq.status.deal_done": { en: "Deal done", ar: "تمت الصفقة" },
  "rq.status.deal_failed": { en: "Deal failed", ar: "فشلت الصفقة" },

  // listing types
  "lt.sell": { en: "For Sale", ar: "للبيع" },
  "lt.buy": { en: "Wanted to Buy", ar: "مطلوب للشراء" },
  "lt.swap": { en: "Swap", ar: "استبدال" },

  // property types
  "pt.residential": { en: "Residential", ar: "سكني" },
  "pt.commercial": { en: "Commercial", ar: "تجاري" },
  "pt.agricultural": { en: "Agricultural land", ar: "أرض زراعية" },
  "pt.industrial": { en: "Industrial", ar: "صناعي" },
  "pt.mountain": { en: "Mountain", ar: "جبلي" },

  // account types
  "at.individual": { en: "Individual", ar: "فرد" },
  "at.broker": { en: "Independent Broker", ar: "سمسار مستقل" },
  "at.office": { en: "Real Estate Office", ar: "مكتب عقاري" },
  "at.developer": { en: "Real Estate Developer", ar: "مطور عقاري" },

  // price type
  "prc.fixed": { en: "Fixed price", ar: "سعر ثابت" },
  "prc.negotiable": { en: "Negotiable", ar: "قابل للتفاوض" },
  "prc.discussable": { en: "Open to discussion", ar: "قابل للنقاش" },

  // general goal
  "gg.sell": { en: "Sell", ar: "بيع" },
  "gg.buy": { en: "Buy", ar: "شراء" },
  "gg.both": { en: "Both", ar: "بيع وشراء" },

  // sell reasons
  "sr.housing": { en: "Housing & stability", ar: "سكن واستقرار" },
  "sr.investment": { en: "Personal investment", ar: "استثمار شخصي" },
  "sr.emergency": { en: "Emergency", ar: "ظرف طارئ" },
  "sr.travel": { en: "Travel / relocation", ar: "سفر أو انتقال" },
  "sr.local_move": { en: "Local move", ar: "انتقال محلي" },
  "sr.no_longer_needed": { en: "No longer needed", ar: "لم يعد لازماً" },

  // buy reasons
  "br.housing": { en: "Housing & stability", ar: "سكن واستقرار" },
  "br.investment": { en: "Investment", ar: "استثمار" },
  "br.rental_income": { en: "Rental income", ar: "دخل إيجاري" },
  "br.family_future": { en: "Family future", ar: "مستقبل العيلة" },

  // timelines
  "tl.under_1m": { en: "Under 1 month", ar: "أقل من شهر" },
  "tl.3m": { en: "3 months", ar: "٣ شهور" },
  "tl.6m": { en: "6 months", ar: "٦ شهور" },
  "tl.1y": { en: "1 year", ar: "سنة" },
  "tl.flexible": { en: "Flexible", ar: "مرن" },

  // platform goals
  "pg.faster_sales": { en: "Faster sales", ar: "مبيعات أسرع" },
  "pg.organized_sales": { en: "Organized sales pipeline", ar: "تنظيم خط المبيعات" },
  "pg.reach_buyers": { en: "Access to real buyers", ar: "الوصول لمشترين حقيقيين" },
  "pg.geographic_expansion": { en: "Geographic expansion", ar: "توسع جغرافي" },

  // listing status
  "ls.draft": { en: "Draft", ar: "مسودة" },
  "ls.pending_review": { en: "Pending review", ar: "في انتظار المراجعة" },
  "ls.active": { en: "Active", ar: "نشط" },
  "ls.closed": { en: "Closed", ar: "مغلق" },
  "ls.rejected": { en: "Rejected", ar: "مرفوض" },

  // pricing
  "pr.title": { en: "Subscription Plans", ar: "خطط الاشتراك" },
  "pr.subtitle": {
    en: "Both buyers and sellers contribute. Sellers pay a small flat fee per listing. Buyers subscribe to unlock full details and request appointments.",
    ar: "البائع والمشتري بيشاركوا. البائع بيدفع رسم بسيط للإعلان، والمشتري بيشترك علشان يفتح التفاصيل ويطلب معاد.",
  },
  "pr.seller_fee": { en: "Seller listing fee", ar: "رسم إعلان البائع" },
  "pr.seller_fee_desc": {
    en: "Flat one-time fee per listing. Listing stays live until closed.",
    ar: "رسم ثابت لمرة واحدة لكل إعلان. الإعلان بيفضل شغال لحد ما يتقفل.",
  },
  "pr.plan.free": { en: "Free", ar: "مجاني" },
  "pr.plan.basic": { en: "Basic", ar: "أساسي" },
  "pr.plan.premium": { en: "Premium", ar: "بريميوم" },
  "pr.feat.free": { en: "Browse summarized cards", ar: "تصفح البطاقات المختصرة" },
  "pr.feat.basic": {
    en: "Full card details + request appointments",
    ar: "تفاصيل البطاقة كاملة + طلب معاد",
  },
  "pr.feat.premium": {
    en: "Priority appointments + instant alerts on new matches",
    ar: "أولوية في المعاد + تنبيهات فورية لأي مطابقة جديدة",
  },
  "pr.subscribe": { en: "Subscribe", ar: "اشترك" },
  "pr.current": { en: "Current plan", ar: "خطتك الحالية" },
  "pr.mock_pay": {
    en: "(Mock — no real payment)",
    ar: "(تجريبي — مفيش دفع حقيقي)",
  },

  // dashboard
  "db.tab.listings": { en: "My Listings", ar: "إعلاناتي" },
  "db.tab.requests": { en: "My Requests", ar: "طلباتي" },
  "db.tab.appointments": { en: "Appointments", ar: "المواعيد" },
  "db.tab.profile": { en: "Profile", ar: "الملف الشخصي" },
  "db.tab.notifications": { en: "Notifications", ar: "الإشعارات" },
  "db.requests_received": { en: "Requests received", ar: "طلبات واردة" },

  // admin
  "ad.tab.requests": { en: "Request Queue", ar: "طابور الطلبات" },
  "ad.tab.calendar": { en: "Calendar", ar: "التقويم" },
  "ad.tab.listings": { en: "Listings", ar: "الإعلانات" },
  "ad.tab.users": { en: "Users", ar: "المستخدمين" },
  "ad.tab.analytics": { en: "Analytics", ar: "التحليلات" },
  "ad.kpi.requests": { en: "Total requests", ar: "إجمالي الطلبات" },
  "ad.kpi.approval": { en: "Approval rate", ar: "نسبة الموافقة" },
  "ad.kpi.deals": { en: "Completed deals", ar: "صفقات مكتملة" },
  "ad.kpi.revenue": { en: "Revenue (EGP)", ar: "الإيراد (ج.م)" },
};

export function t(key: string, lang?: Lang): string {
  const l = lang ?? getLang();
  const entry = D[key];
  if (!entry) return key;
  return entry[l];
}

// ---------- Display helpers ----------
export function fmtPrice(n: number, lang: Lang): string {
  const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(n);
  return `${formatted} ${t("g.egp", lang)}`;
}

export function fmtSqm(n: number, lang: Lang): string {
  const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US").format(n);
  return `${formatted} ${t("g.sqm", lang)}`;
}

export function fmtDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
