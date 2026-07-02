# FleaScript Handover Context (For AI Agents)

## System Status
- **Phase**: MVP Core Completed & UI Refined & Auth Integrated & Pre-Flight Hardening Completed.
- **Framework**: Next.js 16.2.10 (App Router), Tailwind CSS v4, TypeScript.
- **Design System**: "Flea Market Native" design (Coral Red `#ea352d` & Warm White) with Ambient Glassmorphism backgrounds.
- **External Services**: Supabase (Database & Auth), OpenAI (`gpt-4o-mini`).
- **Core Features**: Text generation from notes, IP & Device-based rate limiting (Free: 3/day, Premium: 50/day), Platform-specific persona tuning (Mercari, Yahoo, Minne), Developer Mode (limit bypass), Positive/Negative feedback logging, Basic Auth protected Admin dashboard, Monetization Mock (Stripe Checkout Simulation), Trust UX (1-click cancellation), Google OAuth (Progressive Registration for Premium, Standalone Login flow for returning users), Programmatic SEO Landing Pages (`/template/[id]`).

## Architecture & Data Flow
1. **Frontend**: Single-page React UI (`src/app/page.tsx`) with client-side components (`PlatformSelector`, `InputArea`, `GenerateButton`, `OutputArea`, `FeedbackPanel`, `ManagePlanModal`). Separate `/checkout` page for premium upgrades protected by Auth.
2. **API Routes**:
   - `POST /api/generate`: Checks rate limit (by `user.id` or fallback `deviceId`), queries OpenAI, logs to `generation_logs`. Includes prompt injection guardrails and 15s timeout protection.
   - `POST /api/feedback`: Updates `generation_logs` with feedback.
   - `GET /api/user-status`: Returns `remaining`, `isPremium`, and `isLoggedIn`.
   - `POST /api/checkout-success-mock`: Mocks Stripe success, upgrades user to `premium` using Supabase Auth session (`user.id`).
   - `POST /api/cancel-subscription-mock`: Cancels subscription, downgrades to `free` using Supabase Auth session (`user.id`).
   - `GET /api/dev-mode`, `POST /api/toggle-premium`: Admin utility APIs.
3. **Database (Supabase)**:
   - `users`: Stores user UUIDs (`auth.users` reference or anonymous `deviceId` for free users) and subscription status (`free`, `premium`).
   - `device_rate_limits`: Enforces daily generation limits per device.
   - `ip_rate_limits`: Fallback rate limit per IP.
   - `generation_logs`: Stores all generations and feedback.
   - Auth uses `@supabase/ssr` for secure cookie-based session management (`src/lib/supabase/client.ts` & `server.ts`), and `createAdminClient` for bypassing RLS during internal updates.
4. **Admin Dashboard (`src/app/admin/page.tsx`)**:
   - Server Component querying Supabase. Includes Dev Mode toggle and Premium Manual Toggle (`PremiumToggle`).
5. **SEO & Legal**:
   - Programmatic SEO via Next.js `generateStaticParams`. `src/app/template/[id]/page.tsx` dynamically creates high-intent landing pages statically at build time.
   - Auto-generated `sitemap.xml` and `robots.txt` for crawlers.
   - Legal placeholders implemented (`/legal/tokushoho`, `/legal/terms`, `/legal/privacy`) in compliance with Stripe Japan requirements.

## ⚠️ Critical Gotchas & Rules (MUST READ)
1. **Next.js 15+ Middleware Changes**:
   - The conventional `middleware.ts` is deprecated. We use **`src/proxy.ts`** and export `proxy(req)`.
   - `req.ip` is removed from `NextRequest`. We extract IP manually from `req.headers.get('x-forwarded-for')` in `proxy.ts` and set it to the `x-real-ip` header.
2. **Vercel Cost Defense (Git Commit Rule)**:
   - ALL git commits must be made with the specific author to avoid breaking the free tier:
     `git commit --author="BananaFish5948 <k.shin.0103@gmail.com>" -m "..."`
3. **Pricing & Unit Economics Defense**:
   - **NEVER use the word "unlimited" (無制限 / 使い放題) in the UI.** Premium is mathematically capped at 50 requests/day to prevent API bankruptcy.
4. **Compliance & Stripe Real Integration (RESOLVED)**:
   - Previously, subscriptions were tied to an anonymous `deviceId`. We have now implemented a **Progressive Google OAuth flow**. Users can use the free tier anonymously, but upgrading to Premium STRICTLY requires a Google Login. This prevents the "lost device = lost subscription" litigation risk.
5. **No Direct Supabase Edge Runtime Usage**:
   - Complex DB operations fail in the Edge Runtime. Rate limiting and DB logic must reside in Node.js API routes, while `proxy.ts` strictly handles IP extraction and Basic Auth routing.

## Next Potential Steps
- [ ] 🐞 Bug Hunt & Code Review by Claude (Coordinator).
- [ ] Production Deployment (Vercel) & Custom Domain setup.
