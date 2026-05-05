// Frontend-only mock store for PRD v2. All data in localStorage.
import type {
  AppointmentRequest,
  Appointment,
  AvailableSlot,
  Listing,
  Notification,
  Profile,
  RequestStatus,
  Subscription,
  SubscriptionPlan,
  User,
} from "./types";
import { SEED_USERS, SEED_PROFILES, SEED_LISTINGS, SEED_SLOTS, SEED_SUBS } from "./seed";

const KEYS = {
  users: "samalot.v2.users",
  profiles: "samalot.v2.profiles",
  subs: "samalot.v2.subs",
  listings: "samalot.v2.listings",
  requests: "samalot.v2.requests",
  appointments: "samalot.v2.appointments",
  slots: "samalot.v2.slots",
  notifications: "samalot.v2.notifications",
  session: "samalot.v2.session",
  seeded: "samalot.v2.seeded.v1",
} as const;

export const ADMIN_USER_ID = "admin-1";

// ---------- Generic ----------
export const uid = () => crypto.randomUUID();
export const nowISO = () => new Date().toISOString();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function emit(name: string) {
  window.dispatchEvent(new CustomEvent(`samalot:${name}`));
}

// ---------- Seed ----------
export function ensureSeed() {
  if (localStorage.getItem(KEYS.seeded) === "1") return;
  write(KEYS.users, SEED_USERS);
  write(KEYS.profiles, SEED_PROFILES);
  write(KEYS.subs, SEED_SUBS);
  write(KEYS.listings, SEED_LISTINGS);
  write(KEYS.slots, SEED_SLOTS);
  write(KEYS.requests, []);
  write(KEYS.appointments, []);
  write(KEYS.notifications, []);
  localStorage.setItem(KEYS.seeded, "1");
}

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ensureSeed();
  emit("data-reset");
}

// ---------- Session (mock auth) ----------
export function getCurrentUserId(): string | null {
  return localStorage.getItem(KEYS.session);
}
export function getCurrentUser(): User | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}
export function setSession(userId: string | null) {
  if (userId) localStorage.setItem(KEYS.session, userId);
  else localStorage.removeItem(KEYS.session);
  emit("session-changed");
}

// crude hash — DO NOT use for real auth
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `mock_${h}`;
}
export function verifyPassword(stored: string, attempt: string) {
  return stored === hash(attempt);
}
export function hashPassword(s: string) {
  return hash(s);
}

// ---------- Users ----------
export function getUsers(): User[] {
  ensureSeed();
  return read<User[]>(KEYS.users, []);
}
export function getUser(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}
export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
export function saveUser(u: User) {
  const all = getUsers();
  const idx = all.findIndex((x) => x.id === u.id);
  if (idx >= 0) all[idx] = u;
  else all.push(u);
  write(KEYS.users, all);
  emit("users-changed");
}

// ---------- Profiles ----------
export function getProfiles(): Profile[] {
  ensureSeed();
  return read<Profile[]>(KEYS.profiles, []);
}
export function getProfileByUser(userId: string): Profile | undefined {
  return getProfiles().find((p) => p.userId === userId);
}
export function saveProfile(p: Profile) {
  const all = getProfiles();
  const idx = all.findIndex((x) => x.userId === p.userId);
  if (idx >= 0) all[idx] = p;
  else all.push(p);
  write(KEYS.profiles, all);
  emit("profiles-changed");
}

// ---------- Subscriptions ----------
export function getSubs(): Subscription[] {
  ensureSeed();
  return read<Subscription[]>(KEYS.subs, []);
}
export function getActiveSub(userId: string): Subscription | undefined {
  const now = Date.now();
  return getSubs().find(
    (s) =>
      s.userId === userId &&
      s.isActive &&
      (!s.expiresAt || new Date(s.expiresAt).getTime() > now),
  );
}
export function getCurrentPlan(userId: string | null | undefined): SubscriptionPlan {
  if (!userId) return "free";
  return getActiveSub(userId)?.plan ?? "free";
}
export function saveSub(s: Subscription) {
  const all = getSubs();
  // deactivate existing for this user
  const updated = all.map((x) => (x.userId === s.userId ? { ...x, isActive: false } : x));
  updated.push(s);
  write(KEYS.subs, updated);
  emit("subs-changed");
}

