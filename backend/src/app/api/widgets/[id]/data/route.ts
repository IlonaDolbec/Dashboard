import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeather, getForecast, WeatherError } from "@/lib/weather";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const instance = await prisma.widgetInstance.findFirst({
        where: { id, userId: session.user.id },
        include: { widgetType: { include: { service: true } } },
    });
    if (!instance) return NextResponse.json({ error: "Widget not found" }, { status: 404 });

    const config = instance.config as Record<string, unknown>;

    try {
        let data: unknown;
        if (instance.widgetType.service.key === "weather") {
            if (instance.widgetType.key === "city_temperature") {
                data = await getCurrentWeather(String(config.city));
            } else if (instance.widgetType.key === "forecast_overview") {
                data = await getForecast(String(config.city), Number(config.days));
            }
        }
        if (data === undefined) {
            return NextResponse.json({ error: "This widget type has no data source" }, { status: 501 });
        }

        await prisma.widgetInstance.update({
            where: { id },
            data: { lastData: data as object, lastRefreshedAt: new Date() },
        });
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof WeatherError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Failed to fetch widget data" }, { status: 500 });
    }
}
