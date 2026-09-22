import { Link } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                <h1 className="mb-6 text-xl font-semibold">Log in</h1>
                <LoginForm />
                <p className="mt-4 text-sm text-slate-400">
                    No account yet?{" "}
                    <Link to="/register" className="text-[var(--accent)] hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}
