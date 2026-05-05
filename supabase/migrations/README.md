# Supabase Migrations

This folder contains SQL migration files for the Aqarat Samalout database schema.

## 📁 Structure

```
supabase/
├── migrations/
│   ├── 20250505190000_initial_schema.sql    # Base tables
│   └── README.md                              # This file
└── config.toml                               # CLI configuration
```

## 🚀 How to Apply Migrations

### Option 1: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref volvlqiatapxlxabrlyb

# Apply migrations
supabase db push
```

### Option 2: Using Supabase Dashboard (SQL Editor)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `volvlqiatapxlxabrlyb`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of the migration file
6. Paste into the SQL editor
7. Click **Run**

### Option 3: Using psql (Direct Database Connection)

```bash
# Set your database password
export PGPASSWORD="your-db-password"

# Run migration
psql -h db.volvlqiatapxlxabrlyb.supabase.co -p 5432 -d postgres -U postgres -f supabase/migrations/20250505190000_initial_schema.sql
```

## 📝 Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

- `YYYY` - Year
- `MM` - Month
- `DD` - Day
- `HHMMSS` - Hour, Minute, Second
- `description` - Brief description (snake_case)

Example: `20250505190000_initial_schema.sql`

## 🔄 Creating New Migrations

When making schema changes, create a new migration file:

```bash
# Generate timestamp
date +%Y%m%d%H%M%S

# Create migration file
touch supabase/migrations/20250506120000_add_user_preferences.sql
```

## 📊 Schema Overview

### Tables Created:

| Table | Purpose |
|-------|---------|
| `users` | User profiles (extends Supabase Auth) |
| `profiles` | Extended user profile data |
| `subscriptions` | User subscription plans |
| `listings` | Property listings |
| `appointment_requests` | Appointment requests for viewings |
| `available_slots` | Available appointment time slots |
| `appointments` | Scheduled appointments |
| `notifications` | User notifications |
| `push_subscriptions` | Web Push API subscriptions |

### Features:

- ✅ UUID primary keys
- ✅ Foreign key constraints with ON DELETE CASCADE
- ✅ Check constraints for enums
- ✅ Row Level Security (RLS) enabled
- ✅ RLS policies for all tables
- ✅ Auto-updated `updated_at` timestamps
- ✅ Indexes for performance
- ✅ Triggers for notifications

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only:
- View their own data
- Modify their own data
- View public data (active listings)

## 🔔 Built-in Triggers

- `notify_listing_approval()` - Creates notification when listing is approved

## 🛠️ Reset Database

⚠️ **WARNING: This will delete all data!**

```sql
-- Drop all tables (in correct order)
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.available_slots CASCADE;
DROP TABLE IF EXISTS public.appointment_requests CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Re-run migration
```
