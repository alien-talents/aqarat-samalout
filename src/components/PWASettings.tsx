import { useState, useEffect } from 'react';
import { Download, Check, Info, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePWA, registerServiceWorker, checkForUpdates } from '@/hooks/usePWA';
import { useLang } from '@/lib/i18n';
import { toast } from 'sonner';

export function PWASettings() {
  const lang = useLang();
  const { isInstallable, isInstalled, isStandalone, install } = usePWA();
  const [swStatus, setSwStatus] = useState<'checking' | 'registered' | 'error'>('checking');
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    checkServiceWorker();
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        setSwStatus('registered');
        
        // Check for updates
        const hasUpdate = await checkForUpdates();
        setUpdateAvailable(hasUpdate);
      } catch {
        setSwStatus('error');
      }
    } else {
      setSwStatus('error');
    }
  };

  const handleInstall = async () => {
    try {
      await install();
      toast.success(lang === 'ar' ? 'تم تثبيت التطبيق!' : 'App installed!');
    } catch {
      toast.error(lang === 'ar' ? 'لم يتم التثبيت' : 'Installation cancelled');
    }
  };

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {lang === 'ar' ? 'تطبيق الويب' : 'Web App'}
        </CardTitle>
        <CardDescription>
          {lang === 'ar' 
            ? 'تثبيت التطبيق على جهازك للوصول السريع' 
            : 'Install the app on your device for quick access'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Install Status */}
        {isInstalled ? (
          <Alert className="bg-green-500/10 border-green-500/20">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>
              {lang === 'ar' ? 'تم التثبيت!' : 'Installed!'}
            </AlertTitle>
            <AlertDescription>
              {isStandalone 
                ? (lang === 'ar' ? 'أنت تستخدم التطبيق كتطبيق مستقل' : 'You\'re using the app as a standalone app')
                : (lang === 'ar' ? 'تم تثبيت التطبيق. يمكنك فتحه من الشاشة الرئيسية' : 'App is installed. Open it from your home screen')}
            </AlertDescription>
          </Alert>
        ) : isInstallable ? (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>
                {lang === 'ar' ? 'تثبيت متاح' : 'Install Available'}
              </AlertTitle>
              <AlertDescription>
                {lang === 'ar' 
                  ? 'يمكنك تثبيت هذا التطبيق على جهازك للوصول السريع واستخدامه بدون متصفح'
                  : 'You can install this app on your device for quick access and use it without a browser'}
              </AlertDescription>
            </Alert>
            <Button onClick={handleInstall} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
            </Button>
          </>
        ) : (
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle>
              {lang === 'ar' ? 'التثبيت غير متاح' : 'Install Not Available'}
            </AlertTitle>
            <AlertDescription>
              {lang === 'ar' 
                ? 'قد يكون التطبيق مثبتاً بالفعل أو المتصفح لا يدعم تثبيت PWA. جرب Chrome أو Edge.'
                : 'The app may already be installed or your browser doesn\'t support PWA install. Try Chrome or Edge.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Service Worker Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {lang === 'ar' ? 'حالة الخدمة:' : 'Service Status:'}
            </span>
            <span className={swStatus === 'registered' ? 'text-green-500' : 'text-red-500'}>
              {swStatus === 'registered' 
                ? (lang === 'ar' ? '✓ نشط' : '✓ Active')
                : swStatus === 'checking'
                  ? (lang === 'ar' ? '⏳ جاري التحقق...' : '⏳ Checking...')
                  : (lang === 'ar' ? '✗ خطأ' : '✗ Error')}
            </span>
          </div>
        </div>

        {/* Update Button */}
        {updateAvailable && (
          <Button 
            variant="outline" 
            onClick={handleUpdate}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {lang === 'ar' ? 'تحديث التطبيق' : 'Update App'}
          </Button>
        )}

        {/* Debug Info */}
        <div className="text-xs text-muted-foreground pt-2">
          <p>Debug: {JSON.stringify({ isInstallable, isInstalled, isStandalone, swStatus })}</p>
        </div>
      </CardContent>
    </Card>
  );
}
