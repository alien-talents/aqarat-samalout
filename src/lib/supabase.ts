import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMissingConfig = !supabaseUrl || !supabaseKey;

if (isMissingConfig) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ missing');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗ missing');
  console.error('   Set these in Netlify Environment Variables');
}

// Build a stub that mimics the real Supabase client's async API.
// All methods return Promises; channel() returns a chainable subscription stub.
function createStubClient(): any {
  const notConfiguredError = new Error('Supabase not configured');

  const queryBuilder = (): any => {
    const result = Promise.resolve({ data: [], error: notConfiguredError });
    const chain: any = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      upsert: () => chain,
      eq: () => chain,
      neq: () => chain,
      gt: () => chain,
      gte: () => chain,
      lt: () => chain,
      lte: () => chain,
      like: () => chain,
      ilike: () => chain,
      in: () => chain,
      is: () => chain,
      or: () => chain,
      order: () => chain,
      limit: () => chain,
      range: () => chain,
      single: () => Promise.resolve({ data: null, error: notConfiguredError }),
      maybeSingle: () => Promise.resolve({ data: null, error: notConfiguredError }),
      then: (resolve: any, reject: any) => result.then(resolve, reject),
      catch: (cb: any) => result.catch(cb),
      finally: (cb: any) => result.finally(cb),
    };
    return chain;
  };

  const channelStub: any = {
    on: () => channelStub,
    subscribe: () => channelStub,
    unsubscribe: () => Promise.resolve('ok'),
  };

  return {
    from: () => queryBuilder(),
    channel: () => channelStub,
    removeChannel: () => Promise.resolve('ok'),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: notConfiguredError }),
      signUp: () => Promise.resolve({ data: null, error: notConfiguredError }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: notConfiguredError }),
      updateUser: () => Promise.resolve({ data: null, error: notConfiguredError }),
    },
  };
}

export const supabase = isMissingConfig
  ? createStubClient()
  : createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = !isMissingConfig;
