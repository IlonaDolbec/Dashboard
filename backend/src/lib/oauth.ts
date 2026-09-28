import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Service, Subscription } from "@/generated/prisma/client";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export function getRedirectUri(serviceId: string) {
    return `${BACKEND_URL}/api/services/${serviceId}/oauth/callback`;
}

export function generateState() {
    return crypto.randomBytes(32).toString("hex");
}

export function buildAuthorizeUrl(service: Service, state: string) {
    if (!service.oauthAuthorizeUrl || !service.oauthClientId) {
        throw new Error("Service is missing OAuth configuration");
    }

    const url = new URL(service.oauthAuthorizeUrl);
    url.searchParams.set("client_id", service.oauthClientId);
    url.searchParams.set("redirect_uri", getRedirectUri(service.id));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    if (service.oauthScope) url.searchParams.set("scope", service.oauthScope);

    return url.toString();
}

type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
};

async function requestToken(service: Service, body: Record<string, string>): Promise<TokenResponse> {
    if (!service.oauthTokenUrl || !service.oauthClientId || !service.oauthClientSecret) {
        throw new Error("Service is missing OAuth configuration");
    }

    const res = await fetch(service.oauthTokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: new URLSearchParams({
            client_id: service.oauthClientId,
            client_secret: service.oauthClientSecret,
            ...body,
        }),
    });

    if (!res.ok) {
        throw new Error(`OAuth token request failed with status ${res.status}`);
    }

    return res.json();
}

export function exchangeCodeForToken(service: Service, code: string) {
    return requestToken(service, {
        grant_type: "authorization_code",
        code,
        redirect_uri: getRedirectUri(service.id),
    });
}

function refreshTokens(service: Service, refreshToken: string) {
    return requestToken(service, {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    });
}

function tokenExpiryDate(expiresIn?: number) {
    return expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
}

export async function saveTokens(userId: string, serviceId: string, tokens: TokenResponse) {
    const data = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accessTokenExpiresAt: tokenExpiryDate(tokens.expires_in),
    };

    return prisma.subscription.upsert({
        where: { userId_serviceId: { userId, serviceId } },
        update: data,
        create: { userId, serviceId, ...data },
    });
}

const EXPIRY_MARGIN_MS = 60_000;

export async function getValidAccessToken(subscription: Subscription, service: Service) {
    const isExpired =
        subscription.accessTokenExpiresAt !== null &&
        subscription.accessTokenExpiresAt.getTime() - EXPIRY_MARGIN_MS <= Date.now();

    if (!isExpired || !subscription.refreshToken) {
        return subscription.accessToken;
    }

    const tokens = await refreshTokens(service, subscription.refreshToken);
    const updated = await saveTokens(subscription.userId, subscription.serviceId, {
        ...tokens,
        refresh_token: tokens.refresh_token ?? subscription.refreshToken,
    });

    return updated.accessToken;
}
