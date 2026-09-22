import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(request: NextRequest) {
  const services = await prisma.service.findMany({
    include: { widgetTypes: true },
  });

  const host = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";

  return NextResponse.json({
    client: { host },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services: services.map((service) => ({
        name: service.key,
        widgets: service.widgetTypes.map((widgetType) => ({
          name: widgetType.key,
          params: widgetType.paramsSchema,
        })),
      })),
    },
  });
}