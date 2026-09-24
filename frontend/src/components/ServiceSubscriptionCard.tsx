import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export function ServiceSubscriptionCard({ service, onStatusChange }: { service: any, onStatusChange: () => void }) {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const sendRequest = async (method: "POST" | "DELETE", body?: object) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/services/${service.id}/subscribe`, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!res.ok) {
                throw new Error();
            }
            onStatusChange();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = () => {
        const confirmed = window.confirm(
            `Unsubscribe from ${service.name}? Your stored credentials for this service will be deleted.`
        );
        if (confirmed) sendRequest("DELETE");
    };

    if (service.authType === "NONE") {
        return (
            <div className="border p-4 rounded-md mb-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm">Included</span>
            </div>
        );
    }

    return (
        <div className="border p-4 rounded-md mb-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                {service.isSubscribed && (
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm">Subscribed</span>
                        <button
                            onClick={handleUnsubscribe}
                            disabled={loading}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-sm transition-colors hover:bg-red-500/30 disabled:opacity-50"
                        >
                            {loading ? "Unsubscribing…" : "Unsubscribe"}
                        </button>
                    </div>
                )}
            </div>

            {!service.isSubscribed && service.authType === "CREDENTIALS" && (
                <form onSubmit={(e) => { e.preventDefault(); sendRequest("POST", { username, password });}} className="flex flex-col gap-2 mt-4">
                    <input type="text" placeholder="Username" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 rounded-md bg-transparent" required/>
                    <input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded-md bg-transparent" required/>
                    <button type="submit" disabled={loading} className="bg-blue-600 p-2 rounded-md text-white transition-colors hover:bg-blue-500 disabled:opacity-50">
                        {loading ? "Subscribing…" : "Subscribe"}
                    </button>
                </form>
            )}

            {!service.isSubscribed && service.authType === "OAUTH" && (
                <button onClick={() => {window.location.href = `${API_URL}/api/services/${service.id}/oauth/start`;}}
                    className="mt-4 bg-purple-600 p-2 rounded-md text-white w-full transition-colors hover:bg-purple-500"
                >
                    Connect with {service.name}
                </button>
            )}

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}