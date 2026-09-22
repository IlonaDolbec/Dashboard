import { Link } from "react-router-dom";

export default function CheckEmailPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <h1 className="mb-3 text-xl font-semibold">Confirm your email</h1>
                <p className="text-sm text-slate-400">
                    We sent a confirmation link to your email address. Click it to activate your account, then log in.
                </p>
                <Link to="/login" className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline">
                    Back to login
                </Link>
            </div>
        </main>
    );
}
