import { NextRequest, NextResponse } from "next/server";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";

function withCorsHeaders(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
}

export function middleware(request: NextRequest) {
    if (request.method === "OPTIONS") {
        return withCorsHeaders(new NextResponse(null, { status: 204 }));
    }

    return withCorsHeaders(NextResponse.next());
}

export const config = {
    matcher: ["/api/:path*"],
};
