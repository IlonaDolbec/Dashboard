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
    authType: "NONE" | "CREDENTIALS" | "OAUTH";
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
];

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
