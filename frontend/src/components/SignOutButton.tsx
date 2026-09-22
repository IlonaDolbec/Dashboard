import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export function SignOutButton() {
    const navigate = useNavigate();

    async function handleSignOut() {
        await authClient.signOut();
        navigate("/login", { replace: true });
    }

    return (
        <button
            onClick={handleSignOut}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[var(--surface)]"
        >
            Sign out
        </button>
    );
}
