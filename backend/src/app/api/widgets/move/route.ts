import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json().catch(() => ({}));
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
        return NextResponse.json({ error: "ids must be an array of strings" }, { status: 400 });
    }
    await prisma.$transaction(
        ids.map((id, index) =>
            prisma.widgetInstance.updateMany({
                where: { id, userId: session.user.id },
                data: { positionX: index, positionY: 0 },
            }),
        ),
    );
    return new NextResponse(null, { status: 204 });
}
