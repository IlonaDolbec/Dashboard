import { MAX_GAME_COUNT, STEAM_API_URL, STEAM_OPENID_URL, STEAM_REQUEST_TIMEOUT_MS, STEAM_CDN_URL, STEAM_OPENID_NS } from "./constants";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export class SteamError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export interface CurrentlyPlaying {
    playing: boolean;
    appId?: number;
    name?: string;
    coverUrl?: string;
    startedAt?: string;
    elapsedSeconds?: number;
}

export interface MostPlayedGames {
    order: "most" | "least";
    games: {
        appId: number;
        name: string;
        coverUrl: string;
        minutes: number
    }[];
}

interface OwnedGame {
    appid: number;
    name: string;
    playtime_forever: number;
}

function coverUrl(appId: number) {
    return `${STEAM_CDN_URL}/${appId}/header.jpg`;
}

async function request(url: string | URL, init?: RequestInit) {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(STEAM_REQUEST_TIMEOUT_MS), cache: "no-store" });

    if (!res.ok) {
        throw new Error();
    }
    return res;
}

export function getReturnUrl(serviceId: string, state: string) {
    return `${BACKEND_URL}/api/services/${serviceId}/oauth/callback?state=${state}`;
}

export function buildSteamLoginUrl(serviceId: string, state: string) {
    const url = new URL(STEAM_OPENID_URL);
    url.searchParams.set("openid.ns", STEAM_OPENID_NS);
    url.searchParams.set("openid.mode", "checkid_setup");
    url.searchParams.set("openid.return_to", getReturnUrl(serviceId, state));
    url.searchParams.set("openid.realm", BACKEND_URL);
    url.searchParams.set("openid.identity", `${STEAM_OPENID_NS}/identifier_select`);
    url.searchParams.set("openid.claimed_id", `${STEAM_OPENID_NS}/identifier_select`);
    return url.toString();
}

export async function getSteamIdFromLogin(params: URLSearchParams, returnUrl: string) {
    if (params.get("openid.mode") !== "id_res" || params.get("openid.return_to") !== returnUrl) {
        throw new SteamError("Invalid Steam login response", 400);
    }

    const body = new URLSearchParams(params);
    body.set("openid.mode", "check_authentication");

    const res = await request(STEAM_OPENID_URL, { method: "POST", body });
    if (!/^is_valid:true$/m.test(await res.text())) {
        throw new SteamError("Steam login could not be verified", 401);
    }

    const match = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/.exec(params.get("openid.claimed_id") ?? "");
    if (!match) throw new SteamError("Invalid Steam identity", 400);
    return match[1];
}

async function fetchSteam(path: string, query: Record<string, string>) {
    const key = process.env.STEAM_API_KEY;
    if (!key) throw new SteamError("Steam is not configured on the server", 500);

    const url = new URL(`${STEAM_API_URL}${path}`);
    url.search = new URLSearchParams({ key, ...query }).toString();

    const res = await request(url);
    return res.json();
}

export async function getCurrentlyPlaying(steamId: string, displayMode: string, previous: CurrentlyPlaying | null): Promise<CurrentlyPlaying> {
    if (displayMode !== "compact" && displayMode !== "detailed") {
        throw new SteamError('"display_mode" must be "compact" or "detailed"', 400);
    }

    const data = await fetchSteam("/ISteamUser/GetPlayerSummaries/v2/", { steamids: steamId });
    const player = data.response?.players?.[0];

    if (!player) {
        throw new SteamError("Steam profile not found", 404);
    }
    if (!player.gameid) {
        return { playing: false };
    }
    const appId = Number(player.gameid);
    const startedAt = (previous?.appId === appId && previous.startedAt) || new Date().toISOString();

    return {
        playing: true,
        appId,
        name: player.gameextrainfo ?? "Unknown game",
        coverUrl: coverUrl(appId),
        startedAt,
        elapsedSeconds: Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
    };
}

export async function getMostPlayedGames(steamId: string, order: string, gameCount: number): Promise<MostPlayedGames> {
    if (order !== "most" && order !== "least") {
        throw new SteamError('"order" must be "most" or "least"', 400);
    }
    if (!Number.isInteger(gameCount) || gameCount < 1 || gameCount > MAX_GAME_COUNT) {
        throw new SteamError(`"game_count" must be an integer between 1 and ${MAX_GAME_COUNT}`, 400);
    }

    const data = await fetchSteam("/IPlayerService/GetOwnedGames/v1/", {
        steamid: steamId,
        include_appinfo: "1",
        include_played_free_games: "1",
    });
    const owned: OwnedGame[] | undefined = data.response?.games;
    if (!owned) {
        throw new SteamError("Steam game details are private: make them public in your Steam privacy settings", 403);
    }
    const games = owned
        .filter((game) => game.playtime_forever > 0)
        .map((game) => ({
            appId: game.appid,
            name: game.name,
            coverUrl: coverUrl(game.appid),
            minutes: game.playtime_forever,
        }))
        .sort((a, b) => (order === "most" ? b.minutes - a.minutes : a.minutes - b.minutes));
    return { order, games: games.slice(0, gameCount) };
}