// ---------- Listings ----------
export function getListings(): Listing[] {
  ensureSeed();
  return read<Listing[]>(KEYS.listings, []);
}
export function getListing(id: string): Listing | undefined {
  return getListings().find((l) => l.id === id);
}
export function saveListing(l: Listing) {
  const all = getListings();
  const idx = all.findIndex((x) => x.id === l.id);
  l.updatedAt = nowISO();
  if (idx >= 0) all[idx] = l;
  else all.unshift(l);
  write(KEYS.listings, all);
  emit("listings-changed");
}
export function deleteListing(id: string) {
  write(
    KEYS.listings,
    getListings().filter((l) => l.id !== id),
  );
  emit("listings-changed");
}
export function setListingStatus(id: string, status: Listing["status"], reason?: string) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, status, rejectionReason: reason });
  if (status === "active") {
    addNotification({
      id: uid(),
      createdAt: nowISO(),
      userId: l.userId,
      type: "listing_approved",
      title: "Listing approved",
      body: `Your listing is now live.`,
      isRead: false,
      relatedId: l.id,
    });
  } else if (status === "rejected") {
    addNotification({
      id: uid(),
      createdAt: nowISO(),
      userId: l.userId,
      type: "listing_rejected",
      title: "Listing rejected",
      body: reason ?? "Please review and resubmit.",
      isRead: false,
      relatedId: l.id,
    });
  }
}
export function trackListingView(id: string) {
  const l = getListing(id);
  if (!l) return;
  saveListing({ ...l, viewCount: (l.viewCount ?? 0) + 1 });
}
export function getMyListings(userId: string): Listing[] {
  return getListings().filter((l) => l.userId === userId);
}

// ---------- Requests ----------
export function getRequests(): AppointmentRequest[] {
  ensureSeed();
  return read<AppointmentRequest[]>(KEYS.requests, []);
}
export function getRequest(id: string): AppointmentRequest | undefined {
  return getRequests().find((r) => r.id === id);
}
export function saveRequest(r: AppointmentRequest) {
  const all = getRequests();
  const idx = all.findIndex((x) => x.id === r.id);
  r.updatedAt = nowISO();
  if (idx >= 0) all[idx] = r;
  else all.unshift(r);
  write(KEYS.requests, all);
  emit("requests-changed");
}
export function getRequestsForUser(userId: string) {
  return getRequests().filter((r) => r.requesterId === userId);
}
export function getRequestsForOwner(ownerId: string) {
  return getRequests().filter((r) => r.listingOwnerId === ownerId);
}
export function setRequestStatus(id: string, status: RequestStatus, opts?: { reason?: string; stageNotes?: string }) {
  const r = getRequest(id);
  if (!r) return;
  saveRequest({
    ...r,
    status,
    rejectionReason: opts?.reason ?? r.rejectionReason,
    stageNotes: opts?.stageNotes ?? r.stageNotes,
  });

  // notifications
  if (status === "pending_seller") {
    addNotification({
      id: uid(),
      createdAt: nowISO(),
      userId: r.listingOwnerId,
      type: "request_received",
      title: "New appointment request",
      isRead: false,
      relatedId: r.id,
    });
    addNotification({
      id: uid(),
      createdAt: nowISO(),
      userId: r.requesterId,
      type: "request_approved_by_admin",
      title: "Admin approved your request",
      isRead: false,
      relatedId: r.id,
    });
  } else if (status === "accepted") {
    addNotification({
      id: uid(),
      createdAt: nowISO(),
      userId: r.requesterId,
      type: "request_accepted_by_seller",
      title: "Seller accepted — book your slot",
      isRead: false,
      relatedId: r.id,
    });
  } else if (status === "rejected") {
    addNotification({
      id: uid(),
      createdAt: nowISO(),
      userId: r.requesterId,
      type: "request_rejected",
      title: "Request rejected",
      body: opts?.reason,
      isRead: false,
      relatedId: r.id,
    });
  } else if (status === "deal_done") {
    [r.requesterId, r.listingOwnerId].forEach((uid2) =>
      addNotification({
        id: uid(),
        createdAt: nowISO(),
        userId: uid2,
        type: "deal_done",
        title: "Deal completed 🎉",
        isRead: false,
        relatedId: r.id,
      }),
    );
  } else if (status === "deal_failed") {
    [r.requesterId, r.listingOwnerId].forEach((uid2) =>
      addNotification({
        id: uid(),
        createdAt: nowISO(),
        userId: uid2,
        type: "deal_failed",
        title: "Deal did not close",
        isRead: false,
        relatedId: r.id,
      }),
    );
  }
}

