import { Link } from "react-router-dom";
import { useSession } from "../lib/auth-client";
import { SignOutButton } from "../components/SignOutButton";

export default function DashboardPage() {
    const { data: session } = useSession();

    if (!session) {
        return null;
    }

    return (
        <main className="min-h-screen px-6 py-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-slate-400">Welcome back, {session.user.name}.</p>
                </div>
                <div className="flex items-center gap-3">
                    {session.user.role === "ADMIN" && (
                        <Link
                            to="/admin"
                            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[var(--surface)]"
                        >
                            Admin
                        </Link>
                    )}
                    <SignOutButton />
                </div>
            </header>

            <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center text-sm text-slate-500">
                No widgets yet. Subscribe to a service to get started.
            </div>
        </main>
    );
}
