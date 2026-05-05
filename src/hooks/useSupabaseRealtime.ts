import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Hook to subscribe to real-time changes
export function useSupabaseRealtime(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Notification change:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
          queryClient.invalidateQueries({ queryKey: ['notifications-count', userId] });
        }
      )
      .subscribe();

    // Subscribe to listings changes
    const listingsChannel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
        },
        (payload) => {
          console.log('Listing change:', payload);
          queryClient.invalidateQueries({ queryKey: ['listings'] });
        }
      )
      .subscribe();

    // Subscribe to appointment requests
    const requestsChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_requests',
          filter: `requester_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Request change:', payload);
          queryClient.invalidateQueries({ queryKey: ['appointment-requests', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_requests',
          filter: `listing_owner_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Request change (owner):', payload);
          queryClient.invalidateQueries({ queryKey: ['appointment-requests', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [userId, queryClient]);
}

// Hook to subscribe to a single listing
export function useListingRealtime(listingId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!listingId) return;

    const channel = supabase
      .channel(`listing-${listingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: `id=eq.${listingId}`,
        },
        (payload) => {
          console.log('Listing update:', payload);
          queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId, queryClient]);
}
