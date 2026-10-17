/**
 * Centralized Upstash-based rate limiting for Yardly.
 *
 * Environment variables (use one set):
 * - KV_REST_URL + KV_REST_TOKEN (Vercel KV / Upstash)
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *
 * Optional:
 * - RATELIMIT_DISABLED=true - Skip rate limiting (e.g. local dev)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const PREFIX = "@yardly/ratelimit";

// Support both Vercel KV and standard Upstash Redis env vars
const redisUrl =
    process.env.KV_REST_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
    process.env.KV_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(redisUrl && redisToken);
const isDisabled = process.env.RATELIMIT_DISABLED === "true";

function createRedis() {
    if (!redisUrl || !redisToken) {
        throw new Error(
            "Rate limit: Missing KV_REST_URL/KV_REST_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN"
        );
    }
    return new Redis({ url: redisUrl, token: redisToken });
}

type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}` | `${number}${"ms" | "s" | "m" | "h" | "d"}`;

function createLimiter(
    name: string,
    requests: number,
    window: Duration,
    options?: { prefix?: string }
): Ratelimit | null {
    if (!isConfigured || isDisabled) return null;
    try {
        const redis = createRedis();
        return new Ratelimit({
            redis,
            prefix: options?.prefix ?? `${PREFIX}:${name}`,
            limiter: Ratelimit.slidingWindow(requests, window),
            analytics: true,
            ephemeralCache: new Map(),
            timeout: 5000,
        });
    } catch {
        return null;
    }
}

// Tiered limiters for different endpoint categories
export const rateLimiters = {
    /** General API: 100 req/min */
    general: createLimiter("general", 100, "1 m"),
    /** Auth (login, signup): 20 req/min - prevents credential stuffing */
    auth: createLimiter("auth", 20, "1 m"),
    /** Admin: 200 req/min */
    admin: createLimiter("admin", 200, "1 m"),
    /** Dashboard: 50 req/min */
    dashboard: createLimiter("dashboard", 50, "1 m"),
    /** Sensitive: send email, bulk upload - 10 req/min */
    sensitive: createLimiter("sensitive", 10, "1 m"),
    /** Public actions (estimate accept, customer invoice view): 30 req/min - stricter for unauthenticated */
    public: createLimiter("public", 30, "1 m"),
    /** Places API (Google): 10 req/min per user - external API cost control */
    places: createLimiter("places", 10, "1 m"),
} as const;

export type RateLimiterKey = keyof typeof rateLimiters;

/** Extracts a stable identifier from the request for rate limiting */
export function getRateLimitIdentifier(request: {
    headers: { get: (name: string) => string | null };
    ip?: string | null;
    nextUrl?: { pathname: string };
}, sessionCookie: string | undefined): string {
    if (sessionCookie) {
        // Use session cookie hash for consistency (don't expose raw cookie)
        const hash = simpleHash(sessionCookie);
        return `user:${hash}`;
    }
    const ip = getClientIp(request);
    return `ip:${ip}`;
}

/** Simple non-crypto hash for rate limit keys - we need consistency, not security */
function simpleHash(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        h = (h << 5) - h + c;
        h = h & h;
    }
    return Math.abs(h).toString(36);
}

/** Extracts client IP - handles Vercel, proxies, and x-forwarded-for */
function getClientIp(request: {
    headers: { get: (name: string) => string | null };
    ip?: string | null;
}): string {
    // Vercel/Edge provide request.ip
    const ip = request.ip;
    if (ip) return ip;

    // Behind reverse proxy - use leftmost IP (original client per convention)
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "127.0.0.1";
}

export function isRateLimitEnabled(): boolean {
    return isConfigured && !isDisabled;
}
