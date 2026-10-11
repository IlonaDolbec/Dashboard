import path from "node:path";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: path.resolve(__dirname, "../../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type ServiceSeed = {
    id: string;
    key: string;
    name: string;
    description?: string;
    authType: "NONE" | "CREDENTIALS" | "OAUTH" | "OPENID";
    oauthAuthorizeUrl?: string;
    oauthTokenUrl?: string;
    oauthClientId?: string;
    oauthClientSecret?: string;
    oauthScope?: string;
};

const services: ServiceSeed[] = [
    {
        id: "github",
        key: "github",
        name: "GitHub",
        description: "Access repositories, issues and user data from GitHub.",
        authType: "OAUTH",
        oauthAuthorizeUrl: "https://github.com/login/oauth/authorize",
        oauthTokenUrl: "https://github.com/login/oauth/access_token",
        oauthClientId: process.env.GITHUB_CLIENT_ID,
        oauthClientSecret: process.env.GITHUB_CLIENT_SECRET,
        oauthScope: "repo read:user",
    },
    {
        id: "weather",
        key: "weather",
        name: "Weather",
        description: "Current conditions and forecasts for any city. No account required.",
        authType: "NONE",
    },
    {
        id: "steam",
        key: "steam",
        name: "Steam",
        description: "Link your Steam account to see what you are playing and your most played games.",
        authType: "OPENID",
    },
    {
        id: "time",
        key: "time",
        name: "Time",
        description: "Clocks and countdowns. No account required.",
        authType: "NONE",
    },
];

type WidgetTypeSeed = {
    key: string;
    name: string;
    description: string;
    paramsSchema: { name: string; type: "integer" | "string"; label?: string }[];
};

const widgetTypesByService: Record<string, WidgetTypeSeed[]> = {
    github: [
        {
            key: "recent_commits",
            name: "Recent commits",
            description: "Latest commit messages and authors of a repository's default branch.",
            paramsSchema: [
                { name: "repository", type: "string", label: "Repository (ex: owner/repo)" },
                { name: "commit_count", type: "integer", label: "Number of commits (1-50)" },
            ],
        },
        {
            key: "repo_activity_stats",
            name: "Repository activity",
            description: "Commit count and active contributors over a period.",
            paramsSchema: [
                { name: "repository", type: "string", label: "Repository (ex: owner/repo)" },
                { name: "period_days", type: "integer", label: "Period in days (1-365)" },
            ],
        },
    ],
    weather: [
        {
            key: "city_temperature",
            name: "City temperature",
            description: "Current sky overview, temperature and precipitation for a city.",
            paramsSchema: [{ name: "city", type: "string", label: "City" }],
        },
        {
            key: "forecast_overview",
            name: "Forecast overview",
            description: "Multi-day forecast for a city.",
            paramsSchema: [
                { name: "city", type: "string", label: "City" },
                { name: "days", type: "integer", label: "Number of days (1-16)" },
            ],
        },
    ],
    steam: [
        {
            key: "currently_playing",
            name: "Currently playing",
            description: "The game your linked Steam account is playing right now.",
            paramsSchema: [
                { name: "display_mode", type: "string", label: "Display mode (compact or detailed)" },
            ],
        },
        {
            key: "most_played_games",
            name: "Most played games",
            description: "Games sorted by total playtime (most or least played).",
            paramsSchema: [
                { name: "order", type: "string", label: "Order (most or least played)" },
                { name: "game_count", type: "integer", label: "Number of games" },
            ],
        },
    ],
    time: [
        {
            key: "timezone_clock",
            name: "Timezone clock",
            description: "Current time and date in a given timezone.",
            paramsSchema: [
                { name: "timezone", type: "string", label: "Timezone (ex: Europe/Paris)" },
            ],
        },
        {
            key: "countdown",
            name: "Countdown",
            description: "Time remaining until a given date.",
            paramsSchema: [
                { name: "label", type: "string", label: "Label" },
                { name: "target_date", type: "string", label: "Target date (ex: 2026-12-31)" },
            ],
        },
    ],
};

async function main() {
    for (const service of services) {
        if (service.authType === "OAUTH" && (!service.oauthClientId || !service.oauthClientSecret)) {
            console.warn(
                `Skipping "${service.key}": missing oauthClientId/oauthClientSecret env vars.`
            );
            continue;
        }

        const { id, ...data } = service;

        await prisma.service.upsert({
            where: { id },
            update: data,
            create: { id, ...data },
        });

        for (const widgetType of widgetTypesByService[service.key] ?? []) {
            const { key, ...typeData } = widgetType;
            await prisma.widgetType.upsert({
                where: { serviceId_key: { serviceId: id, key } },
                update: typeData,
                create: { key, serviceId: id, ...typeData },
            });
        }

        console.log(`Seeded service "${service.key}" (${id})`);
    }
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
