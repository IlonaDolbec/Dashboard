import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

export function RegisterForm() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setPending(true);

        const { error: signUpError } = await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: `${window.location.origin}/login?verified=1`,
        });

        setPending(false);

        if (signUpError) {
            setError(signUpError.message ?? "Registration failed. Please try again.");
            return;
        }
        navigate("/register/check-email");
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-sm text-slate-300">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
            </div>
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
                    minLength={8}
                    autoComplete="new-password"
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
                {pending ? "Creating account..." : "Create account"}
            </button>
            <button
                type="button"
                className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-35"
                onClick={() => authClient.signIn.social({
                    provider: "google",
                    callbackURL: `${window.location.origin}/dashboard`,
                })}>
                Continue with Google
            </button>
            <button
                type="button"
                className="mt-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-35"
                onClick={() => authClient.signIn.social({
                    provider: "github",
                    callbackURL: `${window.location.origin}/dashboard`,
                })}>
                Continue with GitHub
            </button>
        </form>
    );
}
