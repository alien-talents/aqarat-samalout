# PWA Troubleshooting Guide

## 🔴 PWA Install Not Working - Common Issues

### Issue 1: Missing Icons
**Problem:** Manifest references icons that don't exist.

**Fix:**
1. Open `public/icon-generator.html` in your browser
2. Right-click each icon size and "Save Image As" to `public/` folder
3. Or use the SVG to create icons:
   ```bash
   # Using ImageMagick (if installed)
   convert public/icons.svg -resize 192x192 public/icon-192x192.png
   convert public/icons.svg -resize 512x512 public/icon-512x512.png
   ```

**Required icon files:**
- `icon-192x192.png` (required for PWA install)
- `icon-512x512.png` (required for PWA install)
- `icon-72x72.png`
- `icon-96x96.png`

### Issue 2: Service Worker Not Registered
**Problem:** `sw.js` not loading or caching wrong files.

**Fix:**
1. Open DevTools > Application > Service Workers
2. Check if `sw.js` is registered
3. If not, hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Unregister old service workers and reload

### Issue 3: Not HTTPS (Production)
**Problem:** PWA requires HTTPS in production.

**Fix:**
- Localhost works without HTTPS
- For production, host on HTTPS-enabled platform (Vercel, Netlify, etc.)

### Issue 4: Browser Compatibility
**Problem:** Some browsers don't support PWA install.

**Supported Browsers:**
- ✅ Chrome (Windows, Mac, Android)
- ✅ Edge (Windows, Mac, Android)
- ✅ Safari (iOS 16.4+, Mac)
- ❌ Firefox (no PWA install support)
- ❌ Private/Incognito mode (usually blocked)

### Issue 5: User Dismissed Install
**Problem:** User clicked "Later" or dismissed the prompt.

**Fix:**
- Clear localStorage: `localStorage.removeItem('pwa-prompt-dismissed')`
- Or add manual install button (see PWASettings component)

---

## ✅ How to Test PWA

### 1. Check Manifest
```
Chrome DevTools > Application > Manifest
```
- Should show all icons
- No errors

### 2. Check Service Worker
```
Chrome DevTools > Application > Service Workers
```
- Should show "sw.js" as activated
- Status should be green

### 3. Run Lighthouse PWA Audit
```
Chrome DevTools > Lighthouse > PWA
```
- Should pass all PWA checks

### 4. Test Install
```
Chrome DevTools > Application > Manifest > "Add to homescreen"
```
Or look for install icon in address bar (➕ or 📱 icon).

---

## 📱 Notifications System

### For Non-Signed-In Users:
| Notification | Type | Description |
|--------------|------|-------------|
| **PWA Install Prompt** | UI Banner | Asks to install app (appears after 3s) |
| **Push Permission** | Browser Dialog | Asks to enable push notifications (appears after 5s) |
| **No Real-time Updates** | - | Cannot receive personalized notifications without account |

### For Signed-In Users:
| Notification | Type | Trigger |
|--------------|------|---------|
| **Listing Approved** | Toast + Push | When admin approves user's listing |
| **New Request** | Toast + Push | When someone requests appointment for user's listing |
| **Request Status Change** | Toast + Push | When request is accepted/rejected |
| **Appointment Confirmed** | Toast + Push | When appointment is scheduled |
| **Deal Updates** | Toast + Push | When deal status changes |
| **Real-time Badge** | UI Update | Notification bell count updates live |

### Notification Features:
- ✅ In-app notification dropdown (NotificationBell)
- ✅ Toast notifications (Sonner)
- ✅ Push notifications (when enabled)
- ✅ Real-time sync from Supabase
- ✅ Mark as read / mark all as read

---

## 🔧 Quick Fixes

### Reset Everything
```javascript
// Clear localStorage
localStorage.clear();

// Unregister service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Clear cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Reload
location.reload();
```

### Add Manual Install Button
Add this to any page (like Dashboard):
```tsx
import { PWASettings } from '@/components/PWASettings';

// In your component:
<PWASettings />
```

---

## 📋 PWA Checklist

- [ ] Icons exist in `public/` folder (192x192, 512x512)
- [ ] `manifest.json` is valid (check DevTools)
- [ ] `sw.js` is registered (check DevTools)
- [ ] App is served over HTTPS (or localhost)
- [ ] No console errors
- [ ] Lighthouse PWA audit passes
- [ ] Install prompt appears (Chrome/Edge)
