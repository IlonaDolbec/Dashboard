import { useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";

type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    banned: boolean;
};

export function AdminUserTable() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const { data, error: listError } = await authClient.admin.listUsers({
            query: { limit: 50, sortBy: "createdAt", sortDirection: "desc" },
        });
        setLoading(false);

        if (listError) {
            setError(listError.message ?? "Failed to load users.");
            return;
        }

        setUsers(
            (data?.users ?? []).map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: (u.role as string) ?? "USER",
                emailVerified: u.emailVerified,
                banned: Boolean(u.banned),
            })),
        );
        setTotal(data?.total ?? 0);
    }

    async function toggleBan(user: AdminUser) {
        setPendingId(user.id);
        setError(null);

        const { error: actionError } = user.banned
            ? await authClient.admin.unbanUser({ userId: user.id })
            : await authClient.admin.banUser({
                  userId: user.id,
                  banReason: "Disabled by an administrator",
              });

        setPendingId(null);

        if (actionError) {
            setError(actionError.message ?? "Action failed.");
            return;
        }

        setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, banned: !u.banned } : u)),
        );
    }

    async function removeUser(user: AdminUser) {
        if (!confirm(`Delete ${user.email}? This cannot be undone.`)) {
            return;
        }

        setPendingId(user.id);
        setError(null);

        const { error: actionError } = await authClient.admin.removeUser({ userId: user.id });

        setPendingId(null);

        if (actionError) {
            setError(actionError.message ?? "Action failed.");
            return;
        }

        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setTotal((prev) => prev - 1);
    }

    if (loading) {
        return <p className="text-sm text-slate-500">Loading users...</p>;
    }

    return (
        <div>
            <p className="mb-3 text-sm text-slate-400">{total} registered users</p>
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                {error && (
                    <p className="border-b border-[var(--border)] bg-red-950 px-4 py-2 text-sm text-[var(--danger)]">
                        {error}
                    </p>
                )}
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--surface)] text-slate-400">
                        <tr>
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Email</th>
                            <th className="px-4 py-2 font-medium">Role</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t border-[var(--border)]">
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2 text-slate-400">{user.email}</td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="px-4 py-2">
                                    {user.banned ? (
                                        <span className="text-[var(--danger)]">Disabled</span>
                                    ) : user.emailVerified ? (
                                        <span className="text-emerald-400">Active</span>
                                    ) : (
                                        <span className="text-amber-400">Unconfirmed</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {user.id === session?.user.id ? (
                                        <span className="text-xs text-slate-500">You</span>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => toggleBan(user)}
                                                disabled={pendingId === user.id}
                                                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-slate-300 transition hover:bg-[var(--background)] disabled:opacity-50"
                                            >
                                                {user.banned ? "Enable" : "Disable"}
                                            </button>
                                            <button
                                                onClick={() => removeUser(user)}
                                                disabled={pendingId === user.id}
                                                className="rounded-md border border-red-900 px-2 py-1 text-xs text-[var(--danger)] transition hover:bg-red-950 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
