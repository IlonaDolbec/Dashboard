import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const authClient = createAuthClient({
    baseURL: API_URL,
    fetchOptions: {
        credentials: "include",
    },
    plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
