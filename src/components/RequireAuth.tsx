import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/store";

export function RequireAuth({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const u = getCurrentUser();
  const loc = useLocation();
  if (!u) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (admin && !u.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
