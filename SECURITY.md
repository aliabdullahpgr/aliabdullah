# Application Security Guidelines

This document outlines the security architecture and procedures for this application. Following these guidelines is critical to maintaining a secure environment.

## 1. HTTP Security Headers
The application enforces strict security headers via `next.config.js`:
- **Content-Security-Policy (CSP)**: Mitigates XSS and data injection attacks by restricting resource loading to explicitly allowed sources.
- **Strict-Transport-Security (HSTS)**: Enforces TLS encryption for all connections (`max-age=31536000; includeSubDomains; preload`).
- **X-Frame-Options (DENY)**: Prevents Clickjacking by disallowing rendering within an iframe.
- **X-Content-Type-Options (nosniff)**: Prevents MIME-sniffing bypasses.
- **Permissions-Policy**: Disables access to invasive browser features (camera, microphone, geolocation, browsing-topics) globally.

## 2. Rate Limiting Foundation
To mitigate brute-force and DDoS attacks, rate limiting capabilities using `@upstash/ratelimit` and Upstash Redis are available.
- Default sensible sliding window: 40 requests per 10 seconds.
- Currently, rate limits can be easily attached to critical endpoints via `rateLimit.limit(ip)`.
- Use tighter restrictions on `/api/auth/*` and relaxed limits on general data API endpoints.

## 3. Audit Logging
System administration activities are securely recorded into a dedicated `AuditLog` table using the `createAuditLog()` utility (`src/server/audit.ts`).
- Records include `actorUserId`, `action`, `entityType`, `entityId`, network context (IP, User Agent), and sanitized metadata.
- **NEVER** pass raw passwords, secret tokens, or sensitive body content into the `metadata` object of an Audit Log.

## 4. Role-Based Access Control (RBAC)
- All CMS modifications and sensitive routes must be routed behind the TRPC **`adminProcedure`**.
- This enforces robust server-side validation ensuring only accounts with `{ role: 'admin' }` in the PostgreSQL database can execute mutating actions. Next.js component-level masking is strictly a UX feature, not a security boundary.

## 5. Development Checklist
When implementing new tRPC mutations or API endpoints, verify the following:
1. **Authorization**: Is this route protected? Should it use `protectedProcedure` or `adminProcedure`?
2. **Input Sanitization**: Ensure arbitrary HTML is processed using `sanitizeHtml` before passing variables to Prisma.
3. **Audit Logging**: If the action modifies users or configurations, invoke `createAuditLog()`.
4. **Rate Limiting**: Attach Upstash rate limiting hooks if the endpoint faces the public or processes authentication.
5. **No Secrets Logged**: Log actions definitively, but mask sensitive private data.

## 6. Environment Keys
- All secrets are properly validated using `@t3-oss/env-nextjs` in `src/env.js`.
- Never append secrets to `next.config.js` or public component properties.
- Unnecessary tokens (e.g., legacy `UPLOADTHING_TOKEN`) have been systematically removed.