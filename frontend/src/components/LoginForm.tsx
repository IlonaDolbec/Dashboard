import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export function LoginForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const verified = searchParams.get("verified") === "1";
    const from = searchParams.get("from") ?? "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setPending(true);

        const { error: signInError } = await authClient.signIn.email({
            email,
            password,
        });

        setPending(false);

        if (signInError) {
            if (signInError.status === 403) {
                setError("Please confirm your email address before logging in. Click on the link.");
            } else {
                setError(signInError.message ?? "Invalid email or password.");
            }
            return;
        }

        navigate(from, { replace: true });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {verified && (
                <p className="rounded-md border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
                    Your email has been confirmed. You can now log in.
                </p>
            )}

            <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm text-slate-300">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm text-slate-300">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
            </div>

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <button
                type="submit"
                disabled={pending}
                className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
                {pending ? "Logging in..." : "Log in"}
            </button>
            <button
                className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-35"
                onClick={() => authClient.signIn.social({
                    provider: "google",
                    callbackURL: `${window.location.origin}/dashboard`,
                })}>
                Continue with Google
            </button>
        </form>
    );
}
