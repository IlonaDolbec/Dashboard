import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const services = await prisma.service.findMany({
        include: {
            subscriptions: {
                where: { userId: session.user.id }
            }
        }
    });

    const formattedServices = services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        authType: service.authType,
        isSubscribed: service.authType === "NONE" || service.subscriptions.length > 0
    }));

    return NextResponse.json(formattedServices);
}