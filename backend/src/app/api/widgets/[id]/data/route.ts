import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeather, getForecast, WeatherError } from "@/lib/weather";
import { getCurrentlyPlaying, getMostPlayedGames, SteamError, CurrentlyPlaying } from "@/lib/steam";
import { getClock, getCountdown, TimeError } from "@/lib/time";

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
        } else if (instance.widgetType.service.key === "steam") {
            const subscription = await prisma.subscription.findUnique({
                where: {
                    userId_serviceId: { userId: session.user.id, serviceId: instance.widgetType.serviceId },
                },
            });
            if (!subscription?.accountId) {
                return NextResponse.json({ error: "Steam account not linked" }, { status: 409 });
            }
            if (instance.widgetType.key === "currently_playing") {
                data = await getCurrentlyPlaying(
                    subscription.accountId,
                    String(config.display_mode),
                    instance.lastData as CurrentlyPlaying | null,
                );
            } else if (instance.widgetType.key === "most_played_games") {
                data = await getMostPlayedGames(
                    subscription.accountId,
                    String(config.order),
                    Number(config.game_count),
                );
            }
        } else if (instance.widgetType.service.key === "time") {
            if (instance.widgetType.key === "timezone_clock") {
                data = getClock(String(config.timezone));
            } else if (instance.widgetType.key === "countdown") {
                data = getCountdown(String(config.label), String(config.target_date));
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
        if (err instanceof WeatherError || err instanceof SteamError || err instanceof TimeError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        return NextResponse.json({ error: "Failed to fetch widget data" }, { status: 500 });
    }
}
