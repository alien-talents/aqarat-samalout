import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if env vars are missing (common on Netlify if not set correctly)
const isMissingConfig = !supabaseUrl || !supabaseKey;

if (isMissingConfig) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ missing');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗ missing');
  console.error('   Make sure these are set in Netlify Environment Variables');
}

// Create a dummy client if config is missing (prevents app crash)
export const supabase = isMissingConfig 
  ? ({
      from: () => ({
        select: () => ({ data: [], error: new Error('Supabase not configured') }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
      auth: {
        signInWithPassword: () => ({ error: new Error('Supabase not configured') }),
        signUp: () => ({ error: new Error('Supabase not configured') }),
        signOut: () => ({ error: null }),
        getSession: () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any)
  : createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = !isMissingConfig;
