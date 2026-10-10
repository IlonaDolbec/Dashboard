import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertValidParamsSchema, validateWidgetConfig } from "@/lib/widget-schema";

export async function PATCH(req: NextRequest, { params }: {params: Promise<{ id: string }>})
{
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { config, refreshRateSeconds } = await req.json().catch(() => ({}));

    if (!Number.isInteger(refreshRateSeconds) || refreshRateSeconds <= 0) {
        return NextResponse.json({ error: "refreshRateSeconds must be a positive integer" }, { status: 400 });
    }

    const instance = await prisma.widgetInstance.findFirst({
        where: { id, userId: session.user.id },
        include: { widgetType: true },
    });
    if (!instance) {
      return NextResponse.json({error: "Widget not found"}, { status: 404 });
    }
    try {
        validateWidgetConfig(assertValidParamsSchema(instance.widgetType.paramsSchema), config ?? {});
    } catch (err) {
        return NextResponse.json({error: (err as Error).message}, { status: 400 });
    }

    const updated = await prisma.widgetInstance.update({
        where: { id },
        data: { config, refreshRateSeconds },
        include: {
            widgetType: {
                select: { key: true, name: true, service: {select: {name: true}}},
            },
        },
    });
    return NextResponse.json(updated);
}

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