import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import PostListing from "./pages/PostListing.tsx";
import Admin from "./pages/Admin.tsx";
import Profile from "./pages/Profile.tsx";

const queryClient = new QueryClient();

const App = () => {
  // Initialize dark theme by default
  useEffect(() => {
    const saved = localStorage.getItem("samalot.theme");
    const theme = saved || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (!saved) localStorage.setItem("samalot.theme", "dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/post" element={<PostListing />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