// ---------- Slots & Appointments ----------
export function getSlots(): AvailableSlot[] {
  ensureSeed();
  return read<AvailableSlot[]>(KEYS.slots, []);
}
export function saveSlot(s: AvailableSlot) {
  const all = getSlots();
  const idx = all.findIndex((x) => x.id === s.id);
  if (idx >= 0) all[idx] = s;
  else all.push(s);
  all.sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
  write(KEYS.slots, all);
  emit("slots-changed");
}
export function deleteSlot(id: string) {
  write(
    KEYS.slots,
    getSlots().filter((s) => s.id !== id),
  );
  emit("slots-changed");
}
export function getOpenSlots(): AvailableSlot[] {
  const now = Date.now();
  return getSlots().filter((s) => !s.isBooked && new Date(s.slotStart).getTime() > now);
}

export function getAppointments(): Appointment[] {
  ensureSeed();
  return read<Appointment[]>(KEYS.appointments, []);
}
export function getAppointmentsForUser(userId: string) {
  return getAppointments().filter((a) => a.userId === userId);
}
export function saveAppointment(a: Appointment) {
  const all = getAppointments();
  const idx = all.findIndex((x) => x.id === a.id);
  if (idx >= 0) all[idx] = a;
  else all.push(a);
  write(KEYS.appointments, all);
  emit("appointments-changed");
}

export function bookSlot(slotId: string, userId: string, requestId: string): Appointment | null {
  const slot = getSlots().find((s) => s.id === slotId);
  if (!slot || slot.isBooked) return null;
  const appt: Appointment = {
    id: uid(),
    createdAt: nowISO(),
    userId,
    requestId,
    slotId,
    scheduledAt: slot.slotStart,
    durationMin: Math.max(
      30,
      Math.round((new Date(slot.slotEnd).getTime() - new Date(slot.slotStart).getTime()) / 60000),
    ),
    status: "confirmed",
  };
  saveAppointment(appt);
  saveSlot({ ...slot, isBooked: true, bookedFor: appt.id });

  // Attach to request and progress its status when both parties have booked
  const r = getRequest(requestId);
  if (r) {
    const updated: AppointmentRequest = { ...r };
    if (userId === r.requesterId) updated.requesterApptId = appt.id;
    if (userId === r.listingOwnerId) updated.ownerApptId = appt.id;
    if (updated.requesterApptId && updated.ownerApptId) {
      updated.status = "appointment_scheduled";
      [r.requesterId, r.listingOwnerId].forEach((u) =>
        addNotification({
          id: uid(),
          createdAt: nowISO(),
          userId: u,
          type: "appointment_confirmed",
          title: "Appointment scheduled",
          isRead: false,
          relatedId: r.id,
        }),
      );
    }
    saveRequest(updated);
  }
  return appt;
}

export function setAppointmentStatus(id: string, status: Appointment["status"]) {
  const a = getAppointments().find((x) => x.id === id);
  if (!a) return;
  saveAppointment({ ...a, status });
}

// ---------- Notifications ----------
export function getNotifications(): Notification[] {
  ensureSeed();
  return read<Notification[]>(KEYS.notifications, []);
}
export function getMyNotifications(userId: string) {
  return getNotifications().filter((n) => n.userId === userId);
}
export function addNotification(n: Notification) {
  const all = getNotifications();
  all.unshift(n);
  write(KEYS.notifications, all);
  emit("notifications-changed");
}
export function markNotificationRead(id: string) {
  const all = getNotifications().map((n) => (n.id === id ? { ...n, isRead: true } : n));
  write(KEYS.notifications, all);
  emit("notifications-changed");
}
export function markAllNotificationsRead(userId: string) {
  const all = getNotifications().map((n) =>
    n.userId === userId ? { ...n, isRead: true } : n,
  );
  write(KEYS.notifications, all);
  emit("notifications-changed");
}
