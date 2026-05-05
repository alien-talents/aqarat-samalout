import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePlatformNotifications, usePushNotifications } from '@/hooks/useNotifications';
import { useLang } from '@/lib/i18n';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const lang = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = usePlatformNotifications(userId);
  const { isEnabled, requestPermission, isSupported } = usePushNotifications();
  const prevUnreadCount = useRef(unreadCount);

  // Play sound on new notification
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && unreadCount > 0) {
      // Could play a subtle notification sound here
      // const audio = new Audio('/notification-sound.mp3');
      // audio.play().catch(() => {});
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={lang === 'ar' ? 'الإشعارات' : 'Notifications'}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 md:w-96 p-0" 
        align="end"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">
            {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {lang === 'ar' ? 'قراءة الكل' : 'Mark all read'}
              </Button>
            )}
          </div>
        </div>

        {/* Push Notification Settings */}
        {isSupported && !isEnabled && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                  {lang === 'ar' 
                    ? 'فعّل الإشعارات لتلقي تحديثات فورية'
                    : 'Enable notifications to receive instant updates'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs"
                  onClick={requestPermission}
                >
                  {lang === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">
                {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        
        <div className="p-2">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setIsOpen(false)}
            >
              {lang === 'ar' ? 'عرض كل الإشعارات' : 'View all notifications'}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  lang: string;
}

function NotificationItem({ notification, onClick, lang }: NotificationItemProps) {
  const getNotificationIcon = (type: Notification['type']) => {
    // You can customize icons based on notification type
    return null;
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return lang === 'ar' ? 'الآن' : 'Now';
    if (minutes < 60) return lang === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return lang === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    if (days < 7) return lang === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
    return notificationDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-start p-3 transition-colors hover:bg-accent",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          "flex-shrink-0 w-2 h-2 rounded-full mt-2",
          notification.isRead ? "bg-muted" : "bg-primary"
        )} />
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            !notification.isRead && "text-foreground"
          )}>
            {notification.title}
          </p>
          
          {notification.body && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {notification.body}
            </p>
          )}
          
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>

        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
      </div>
    </button>
  );
}
