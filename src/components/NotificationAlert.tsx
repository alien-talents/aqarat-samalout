import { useEffect, useState } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/useNotifications';
import { useLang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function NotificationAlert() {
  const lang = useLang();
  const { isSupported, permission, requestPermission, isEnabled } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('notification-alert-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show alert after 5 seconds if notifications are supported but not enabled
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('notification-alert-dismissed', 'true');
  };

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  if (!isVisible || isDismissed || !isSupported || permission !== 'default') {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40",
      "animate-in slide-in-from-top-4 fade-in duration-300"
    )}>
      <div className="surface-card border border-primary/20 shadow-lg rounded-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <BellRing className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">
                {lang === 'ar' ? 'ابقَ على اطلاع' : 'Stay Updated'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
            {lang === 'ar' 
              ? `فعّل الإشعارات لتلقي تنبيهات فورية عند:
• الموافقة على إعلاناتك
• استلام طلبات مواعيد
• الرسائل والتحديثات المهمة`
              : `Enable notifications to receive instant alerts for:
• Listing approvals
• Appointment requests
• Important messages and updates`}
          </p>

          <div className="flex gap-2">
            <Button 
              onClick={handleEnable}
              className="flex-1 gap-2"
              size="sm"
            >
              <Bell className="h-4 w-4" />
              {lang === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDismiss}
            >
              {lang === 'ar' ? 'لاحقاً' : 'Later'}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-primary/20">
          <div 
            className="h-full bg-primary animate-[shrink_10s_linear_forwards]"
            style={{ animationDuration: '10s' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Persistent banner for notification settings
export function NotificationSettingsBanner() {
  const lang = useLang();
  const { isSupported, permission, requestPermission } = usePushNotifications();

  if (!isSupported || permission === 'granted') {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">
            {lang === 'ar' ? 'الإشعارات معطّلة' : 'Notifications Disabled'}
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            {permission === 'denied'
              ? (lang === 'ar' 
                  ? 'تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.'
                  : 'Notifications are blocked. Please enable them in browser settings.')
              : (lang === 'ar'
                  ? 'فعّل الإشعارات لتلقي التحديثات الفورية'
                  : 'Enable notifications to receive instant updates')}
          </p>
          {permission !== 'denied' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={requestPermission}
            >
              {lang === 'ar' ? 'تفعيل' : 'Enable'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
