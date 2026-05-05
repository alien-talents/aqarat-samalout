import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
import type { Notification } from '@/lib/types';

// Push Notification Permission
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        checkExistingSubscription();
      }
    };

    checkSupport();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled successfully');
        await subscribeToPush();
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from Supabase Edge Function or env
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not configured');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      setSubscription(subscription);
      
      // Save subscription to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving subscription:', error);
      }

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        
        // Remove from Supabase
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('subscription', JSON.stringify(subscription));
        
        toast.success('Notifications disabled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  };

  return {
    permission,
    subscription,
    isSupported,
    isEnabled: permission === 'granted' && !!subscription,
    requestPermission,
    unsubscribe,
  };
}

// Local/Platform Notifications
export function usePlatformNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      
      // Count unread
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
    };

    fetchNotifications();
  }, [userId]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to list
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast
          showNotificationToast(newNotification);
          
          // Show system notification if permitted
          showSystemNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

// Helper to show toast notification
function showNotificationToast(notification: Notification) {
  const lang = (localStorage.getItem('samalot.lang') || 'ar') as 'ar' | 'en';
  
  toast.info(notification.title, {
    description: notification.body,
    duration: 5000,
    action: {
      label: t('g.view', lang),
      onClick: () => {
        // Navigate to relevant page
        if (notification.relatedId) {
          const path = getNotificationPath(notification);
          window.location.href = path;
        }
      },
    },
  });
}

// Helper to show system notification
async function showSystemNotification(notification: Notification) {
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(notification.title, {
    body: notification.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: notification.id,
    requireInteraction: false,
    data: {
      notificationId: notification.id,
      relatedId: notification.relatedId,
      type: notification.type,
    },
  });
}

// Get navigation path based on notification type
function getNotificationPath(notification: Notification): string {
  switch (notification.type) {
    case 'request_received':
    case 'request_accepted_by_seller':
    case 'request_approved_by_admin':
    case 'appointment_confirmed':
      return '/dashboard';
    case 'listing_approved':
    case 'listing_rejected':
      return notification.relatedId ? `/listings/${notification.relatedId}` : '/dashboard';
    case 'deal_done':
    case 'deal_failed':
      return '/dashboard';
    default:
      return '/';
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Send local notification (for testing)
export async function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    ...options,
  });
}
