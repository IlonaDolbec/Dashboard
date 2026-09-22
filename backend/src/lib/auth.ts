import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { sendMail } from "./mailer";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

export const auth = betterAuth({
    trustedOrigins: [frontendUrl],
    rateLimit: {
      enabled: true,
      storage: "memory",
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for"],
      }
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 60 * 60,
        sendVerificationEmail: async ({ user, url }) => {
            await sendMail({
                to: user.email,
                subject: "Confirm your email address",
                html: `<p>Hi ${user.name},</p><p>Click the link below to confirm your email address and activate your account:</p><p><a href="${url}">Confirm my email</a></p><p style="word-break: break-all;">${url}</p><p>This link expires in 1 hour.</p>`,
            });
        },
    },
    plugins: [
        admin({
            roles: {
                ADMIN: adminAc,
                USER: userAc,
            },
            defaultRole: "USER",
            adminRoles: ["ADMIN"],
            bannedUserMessage:
                "Ce compte a été désactivé. Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.",
        }),
    ],
});
