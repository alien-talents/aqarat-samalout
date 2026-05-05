import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import ListingDetail from "./pages/ListingDetail";
import NewListing from "./pages/NewListing";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import { RequireAuth } from "./components/RequireAuth";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { NotificationAlert } from "./components/NotificationAlert";
import { applyLangToDocument, getLang } from "./lib/i18n";
import { ensureSeed } from "./lib/store";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Force dark theme
    const saved = localStorage.getItem("samalot.theme");
    const theme = saved || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (!saved) localStorage.setItem("samalot.theme", "dark");
    // Apply language + RTL
    applyLangToDocument(getLang());
    // Seed data
    ensureSeed();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          {/* Notification Permission Alert */}
          <NotificationAlert />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile-setup"
              element={
                <RequireAuth>
                  <ProfileSetup />
                </RequireAuth>
              }
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route
              path="/listings/new"
              element={
                <RequireAuth>
                  <NewListing />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth admin>
                  <Admin />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
