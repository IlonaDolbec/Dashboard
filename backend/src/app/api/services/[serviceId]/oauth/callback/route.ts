import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, saveTokens } from "@/lib/oauth";
import { getReturnUrl, getSteamIdFromLogin } from "@/lib/steam";

const STATE_COOKIE = "oauth_state";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

export async function GET(req: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { serviceId } = await params;

    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get(STATE_COOKIE)?.value;

    const res = NextResponse.redirect(`${frontendUrl}/profile`);
    res.cookies.delete(STATE_COOKIE);

    if (!state || !storedState || storedState !== `${serviceId}:${state}`) {
        return NextResponse.json({ error: "Invalid or expired OAuth state" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (service.authType === "OPENID") {
        try {
            const steamId = await getSteamIdFromLogin(req.nextUrl.searchParams, getReturnUrl(serviceId, state));
            await prisma.subscription.upsert({
                where: { userId_serviceId: { userId: session.user.id, serviceId } },
                update: { accountId: steamId },
                create: { userId: session.user.id, serviceId, accountId: steamId },
            });
        } catch {
            return NextResponse.json({ error: "Failed to link Steam account" }, { status: 400 });
        }
        return res;
    }

    const code = req.nextUrl.searchParams.get("code");
    if (service.authType !== "OAUTH" || !code) {
        return NextResponse.json({ error: "Invalid OAuth callback" }, { status: 400 });
    }

    try {
        const tokens = await exchangeCodeForToken(service, code);
        await saveTokens(session.user.id, serviceId, tokens);
    } catch {
        return NextResponse.json({ error: "Failed to exchange OAuth code for tokens" }, { status: 502 });
    }

    return res;
}
