# Security guide

## What is built in
| Area | Controls |
|---|---|
| Input validation | `lib/validate.js`: every field is type-checked (blocks NoSQL operator injection), length-limited, control chars stripped; ObjectIds, template slugs and languages use allowlists; uploads checked by extension, size (15 MB), count (5), **file signature** and page/slide limits; Markdown rendered without raw HTML (XSS-safe). |
| Authentication | bcrypt (cost 12), password policy (10+ chars, letters + numbers), signed JWT (HS256, 7 days) in an `httpOnly`, `SameSite=Lax`, `Secure` (prod) cookie, constant-time-style login, generic error messages, account lock after 5 failures (15 min). |
| Authorization | Every document/chat/export query filters by the signed-in user (no IDOR), admin routes check `role`, atomic credit deduction (no double spend), demo checkout hard-disabled in production. |
| Rate limiting | `lib/ratelimit.js`: 300 req/min/IP overall; signup 5/h; login 15/15 min per IP and 8/15 min per email; processing 6/min and chat 20/min per user. |
| Headers / hardening | CSP, HSTS (prod), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP, no `X-Powered-By`, `no-store` on API and dashboard, CSRF origin check + body size cap in `middleware.js`, errors never leak stack traces. |
| Secrets | Server refuses to start sensitive paths without a 32+ char `JWT_SECRET` in production; `.env*` git-ignored; passwords/prompts/source text never returned by the API (`select: false`); OpenAI key stays server-side. |
| Auditing | `AuditLog` collection (login, failures, lockouts, signup, document create/delete/export, purchases; auto-deleted after 180 days), JSON logs, admin view at `GET /api/admin/audit`. |
| Dependencies | `npm run audit`, Dependabot weekly, CodeQL and gitleaks in `.github/workflows/security.yml`. |
| AI safety | Documents are treated as untrusted data (prompt-injection guard), output token caps, per-user `user` id sent to OpenAI for abuse tracing. |

## Before going live (checklist)
1. **HTTPS only** (Vercel, Cloudflare, or Nginx + Let's Encrypt). Set `NODE_ENV=production`.
2. Generate `JWT_SECRET` (48 random bytes) and store it in your host's secret manager, not in git.
3. **MongoDB least privilege.** Create a user that can only read/write this one database:
   ```js
   use oreate_clone
   db.createUser({ user: "app_user", pwd: "STRONG_PASSWORD", roles: [{ role: "readWrite", db: "oreate_clone" }] })
   ```
   Enable authentication, bind to private network / use Atlas IP allowlist, enable backups.
4. **Stripe is wired in**: set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_URL`; add the webhook endpoint `/api/payment/webhook/stripe`. Credits are granted only by the signature-verified webhook, the paid amount must match our price list, and retries can't double-credit (`providerRef` is unique). Test locally with `stripe listen --forward-to localhost:3000/api/payment/webhook/stripe`.
5. Several servers? Move the rate-limit store to Redis (Upstash) and keep the same function signature.
6. Behind a proxy: make sure it overwrites `X-Forwarded-For` so users cannot spoof their IP.
7. Rotate `JWT_SECRET` and `OPENAI_API_KEY` if they ever leak (rotating the JWT secret signs everyone out).
8. Set an OpenAI monthly spend limit in the OpenAI dashboard.
9. Make yourself admin: `db.users.updateOne({email:"you@example.com"},{$set:{role:"admin"}})`.
10. Write real Privacy / Terms pages (you send user documents to OpenAI).

## Known trade-offs
- CSP keeps `'unsafe-inline'` for scripts because Next.js 14 needs it without nonces.
- Sign-up reveals whether an email exists (usability). Rate limits make bulk checking impractical.
- Password reset / email verification / 2FA are not included yet.

- Stripe plans are one-time payments (credit bundles). For auto-renewing subscriptions switch Checkout to `mode: "subscription"` with Stripe Prices and handle `invoice.paid`.
- CORS is closed on purpose: the UI and API share one origin. If you later host the frontend on another domain, add an allowlist and `SameSite=None; Secure` cookies.
