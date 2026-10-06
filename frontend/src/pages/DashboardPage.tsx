import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, useSession } from "../lib/auth-client";
import { SignOutButton } from "../components/SignOutButton";
import { AddWidgetFlow } from "../components/AddWidgetFlow";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { WidgetGrid } from "../components/WidgetGrid";
import type { WidgetInstance } from "../lib/widgets";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [isAddingWidget, setIsAddingWidget] = useState(false);
    const [instances, setInstances] = useState<WidgetInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<WidgetInstance | null>(null);
    const [deleteFailed, setDeleteFailed] = useState(false);

    const loadInstances = useCallback(async() => {
        try {
            const res = await fetch(`${API_URL}/api/widgets`, {credentials: "include"});
            if (!res.ok) {
                throw new Error();
            }
            setInstances(await res.json());
            setError(null);
        } catch {
            setError("Failed to load your widgets.");
        } finally {
            setLoading(false);
        }
    },[]);

    useEffect(() => {
        loadInstances();
    }, [loadInstances]);

    async function handleReorder(next: WidgetInstance[]) {
        const normalized = next.map((w, i) => ({ ...w, positionX: i, positionY: 0 }));
        setInstances(normalized);

        const res = await fetch(`${API_URL}/api/widgets/reorder`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({positions: normalized.map((w) => ({ id: w.id, positionX: w.positionX, positionY: w.positionY })),}),
        }).catch(() => null);

        if (!res?.ok) {
            setError("Failed to save the new widget order.");
            loadInstances();
        }
    }

    function askDelete(instance: WidgetInstance | null) {
        setDeleteFailed(false);
        setPendingDelete(instance);
    }

    async function confirmDelete() {
        const res = await fetch(`${API_URL}/api/widgets/${pendingDelete!.id}`, {
            method: "DELETE",
            credentials: "include",
        }).catch(() => null);

        if (!res?.ok) {
            return setDeleteFailed(true);
        }
        setInstances((prev) => prev.filter((i) => i.id !== pendingDelete!.id));
        setPendingDelete(null);
    }

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
                    <button
                        onClick={() => setIsAddingWidget(true)}
                        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[var(--surface)]"
                    >
                        + Add widget
                    </button>
                    {session.user.role === "ADMIN" && (
                        <Link
                            to="/admin"
                            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[var(--surface)]"
                        >
                            Admin
                        </Link>
                    )}
                    <Link
                        to="/profile"
                        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[var(--surface)]"
                    >
                        Profile
                    </Link>
                    <SignOutButton />
                </div>
            </header>

            {error && (
                <p role="alert" className="mb-4 text-sm text-[var(--danger)]">
                    {error}{" "}
                    <button onClick={loadInstances} className="underline">
                        Retry
                    </button>
                </p>
            )}
            {loading ? (<p className="text-sm text-slate-500">Loading your widgets…</p>) : instances.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center">
                    <p className="text-sm text-slate-400">Your dashboard is empty.</p>
                    <button
                        onClick={() => setIsAddingWidget(true)}
                        className="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                    >
                        Add your first widget
                    </button>
                </div>
            ) : (
                <WidgetGrid instances={instances} onDeleteRequest={askDelete} onReorder={handleReorder}/>
            )}

            {isAddingWidget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                        <AddWidgetFlow
                            onClose={() => setIsAddingWidget(false)}
                            onAdded={loadInstances}
                        />
                    </div>
                </div>
            )}
            {pendingDelete && (
                <ConfirmDialog
                    message={`Delete "${pendingDelete.widgetType.name}" ? This cannot be undone.`}
                    error={deleteFailed ? "Failed to delete the widget. Please try again." : null}
                    onConfirm={confirmDelete}
                    onCancel={() => askDelete(null)}
                />
            )}
        </main>
    );
}
