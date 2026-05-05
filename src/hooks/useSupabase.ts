import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  Listing, 
  User, 
  Profile, 
  AppointmentRequest, 
  Notification,
  ListingType,
  PropertyType,
  ListingStatus 
} from '@/lib/types';

// ========== LISTINGS ==========

export function useListings(filters?: {
  status?: ListingStatus;
  listingType?: ListingType;
  propertyType?: PropertyType;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Convert camelCase to snake_case for Supabase
      const dbListing = {
        user_id: listing.userId,
        listing_type: listing.listingType,
        property_type: listing.propertyType,
        governorate: listing.governorate,
        city: listing.city,
        area: listing.area,
        full_address: listing.fullAddress,
        area_sqm: listing.areaSqm,
        price_egp: listing.priceEgp,
        price_type: listing.priceType,
        description: listing.description,
        images: listing.images,
        video_url: listing.videoUrl,
        contact_phone: listing.contactPhone,
        status: listing.status,
        is_featured: listing.isFeatured,
        view_count: listing.viewCount,
      };
      
      const { data, error } = await supabase
        .from('listings')
        .insert([dbListing])
        .select()
        .single();
      if (error) throw error;
      return data as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Listing> & { id: string }) => {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Listing;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

// ========== USERS ==========

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<User> & { id: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as User;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

// ========== PROFILES ==========

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Omit<Profile, 'id'>) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, ...updates }: Partial<Profile> & { userId: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
}

// ========== APPOINTMENT REQUESTS ==========

export function useAppointmentRequests(userId?: string) {
  return useQuery({
    queryKey: ['appointment-requests', userId],
    queryFn: async () => {
      let query = supabase
        .from('appointment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`requester_id.eq.${userId},listing_owner_id.eq.${userId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AppointmentRequest[];
    },
  });
}

export function useCreateAppointmentRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Omit<AppointmentRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('appointment_requests')
        .insert([request])
        .select()
        .single();
      if (error) throw error;
      return data as AppointmentRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-requests'] });
    },
  });
}

export function useUpdateAppointmentRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AppointmentRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointment_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AppointmentRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-requests'] });
    },
  });
}

// ========== NOTIFICATIONS ==========

export function useNotifications(userId: string, unreadOnly?: boolean) {
  return useQuery({
    queryKey: ['notifications', userId, unreadOnly],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });
}

export function useUnreadNotificationsCount(userId: string) {
  return useQuery({
    queryKey: ['notifications-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Notification;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
}

// ========== REAL-TIME SUBSCRIPTIONS ==========

export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToListings(callback: (payload: any) => void) {
  return supabase
    .channel('listings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'listings',
      },
      callback
    )
    .subscribe();
}
