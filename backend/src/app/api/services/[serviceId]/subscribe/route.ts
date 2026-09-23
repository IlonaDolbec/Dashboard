import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptPassword } from "@/lib/crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceId } = await params;
    const { username, password } = await req.json().catch(() => ({}));

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (service.authType === "CREDENTIALS" && (!username || !password)) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const subData = {
        username: username || null,
        password: password ? encryptPassword(password) : null,
    };

    await prisma.subscription.upsert({
        where: { userId_serviceId: { userId: session.user.id, serviceId } },
        update: subData,
        create: { userId: session.user.id, serviceId, ...subData }
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceId } = await params;

    await prisma.subscription.deleteMany({
        where: {userId: session.user.id, serviceId}
    });

    return NextResponse.json({ success: true });
}