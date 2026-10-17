# Rate Limiting with Upstash

Yardly uses [Upstash](https://upstash.com/) Redis for distributed rate limiting. This protects the API from abuse while remaining serverless-friendly.

## Setup

1. **Create an Upstash Redis database** at [console.upstash.com](https://console.upstash.com/), or use Vercel KV (powered by Upstash).

2. **Add environment variables** to `.env`:

   ```env
   KV_REST_URL=https://xxx.upstash.io
   KV_REST_TOKEN=your-token
   ```

   Or use the standard Upstash names:

   ```env
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

3. **Optional for local development** – disable rate limiting:

   ```env
   RATELIMIT_DISABLED=true
   ```

## Rate Limit Tiers

| Tier | Limit | Used For |
|------|-------|----------|
| General | 100/min | Most API routes |
| Auth | 20/min | Login, signup – prevents credential stuffing |
| Admin | 200/min | Admin panel |
| Dashboard | 50/min | Dashboard API |
| Sensitive | 10/min | Send email, bulk upload, provision |
| Public | 30/min | Unauthenticated: accept estimate, customer views |
| Places | 10/min | Google Places API (per user) |

## Exclusions

- **`/api/webhooks/*`** – Never rate limited. Webhooks (Stripe, etc.) are signature-verified server-to-server and must not be blocked.

## Security Features

- **Sliding window** – Smoother limits than fixed windows
- **Ephemeral cache** – Blocks known abusive identifiers without a Redis call
- **Hashed identifiers** – Session cookies are hashed before use
- **Retry-After header** – Returned on 429 responses per RFC 7231

## Response Headers

Rate-limited responses include:

- `X-RateLimit-Limit` – Max requests in the window
- `X-RateLimit-Remaining` – Remaining requests
- `X-RateLimit-Reset` – ISO timestamp when the limit resets
- `Retry-After` – Seconds until the client can retry

## Fail-Safe Behavior

If Redis is unavailable, the middleware **allows requests through** (fail open) and logs the error. This prevents Redis outages from taking down the API.
