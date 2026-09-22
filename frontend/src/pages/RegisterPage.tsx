import { Link } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                <h1 className="mb-6 text-xl font-semibold">Create an account</h1>
                <RegisterForm />
                <p className="mt-4 text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[var(--accent)] hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}
