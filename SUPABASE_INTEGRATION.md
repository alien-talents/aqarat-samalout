# Supabase Integration Guide

This document outlines how the project is integrated with Supabase for data, PWA capabilities, and notifications.

## 📁 Files Created/Modified

### Core Supabase Setup
- `src/lib/supabase.ts` - Supabase client initialization
- `.env` - Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)

### Data Fetching Hooks
- `src/hooks/useSupabase.ts` - React Query hooks for all data operations
  - `useListings()` - Fetch listings with filters
  - `useListing(id)` - Fetch single listing
  - `useCreateListing()` - Create new listing
  - `useUpdateListing()` - Update listing
  - `useDeleteListing()` - Delete listing
  - `useUser(id)` - Fetch user
  - `useProfile(userId)` - Fetch user profile
  - `useNotifications(userId)` - Fetch notifications
  - And more...

### Real-time Subscriptions
- `src/hooks/useSupabaseRealtime.ts` - Real-time data sync
  - Auto-refreshes data when changes occur in Supabase
  - Subscribes to notifications, listings, and appointment requests

### PWA Setup
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service Worker (caching, push notifications)
- `src/hooks/usePWA.ts` - PWA install/uninstall hooks
- `src/components/PWAInstallPrompt.tsx` - Install button component

### Notifications
- `src/hooks/useNotifications.ts` - Push & platform notifications
- `src/components/NotificationBell.tsx` - Bell icon with dropdown
- `src/components/NotificationAlert.tsx` - Permission request banner

## 🔌 Database Schema Required

### Migration File Location
📁 **`supabase/migrations/20250505190000_initial_schema.sql`**

This file contains the complete database schema with:
- All tables (users, profiles, listings, notifications, appointments, etc.)
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-updates and notifications

### Apply the Migration

#### Option 1: Supabase Dashboard (SQL Editor)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `volvlqiatapxlxabrlyb`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open the migration file: `supabase/migrations/20250505190000_initial_schema.sql`
6. Copy all contents and paste into SQL Editor
7. Click **Run**

#### Option 2: Using Supabase CLI
```bash
# Login to Supabase
supabase login

# Link project (if not already linked)
supabase link --project-ref volvlqiatapxlxabrlyb

# Apply migrations
supabase db push
```

#### Option 3: Using psql
```bash
export PGPASSWORD="your-db-password"
psql -h db.volvlqiatapxlxabrlyb.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20250505190000_initial_schema.sql
```

See `supabase/migrations/README.md` for detailed migration instructions.

## 🚀 Usage Examples

### Fetch Listings in a Component

```tsx
import { useListings } from '@/hooks/useSupabase';

function ListingPage() {
  const { data: listings, isLoading, error } = useListings({
    status: 'active',
    listingType: 'sell'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading listings</div>;

  return (
    <div>
      {listings?.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

### Create a Listing

```tsx
import { useCreateListing } from '@/hooks/useSupabase';

function NewListingForm() {
  const createListing = useCreateListing();

  const handleSubmit = async (data) => {
    await createListing.mutateAsync({
      userId: currentUser.id,
      listingType: 'sell',
      propertyType: 'residential',
      governorate: 'المنيا',
      city: 'سمالوط',
      area: 'المنطقة',
      areaSqm: 120,
      priceEgp: 500000,
      priceType: 'negotiable',
      description: '...',
      images: [],
      contactPhone: '...',
      status: 'pending_review',
      isFeatured: false,
      viewCount: 0
    });
  };
}
```

### Real-time Subscriptions

```tsx
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

function Dashboard() {
  const { user } = useAuth(); // Your auth hook
  
  // Automatically refreshes data when changes occur
  useSupabaseRealtime(user?.id);

  return <div>Dashboard content</div>;
}
```

### Notifications

```tsx
import { NotificationBell } from '@/components/NotificationBell';

function Header() {
  const { user } = useAuth();

  return (
    <header>
      {user && <NotificationBell userId={user.id} />}
    </header>
  );
}
```

## 📱 PWA Features

### Install Prompt
The app automatically shows an install prompt after 3 seconds if:
- The browser supports PWA installation
- The app is not already installed
- User hasn't dismissed the prompt in the last week

### Push Notifications
1. User sees a banner asking to enable notifications
2. Clicking enables browser notifications
3. Service worker handles push events even when app is closed

### Offline Support
- Service worker caches static assets
- App works offline with cached data
- Supabase requests are skipped during offline mode

## 🔐 Environment Variables

Add these to your `.env`:

```
VITE_SUPABASE_URL=https://volvlqiatapxlxabrlyb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_OgGCcoCFY05P5OPBJxa6gw_yjoJKct0
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_for_push_notifications
```

## 📝 Migration from localStorage

The app currently uses localStorage for mock data. To migrate:

1. Set up Supabase tables using the SQL above
2. Replace `src/lib/store.ts` calls with Supabase hooks
3. Remove seed data initialization
4. Implement proper authentication with Supabase Auth

## 🔔 Push Notification Setup (Server-side)

To send push notifications, create a Supabase Edge Function:

```typescript
// supabase/functions/push-notification/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { userId, title, body } = await req.json();
  
  // Get user's push subscriptions
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  // Send push to each subscription
  for (const sub of subscriptions) {
    await webpush.sendNotification(
      JSON.parse(sub.subscription),
      JSON.stringify({ title, body })
    );
  }
});
```

## 🛠️ CLI Commands

```bash
# Link to Supabase project
supabase login
supabase init
supabase link --project-ref volvlqiatapxlxabrlyb

# Generate types
supabase gen types typescript --project-id volvlqiatapxlxabrlyb --schema public > src/lib/database.types.ts

# Deploy edge functions
supabase functions deploy push-notification
```
