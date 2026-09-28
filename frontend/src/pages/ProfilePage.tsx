import { useCallback, useEffect, useState } from "react";
import { ServiceSubscriptionCard } from "../components/ServiceSubscriptionCard";
import { Link } from "react-router-dom";

export default function ProfilePage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadServices = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, { credentials: "include" });
            if (!res.ok) throw new Error();
            setServices(await res.json());
            setError(null);
        } catch {
            setError("Could not load services. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const subscribed = services.filter((service) => service.isSubscribed);
    const available = services.filter((service) => !service.isSubscribed);

    return (
        <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Services Profil</h1>
                <Link to="/dashboard" className="text-blue-400 hover:underline">Retour au Dashboard</Link>
            </header>

            {loading && <p className="text-sm text-slate-400">Loading services…</p>}

            {error && (
                <div role="alert" className="mb-6 flex items-center justify-between rounded-md border border-red-500/40 p-3 text-sm text-red-400">
                    <span>{error}</span>
                    <button onClick={loadServices} className="underline">Retry</button>
                </div>
            )}

            {!loading && !error && (
                <>
                    <section className="mb-10">
                        <h2 className="mb-3 text-lg font-medium">My services ({subscribed.length})</h2>
                        {subscribed.length === 0 ? (
                            <p className="rounded-md border border-dashed p-4 text-sm text-slate-500">
                                You are not subscribed to any service yet. Pick one below.
                            </p>
                        ) : (
                            subscribed.map((service) => (
                                <ServiceSubscriptionCard key={service.id} service={service} onStatusChange={loadServices} />
                            ))
                        )}
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-medium">Available services ({available.length})</h2>
                        {available.length === 0 ? (
                            <p className="rounded-md border border-dashed p-4 text-sm text-slate-500">
                                You are subscribed to every available service.
                            </p>
                        ) : (
                            available.map((service) => (
                                <ServiceSubscriptionCard key={service.id} service={service} onStatusChange={loadServices} />
                            ))
                        )}
                    </section>
                </>
            )}
        </main>
    );
}