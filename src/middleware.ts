import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
    rateLimiters,
    getRateLimitIdentifier,
    isRateLimitEnabled,
} from "@/lib/rate-limit";

// API paths that must NEVER be rate limited (server-to-server, signature-verified)
const RATE_LIMIT_EXCLUDED_PATHS = [
    "/api/webhooks/", // Stripe, etc. - verified by signature
];

function isExcluded(pathname: string): boolean {
    return RATE_LIMIT_EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
}

/** Sensitive: send email, bulk upload, provision - stricter limits */
function isSensitive(pathname: string): boolean {
    return (
        pathname.includes("/send") ||
        pathname.includes("/bulk-upload") ||
        pathname.includes("/provision-resend")
    );
}

/** Public/unauthenticated actions: accept estimate, customer views */
function isPublicAction(pathname: string): boolean {
    return (
        pathname.includes("/accept") ||
        pathname.includes("/customer/")
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for Better Auth session cookie (cookie-only check for edge middleware)
    const sessionCookie = getSessionCookie(request);

    // Check authentication for dashboard route
    if (pathname.startsWith("/dashboard") && !sessionCookie) {
        const loginUrl = new URL("/login", request.url);
        const callbackUrl = pathname + (request.nextUrl.search || "");
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
    }

    // Only apply rate limiting to API routes
    if (!pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Webhooks and other exclusions - never rate limit
    if (isExcluded(pathname)) {
        return NextResponse.next();
    }

    // Skip if rate limiting is disabled or not configured
    if (!isRateLimitEnabled()) {
        return NextResponse.next();
    }

    // Select limiter based on path
    let limiter = rateLimiters.general;
    if (pathname.startsWith("/api/auth/")) {
        limiter = rateLimiters.auth;
    } else if (pathname.startsWith("/api/admin/")) {
        limiter = rateLimiters.admin;
    } else if (pathname.startsWith("/api/dashboard/")) {
        limiter = rateLimiters.dashboard;
    } else if (isSensitive(pathname)) {
        limiter = rateLimiters.sensitive;
    } else if (isPublicAction(pathname) && !sessionCookie) {
        limiter = rateLimiters.public;
    }

    if (!limiter) {
        return NextResponse.next();
    }

    const identifier = getRateLimitIdentifier(
        request,
        sessionCookie ?? undefined
    );

    try {
        const { success, limit, reset, remaining } = await limiter.limit(
            identifier
        );

        const retryAfter = Math.ceil((reset - Date.now()) / 1000);

        const response = success
            ? NextResponse.next()
            : new NextResponse(
                  JSON.stringify({
                      error: "Too Many Requests",
                      message:
                          "Rate limit exceeded. Please try again later.",
                      retryAfter,
                  }),
                  {
                      status: 429,
                      headers: {
                          "Content-Type": "application/json",
                          "X-RateLimit-Limit": limit.toString(),
                          "X-RateLimit-Remaining": remaining.toString(),
                          "X-RateLimit-Reset": new Date(reset).toISOString(),
                          "Retry-After": retryAfter.toString(),
                      },
                  }
              );

        if (success) {
            response.headers.set("X-RateLimit-Limit", limit.toString());
            response.headers.set(
                "X-RateLimit-Remaining",
                remaining.toString()
            );
            response.headers.set(
                "X-RateLimit-Reset",
                new Date(reset).toISOString()
            );
        }

        return response;
    } catch (error) {
        // Fail open: if Redis is unavailable, allow the request but log
        console.error("[rate-limit] Error:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/api/(.*)",
        "/dashboard",
        "/dashboard/(.*)",
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)|$|login|purchase).*)",
    ],
};
