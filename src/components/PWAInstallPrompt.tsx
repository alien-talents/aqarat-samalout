import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { t } from '@/lib/i18n';
import { useLang } from '@/lib/i18n';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWA();
  const lang = useLang();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (dismissedTime && Date.now() - dismissedTime < oneWeek) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Show prompt after 3 seconds if installable and not dismissed
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    await install();
    setIsVisible(false);
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="surface-card border border-border/50 shadow-lg rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              {lang === 'ar' ? 'حمّل التطبيق' : 'Install App'}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {lang === 'ar' 
                ? 'أضف عقارات سمالوط إلى شاشتك الرئيسية للوصول السريع والإشعارات الفورية'
                : 'Add Samalot Real Estate to your home screen for quick access and instant notifications'}
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="flex-1 text-xs"
              >
                <Download className="h-3.5 w-3.5 me-1.5" />
                {lang === 'ar' ? 'تثبيت' : 'Install'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-xs"
              >
                {lang === 'ar' ? 'لاحقاً' : 'Later'}
              </Button>
            </div>
          </div>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 -mt-1 -me-1"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Standalone PWA Badge for header
export function PWABadge() {
  const { isStandalone } = usePWA();
  const lang = useLang();

  if (!isStandalone) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
      <Smartphone className="h-3 w-3" />
      {lang === 'ar' ? 'تطبيق' : 'App'}
    </span>
  );
}
