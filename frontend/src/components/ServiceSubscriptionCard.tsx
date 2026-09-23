import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export function ServiceSubscriptionCard({ service, onStatusChange }: { service: any, onStatusChange: () => void }) {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const sendRequest = async (method: "POST" | "DELETE", body?: object) => {
        setLoading(true);
        await fetch(`${API_URL}/api/services/${service.id}/subscribe`, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: body ? JSON.stringify(body) : undefined
        });
        setLoading(false);
        onStatusChange();
    };

    if (service.authType === "NONE") {
        return (
            <div className="border p-4 rounded-md mb-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm">Available</span>
            </div>
        );
    }

    return (
        <div className="border p-4 rounded-md mb-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                </div>
                {service.isSubscribed && (
                    <button onClick={() => sendRequest("DELETE")} disabled={loading} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-sm transition-all duration-200 hover:bg-red-500/30 hover:scale-105 active:scale-95">
                        Unsubscribe
                    </button>
                )}
            </div>

            {!service.isSubscribed && service.authType === "CREDENTIALS" && (
                <form onSubmit={(e) => { e.preventDefault(); sendRequest("POST", { username, password }); }} className="flex flex-col gap-2">
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="border p-2 rounded-md bg-transparent" required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded-md bg-transparent" required />
                    <button type="submit" disabled={loading} className="bg-blue-600 p-2 rounded-md text-white transition-all duration-200 hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99]">
                        Subscribe
                    </button>
                </form>
            )}

            {!service.isSubscribed && service.authType === "OAUTH" && (
                <button 
                    onClick={() => window.location.href = `${API_URL}/api/services/${service.id}/oauth/start`} 
                    className="bg-purple-600 p-2 rounded-md text-white w-full transition-all duration-200 hover:bg-purple-500 hover:scale-[1.01] active:scale-[0.99]"
                >
                    Connect with {service.name}
                </button>
            )}
        </div>
    );
}