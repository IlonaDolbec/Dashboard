import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertValidParamsSchema, validateWidgetConfig } from "@/lib/widget-schema";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { widgetTypeId, config, refreshRateSeconds, positionX, positionY, width, height } = body;

    if (typeof widgetTypeId !== "string" || !widgetTypeId) {
        return NextResponse.json({ error: "widgetTypeId is required" }, { status: 400 });
    }
    if (!Number.isInteger(refreshRateSeconds) || refreshRateSeconds <= 0) {
        return NextResponse.json(
            { error: "refreshRateSeconds is required and must be a positive integer" },
            { status: 400 },
        );
    }

    const widgetType = await prisma.widgetType.findUnique({
        where: { id: widgetTypeId },
        include: {
            service: {
                include: { subscriptions: { where: { userId: session.user.id } } },
            },
        },
    });

    if (!widgetType) {
        return NextResponse.json({ error: "Widget type not found" }, { status: 404 });
    }

    const isSubscribed = widgetType.service.authType === "NONE" || widgetType.service.subscriptions.length > 0;
    if (!isSubscribed) {
        return NextResponse.json({ error: "You are not subscribed to this service" }, { status: 403 });
    }

    let paramsSchema;
    try {
        paramsSchema = assertValidParamsSchema(widgetType.paramsSchema);
    } catch {
        return NextResponse.json({ error: "This widget type is misconfigured" }, { status: 500 });
    }

    try {
        validateWidgetConfig(paramsSchema, config ?? {});
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }

    const instance = await prisma.widgetInstance.create({
        data: {
            userId: session.user.id,
            widgetTypeId,
            config: config ?? {},
            refreshRateSeconds,
            positionX: positionX ?? 0,
            positionY: positionY ?? 0,
            width: width ?? 1,
            height: height ?? 1,
        },
    });
    return NextResponse.json(instance, { status: 201})
}

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instances = await prisma.widgetInstance.findMany({
        where: { userId: session.user.id },
        orderBy: [{ positionY: "asc" }, { positionX: "asc" }, { createdAt: "asc" }],
        include: {
            widgetType: {
                select: {
                    key: true,
                    name: true,
                    service: { select:{ name: true }},
                },
            },
        },
    });
    return NextResponse.json(instances);
}