import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from './hooks/usePWA';

// Catch initialization errors
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('✅ React app mounted successfully');
} catch (error: any) {
  console.error('❌ React initialization failed:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; text-align: center;">
      <h1 style="color: #dc2626;">App Failed to Load</h1>
      <p style="color: #666;">${error.message || 'Unknown error'}</p>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        Check DevTools Console (F12) for details
      </p>
    </div>
  `;
}

// Register service worker
try {
  registerServiceWorker();
} catch (e) {
  console.warn('Service worker registration failed:', e);
}
