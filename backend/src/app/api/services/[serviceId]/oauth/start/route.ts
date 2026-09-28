import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAuthorizeUrl, generateState } from "@/lib/oauth";

const STATE_COOKIE = "oauth_state";

export async function GET(req: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceId } = await params;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (service.authType !== "OAUTH") {
        return NextResponse.json({ error: "This service does not support OAuth" }, { status: 400 });
    }

    const state = generateState();
    let authorizeUrl: string;
    try {
        authorizeUrl = buildAuthorizeUrl(service, state);
    } catch {
        return NextResponse.json({ error: "This service is not configured for OAuth" }, { status: 500 });
    }

    const res = NextResponse.redirect(authorizeUrl);
    res.cookies.set(STATE_COOKIE, `${serviceId}:${state}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
        path: "/",
    });

    return res;
}
