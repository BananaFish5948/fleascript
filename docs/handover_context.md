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
   - **Double Charge Prevention**: Front-end (`/checkout/page.tsx`) and back-end (`/api/checkout-success-mock`) explicitly check for `subscription_status === 'premium'` and redirect/reject to prevent accidental double charges.
5. **No Direct Supabase Edge Runtime Usage**:
   - Complex DB operations fail in the Edge Runtime. Rate limiting and DB logic must reside in Node.js API routes, while `proxy.ts` strictly handles IP extraction and Basic Auth routing.
6. **Admin Dashboard Design & Rate Limit Auditing**:
   - To audit rate limit abuse, the dashboard maps IPs from recent `generation_logs` to users to display a 👑 flag next to Premium IPs/Devices. This distinguishes legitimate Premium 50/day traffic from malicious Free tier bypasses.
7. **定型文バスター (Anti-Spam Footer)**:
   - To prevent identical generated descriptions from triggering marketplace spam filters, the appended footer for free users dynamically rotates the surrounding text of the URL (e.g., `https://fleascript.vercel.app`). This ensures the URL is present for conversion while minimizing the risk of being flagged as identical spam.
8. **マルチSNSシェア (Custom Share Modal)**:
   - On Desktop, `navigator.share` fails to show SNS apps. Furthermore, Instagram severely restricts text pre-fill APIs. To solve this, we use `CustomShareModal.tsx`, which bypasses native sharing entirely on Desktop, utilizing Web Intents (for X/Threads) and a "Copy to Clipboard + Open App" flow for Instagram to guarantee a robust UX across all platforms.
9. **アプリ内ブラウザ（IAB）脱出UI**:
   - TikTok or Instagram In-App Browsers block Google OAuth and Clipboard APIs, leading to severe UX degradation and conversion loss. We implemented `InAppBrowserWarning.tsx` globally in `layout.tsx` to detect these environments via User-Agent and prompt users to switch to Safari/Chrome.
10. **開発者モードのエフェメラル・レートリミット**:
    - To allow testing of the `LimitModal` and Premium upgrade flow without polluting the Supabase `device_rate_limits` table, Developer Mode (`FLEA_DEV_MODE=1`) tracks limits using an in-memory `Map` on the server. The client sends an ephemeral `pageLoadId` (generated on mount) to `api/user-status` and `api/generate`. Reloading the page (F5) generates a new ID and instantly resets the remaining limit to 3.

## Next Potential Steps
- [ ] 🐞 Bug Hunt & Code Review by Claude (Coordinator).
- [ ] Production Deployment (Vercel) & Custom Domain setup.
- [ ] 📈 スケール時の監視強化 (Future Phase): エンドユーザー環境での502/503等の未知のAPIエラー多発を検知するため、Vercel Analyticsのエラー監視設定、またはSupabaseへの軽量なエラーログテーブル追加を検討する。
- [ ] 🚀 真のリファラル型シェアへのピボット (Future Phase): 現在の「割り切り型（ボタンクリックのみで+1枠付与）」から、紹介用の一意URL（例: `?ref=device_id`）を発行し、第三者がそのリンク経由でサイトへアクセスして初回生成したタイミングで紹介元に枠を付与する、より堅牢でバイラル効果の高いシステムへの移行を検討する。
