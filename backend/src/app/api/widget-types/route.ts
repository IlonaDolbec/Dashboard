import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const widgetTypes = await prisma.widgetType.findMany({
        where: {
            service: {
                OR: [
                    { authType: "NONE" },
                    { subscriptions:{some:{ userId: session.user.id }}},
                ],
            },
        },
        select: {
            id: true,
            key: true,
            name: true,
            description: true,
            paramsSchema: true,
            service:{select:{ id: true, name: true }},
        },
    });

    return NextResponse.json(widgetTypes);
}