# FleaScript Handover Context (For AI Agents)

## System Status
- **Phase**: MVP Core Completed & UI Refined.
- **Framework**: Next.js 16.2.10 (App Router), Tailwind CSS v4, TypeScript.
- **Design System**: "Flea Market Native" design (Coral Red `#ea352d` & Warm White) with Ambient Glassmorphism backgrounds.
- **External Services**: Supabase (Database), OpenAI (`gpt-4o-mini`).
- **Core Features**: Text generation from notes, IP-based rate limiting (3/day), Positive/Negative feedback logging, Basic Auth protected Admin dashboard.

## Architecture & Data Flow
1. **Frontend (`src/app/page.tsx`)**: Single-page React UI with client-side components (`InputArea`, `GenerateButton`, `OutputArea`, `FeedbackPanel`).
2. **API Routes**:
   - `POST /api/generate`: Checks rate limit, queries OpenAI, logs to `generation_logs`, returns text and `logId`.
   - `POST /api/feedback`: Updates `generation_logs` with `feedback` ('positive', 'negative', 'comment') and `feedback_reason`.
3. **Database (Supabase)**:
   - `ip_rate_limits`: Enforces 3 requests per day per IP.
   - `generation_logs`: Stores all inputs, outputs, IPs, and feedback.
   - RLS is enabled on both, but we bypass it using `SUPABASE_SERVICE_ROLE_KEY` via `createServerClient` (server-side only).
4. **Admin Dashboard (`src/app/admin/page.tsx`)**:
   - Server Component that directly queries Supabase.
   - Protected by Basic Auth implemented in Edge Proxy.

## ⚠️ Critical Gotchas & Rules (MUST READ)
1. **Next.js 15+ Middleware Changes**:
   - The conventional `middleware.ts` is deprecated. We use **`src/proxy.ts`** and export `proxy(req)`.
   - `req.ip` is removed from `NextRequest`. We extract IP manually from `req.headers.get('x-forwarded-for')` in `proxy.ts` and set it to the `x-real-ip` header. API routes read this header.
2. **Vercel Cost Defense (Git Commit Rule)**:
   - ALL git commits must be made with the specific author to avoid breaking the free tier:
     `git commit --author="BananaFish5948 <k.shin.0103@gmail.com>" -m "..."`
3. **OpenAI Build Issues**:
   - Next.js static generation at build time evaluates `src/lib/openai.ts`. If `OPENAI_API_KEY` is missing in the CI/build environment, the build will crash. A fallback string (`'dummy_key_for_build'`) is intentionally set in `src/lib/openai.ts` to prevent this.
4. **No Direct Supabase Edge Runtime Usage**:
   - Complex DB operations (like upserts) fail or are unreliable in the Edge Runtime. Rate limiting and DB logic must reside in Node.js API routes (`/api/generate`), while `proxy.ts` strictly handles IP extraction and Basic Auth routing.

## Next Potential Steps
- [ ] Programmatic SEO Landing Pages generation (URL structure: `/category/:id`).
- [ ] Production Deployment (Vercel) & Custom Domain setup.
