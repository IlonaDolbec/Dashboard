import { Link } from "react-router-dom";
import { AdminUserTable } from "../components/AdminUserTable";

export default function AdminPage() {
    return (
        <main className="min-h-screen px-6 py-8">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-semibold">User administration</h1>
                <Link
                    to="/dashboard"
                    className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[var(--surface)]"
                >
                    Back to dashboard
                </Link>
            </header>

            <AdminUserTable />
        </main>
    );
}
