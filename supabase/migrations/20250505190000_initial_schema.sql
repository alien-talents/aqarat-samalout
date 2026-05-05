-- Migration: Initial Schema for Aqarat Samalout
-- Created: 2025-05-05
-- Description: Base tables for users, profiles, listings, notifications, and appointments

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  account_type TEXT NOT NULL DEFAULT 'individual' 
    CHECK (account_type IN ('individual', 'broker', 'office', 'developer')),
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase Auth';

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Location
  governorate TEXT,
  city TEXT,
  area TEXT,
  
  -- Goals
  general_goal TEXT CHECK (general_goal IN ('sell', 'buy', 'both')),
  sell_reason TEXT CHECK (sell_reason IN ('housing', 'investment', 'emergency', 'travel', 'local_move', 'no_longer_needed')),
  buy_reason TEXT CHECK (buy_reason IN ('housing', 'investment', 'rental_income', 'family_future')),
  short_term_goal TEXT,
  long_term_goal TEXT,
  
  -- Financial
  budget_egp INTEGER,
  timeline TEXT CHECK (timeline IN ('under_1m', '3m', '6m', '1y', 'flexible')),
  
  -- Company/Office specific
  entity_name TEXT,
  platform_goal TEXT CHECK (platform_goal IN ('faster_sales', 'organized_sales', 'reach_buyers', 'geographic_expansion')),
  portfolio_size INTEGER,
  
  -- Preferences
  preferred_types TEXT[],
  preferred_areas TEXT[],
  area_sqm_min INTEGER,
  area_sqm_max INTEGER,
  specialization TEXT,
  extra_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Extended user profile information';

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' 
    CHECK (plan IN ('free', 'basic', 'premium')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  payment_ref TEXT,
  amount_egp INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'User subscription plans';

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Listing Type
  listing_type TEXT NOT NULL 
    CHECK (listing_type IN ('sell', 'buy', 'swap')),
  property_type TEXT NOT NULL 
    CHECK (property_type IN ('residential', 'commercial', 'agricultural', 'industrial', 'mountain')),
  
  -- Public Location
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  
  -- Hidden Address (until appointment approval)
  full_address TEXT,
  
  -- Property Details
  area_sqm INTEGER NOT NULL,
  price_egp INTEGER NOT NULL,
  price_type TEXT DEFAULT 'fixed' 
    CHECK (price_type IN ('fixed', 'negotiable', 'discussable')),
  
  -- Subscriber-only Content
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Hidden Contact
  contact_phone TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending_review' 
    CHECK (status IN ('draft', 'pending_review', 'active', 'closed', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Features
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.listings IS 'Property listings';

-- ============================================
-- APPOINTMENT REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointment_requests (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  requester_id UUID REFERENCES public.users(id) NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  listing_owner_id UUID REFERENCES public.users(id) NOT NULL,
  
  status TEXT DEFAULT 'pending_admin' 
    CHECK (status IN (
      'pending_admin', 'pending_seller', 'accepted', 'rejected',
      'appointment_scheduled', 'in_discussion', 'negotiating',
      'deal_done', 'deal_failed'
    )),
  rejection_reason TEXT,
  admin_notes TEXT,
  stage_notes TEXT,
  
  requester_appt_id UUID,
  owner_appt_id UUID
);

COMMENT ON TABLE public.appointment_requests IS 'Appointment requests for property viewings';

-- ============================================
-- AVAILABLE SLOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.available_slots (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_for UUID -- appointment id
);

COMMENT ON TABLE public.available_slots IS 'Available appointment time slots';

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES public.users(id) NOT NULL,
  request_id UUID REFERENCES public.appointment_requests(id) NOT NULL,
  slot_id UUID REFERENCES public.available_slots(id) NOT NULL,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'done', 'missed', 'cancelled')),
  admin_notes TEXT
);

COMMENT ON TABLE public.appointments IS 'Scheduled appointments';

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL 
    CHECK (type IN (
      'request_received', 'request_approved_by_admin', 'request_accepted_by_seller',
      'request_rejected', 'appointment_confirmed', 'appointment_reminder',
      'deal_done', 'deal_failed', 'listing_approved', 'listing_rejected'
    )),
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID
);

COMMENT ON TABLE public.notifications IS 'User notifications';

-- ============================================
-- PUSH SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.push_subscriptions IS 'Web Push API subscriptions for notifications';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- PROFILES policies  
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- LISTINGS policies
CREATE POLICY "Active listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view own listings regardless of status"
  ON public.listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- APPOINTMENT REQUESTS policies
CREATE POLICY "Users can view requests they created"
  ON public.appointment_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Users can view requests for their listings"
  ON public.appointment_requests FOR SELECT
  USING (auth.uid() = listing_owner_id);

CREATE POLICY "Users can create requests"
  ON public.appointment_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- APPOINTMENTS policies
CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

-- PUSH SUBSCRIPTIONS policies
CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_requests_updated_at
  BEFORE UPDATE ON public.appointment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on listing approval
CREATE OR REPLACE FUNCTION notify_listing_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending_review' AND NEW.status = 'active' THEN
    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES (
      NEW.user_id,
      'listing_approved',
      'تم الموافقة على إعلانك',
      'تمت الموافقة على إعلانك ويمكن للمستخدمين رؤيته الآن',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_listing_approval
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_listing_approval();

-- ============================================
-- INDEXES
-- ============================================

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON public.listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON public.listings(is_featured);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Appointment requests indexes
CREATE INDEX IF NOT EXISTS idx_appointment_requests_requester ON public.appointment_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_owner ON public.appointment_requests(listing_owner_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_listing ON public.appointment_requests(listing_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Push subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
