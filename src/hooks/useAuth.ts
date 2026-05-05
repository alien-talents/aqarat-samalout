import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Get current user from Supabase
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      setState({ user: null, isLoading: false, isAuthenticated: false });
    } else {
      setState({
        user: data as User,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  };

  return state;
}

// Login with email/password
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Register new user
export async function registerWithEmail(
  email: string,
  password: string,
  userData: {
    name: string;
    whatsapp?: string;
    account_type?: string;
  }
) {
  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Registration failed');

  // Create user profile in our users table
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    name: userData.name,
    whatsapp: userData.whatsapp,
    account_type: userData.account_type || 'individual',
    is_active: true,
    is_verified: false,
    is_admin: false,
  });

  if (profileError) {
    console.error('Error creating user profile:', profileError);
    // Don't throw - auth user is created, profile can be created later
  }

  return authData;
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Check if user is admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.isAdmin || false;
}
