import { Navigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";

export default function HomePage() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return null;
    }

    return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}
