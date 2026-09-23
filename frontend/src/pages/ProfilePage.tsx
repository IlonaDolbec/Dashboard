import { useEffect, useState } from "react";
import { ServiceSubscriptionCard } from "../components/ServiceSubscriptionCard";
import { Link } from "react-router-dom";

export default function ProfilePage() {
    const [services, setServices] = useState<any[]>([]);

    const loadServices = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, {credentials: "include"});
        if (res.ok) setServices(await res.json());
    };

    useEffect(() => {
        loadServices();
    }, []);

    return (
        <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Services Profil</h1>
                <Link to="/dashboard" className="text-blue-400 hover:underline">Retour au Dashboard</Link>
            </header>
            
            <div>
                {services.map(service => (
                    <ServiceSubscriptionCard 
                        key={service.id} 
                        service={service} 
                        onStatusChange={loadServices} 
                    />
                ))}
            </div>
        </main>
    );
}