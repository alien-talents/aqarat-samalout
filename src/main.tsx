import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from './hooks/usePWA';

// Register service worker for PWA
createRoot(document.getElementById("root")!).render(<App />);

// Register service worker
registerServiceWorker();
