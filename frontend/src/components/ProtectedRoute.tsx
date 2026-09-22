import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../lib/auth-client";

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
    const { data: session, isPending } = useSession();
    const location = useLocation();

    if (isPending) {
        return null;
    }

    if (!session) {
        return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (!session.user.emailVerified) {
        return <Navigate to="/login?verified=0" replace />;
    }

    if (adminOnly && session.user.role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
