import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest,{ params }: { params: Promise<{ id: string }>},)
{
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { count } = await prisma.widgetInstance.deleteMany({
        where: { id, userId: session.user.id },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
}