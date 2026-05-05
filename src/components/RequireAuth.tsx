import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const loc = useLocation();
  
  // Show nothing while checking auth state
  if (isLoading) return null;
  
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (admin && !user.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
