import { NextRequest, NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
    if (!request.cookies.get("session_id")) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Apply middleware to all paths except:
         * - /auth
         * - Static files (/_next, /favicon.ico, etc.)
         */
        '/((?!auth|_next|favicon.ico|public|api).*)'
    ]
}
