# FleaScript Handover Context (For AI Agents)

## System Status
- **Phase**: Phase 4.2 Completed (AI Personalization, Best-Selling Time Analytics & Referral Code). Ready for Marketing/Promotion & Deployment.
- **Framework**: Next.js 16.2.10 (App Router), Tailwind CSS v4, TypeScript.
- **Design System**: "Aesthetic / Kinfolk" design (Terracotta & Sage with Earth Tones) replacing the old app-like design. Emojis replaced with Lucide icons for a refined, premium feel.
- **External Services**: Supabase (Database & Auth), OpenAI (`gpt-4o-mini`).
- **Core Features**: Inventory and profit management dashboard, AI description generation, IP/User-based rate limiting, Developer Mode, Monetization Mock, and **Cost-Driven Roadmap Gauge** (showing progress without absolute numbers).

## Architecture & Data Flow
1. **Frontend**: Single-page React UI (`src/app/page.tsx`) implementing a "Switcher" pattern.
   - **Unauthenticated**: Displays the Landing Page (`LandingPage.tsx`) which highlights the core value (text-to-description generation). The `AuthModal` is triggered only via CTA buttons.
   - **Authenticated**: Displays the Dashboard containing `SummaryCard`, `InventoryForm`, and `InventoryList`.
2. **API Routes**:
   - `GET /api/inventory`, `POST /api/inventory`: CRUD for inventory items. Checks user auth and limits (3 for free, 500 for premium).
   - `PATCH /api/inventory/[id]`, `DELETE /api/inventory/[id]`: Update and delete inventory items.
   - `POST /api/generate`: Queries OpenAI (`gpt-4o-mini`) to generate descriptions based on item data. No longer saves to DB (pure API wrapper).
   - `GET /api/user-status`: Returns `remaining`, `isPremium`, and `isLoggedIn` based on Supabase Auth.
   - `POST /api/checkout-success-mock`, `POST /api/cancel-subscription-mock`: Mocks Stripe logic.
   - `GET /api/dev-mode`, `POST /api/toggle-premium`: Admin utility APIs.
   - `POST /api/share`: Grants bonus slots to users upon sharing.
   - `GET /api/roadmap`: Returns the current roadmap progress percentage from `app_settings`.
3. **Database (Supabase)**:
   - `users`: Stores user UUIDs (`auth.users` reference), subscription status, and `preferences` (for bonus slots).
   - `inventory_items`: Core table storing user's items. Protected by RLS.
   - `ip_rate_limits`: Fallback rate limit per IP.
   - `app_settings`: Global settings table storing `roadmap_progress`.
   - Auth uses `@supabase/ssr` for secure cookie-based session management (`src/lib/supabase/client.ts` & `server.ts`).
4. **Admin Dashboard (`src/app/admin/page.tsx`)**:
   - Server Component querying Supabase for KPI metrics (Total inventory items, Premium users, Sold items, IP usage). Includes Dev Mode toggle and Premium Manual Toggle.

## ⚠️ Critical Gotchas & Rules (MUST READ)
1. **Next.js 15+ Middleware Changes**:
   - The conventional `middleware.ts` is deprecated. We use **`src/proxy.ts`** and export `proxy(req)`.
   - `req.ip` is removed from `NextRequest`. We extract IP manually from `req.headers.get('x-forwarded-for')` in `proxy.ts` and set it to the `x-real-ip` header.
2. **Vercel Cost Defense (Git Commit Rule)**:
   - ALL git commits must be made with the specific author to avoid breaking the free tier:
     `git commit --author="BananaFish5948 <k.shin.0103@gmail.com>" -m "..."`
3. **Pivot to Account-Based Architecture**:
   - Previously, the app relied on anonymous device IDs and allowed free generation. This caused DB bloat (`generation_logs`) and litigation risk for premium loss.
   - We have fully pivoted to **Strict User Auth Requirement**. All users must sign in via Supabase Auth (e.g., Google/Email). The `generation_logs` and `device_rate_limits` tables have been **DELETED**. 
   - All rate limiting and inventory storage are now tied to the authenticated `user_id`.
4. **Pricing & Unit Economics Defense**:
   - **NEVER use the word "unlimited" (無制限 / 使い放題) in the UI.** Premium is mathematically capped at 500 items max to prevent database/API bankruptcy.
5. **No Direct Supabase Edge Runtime Usage**:
   - Complex DB operations fail in the Edge Runtime. DB logic must reside in Node.js API routes, while `proxy.ts` strictly handles IP extraction and Basic Auth routing.
6. **Double Charge Prevention**:
   - Front-end (`/checkout/page.tsx`) and back-end (`/api/checkout-success-mock`) explicitly check for `subscription_status === 'premium'` and redirect/reject to prevent accidental double charges.
7. **開発者モードのエフェメラル・レートリミット**:
   - To allow testing of the `LimitModal` and Premium upgrade flow without polluting the Supabase DB, Developer Mode (`FLEA_DEV_MODE=1`) tracks limits using an in-memory `Map` on the server for `user-status` endpoints.
8. **AI Company Architecture (Gem Persona Protocol)**:
   - To prevent context degradation, AI interactions should be routed through the multi-agent system located in `.agents/skills/`.
   - **@coordinator (Gemilia)**: Project Manager & Task Router (Diamond).
   - **@researcher (Gemiko)**: Research & Summarization (Ruby).
   - **@frontend-engineer / @backend-engineer / @qa-tester (Gemina)**: Development & QA (Sapphire).
   - **@sns-marketer (Gemika)**: Marketing & Viral copy (Topaz).
   - Use explicit mentions (e.g., `@coordinator`) to load the correct context.
9. **Supabase Schema Evolution & Admin Bypass (Critical DB Traps)**:
   - **The `IF NOT EXISTS` Trap**: `CREATE TABLE IF NOT EXISTS` alone does NOT add new columns or update existing constraints (e.g., `CHECK`) on existing tables. Always pair it with explicit `ALTER TABLE` commands (like `ADD COLUMN IF NOT EXISTS` or `DROP/ADD CONSTRAINT`) when evolving schema, otherwise the database will silently enforce outdated rules.
   - **Mandatory DB Update Announcements**: When updating `schema.sql`, the AI MUST explicitly notify the Master that a manual SQL execution on Supabase is required, providing the exact SQL snippet.
   - When the backend needs to update system records (e.g., granting bonus slots), doing so under the user's session may fail due to Row Level Security (RLS). Always use the `SUPABASE_SERVICE_ROLE_KEY` to instantiate an Admin Client and bypass RLS safely from API routes.
   - **Never swallow API errors (Robustness Rule)**: Do not use generic fallback messages like "An error occurred." Always extract the actual error payload from the API (`errorData.error`) and display it to the user. This immediately isolates DB/constraint issues from frontend bugs.
10. **Testing Time-Based Triggers**:
    - The `inventory_items_updated_at` trigger automatically forces `updated_at = now()` on every record update.
    - Features that rely on elapsed time (like AI Markdown Suggestions requiring `updated_at > 3 days`) cannot be easily mocked from the UI.
    - To test these features, you MUST execute raw SQL in the Supabase Dashboard to temporarily disable the trigger, backdate the record, and re-enable it: `ALTER TABLE inventory_items DISABLE TRIGGER ...; UPDATE ...; ALTER TABLE ... ENABLE TRIGGER;`
11. **Downgrade Data Lock Protection (Security Constraint)**:
    - If a user registers 500 items on Premium and downgrades to Free, they must NOT be allowed to access the excess 497 items.
    - Both `/api/inventory` and `/api/premium/analytics` enforce `.limit(maxLimit)` on database queries based on the user's *current* active subscription limit.
    - Excess items are safely locked in the DB (not deleted) but completely inaccessible from the network layer. If `totalCount > maxLimit`, the API returns `isLocked: true`, and the UI displays a warning banner urging an upgrade.
12. **Zero-Cost Canvas Generation & OGP Virality (Storage Security)**:
    - To avoid AI image generation API costs, the Monthly Activity Report strictly synthesizes images via client-side HTML5 `<canvas>`.
    - Because Web Intents (`twitter.com/intent/tweet`) cannot directly attach raw image files, the canvas blob is uploaded to Supabase `temporary_shares`.
    - **Security**: The `temporary_shares` bucket enforces strict RLS (1MB max, `.jpg`/`.png` only, fixed filename `[userId]/monthly_report.jpg`) to prevent spam/storage bloat.
    - **OGP Trick**: Instead of sharing the raw image URL, we share a Next.js dynamic route (`/report/[uid]`) that contains `<meta property="og:image">`. This ensures the image renders beautifully as a large Twitter Card on social media timelines.
13. **Agent Role Tags Requirement**:
    - As defined in `.agents/AGENTS.md`, AI agents MUST prefix their messages with a role tag (e.g., `【ジェミリア（Coordinator）】` or `【ジェミナ（Frontend）】`) to maintain context clarity and prevent persona confusion.
14. **Mobile UX Architecture (Bottom Navigation & Keyboard Defense)**:
    - To reduce visual clutter for beginners, we pivoted from a long single-page scroll to a 4-tab Bottom Navigation SPA (`home`, `add`, `analytics`, `settings`).
    - **Keyboard Protection**: Mobile software keyboards push up `fixed bottom-0` elements, obscuring input fields. We mitigate this by actively listening to `focusin` / `focusout` on `INPUT`/`TEXTAREA` elements to temporarily hide the `BottomNav`.
    - **Ad Golden Zone**: Native affiliate ads (`NativeAdCard`) for free users are strictly injected directly below the `SummaryCard` on the Home tab. This ensures maximum impression rate ("Golden Zone" placement) without breaking the new tabbed UX layout.
15. **HMR Crash Prevention (Dev Environment)**:
    - AI agents frequently overwrite files faster than the Next.js (Turbopack/Webpack) watcher can process, leading to `ELIFECYCLE` or `EPERM` crashes on the local dev server. Master should stop `npm run dev` while AI is writing code, or restart it if it crashes.
16. **Cost Optimization for Auth (Apple vs Google/Magic Link)**:
    - "Sign in with Apple" requires a $99/year Apple Developer Program subscription. To maintain strict MVP costs, Apple Login was scrapped. We utilize Google OAuth as primary, and Supabase Magic Links (OTP) as the fallback for pure iCloud/iOS users.

## Next Potential Steps
- [x] Phase 3: Auth Integration, UI Refinement, Share Bonus & Roadmap Gauge.
- [x] Landing Page (LP) Implementation using Switcher pattern (`src/app/page.tsx`).
- [x] Native Ad Integration (UI & Dummy Data) & Layout Refinement completed.
- [x] **Phase 4.1**: AI Personalization (Seller Rules) & Multi-Platform Output (Mercari, Yahoo, Rakuma tabs).
- [x] **Phase 4.2**: Dashboard Analytics (Best-Selling Time) & Viral Referral System (+3 slots).
- [x] **Phase 4.4**: Premium Analytics Upgrade (AI Markdown Suggestion & Recharts Profit Donut Chart).
- [x] **Phase 4.6**: Zero-Cost Virality (Canvas Monthly Activity Report, OGP Twitter Card Integration, Hybrid Shipping Calculator, 3-day stall detection).
- [x] **Phase 4.7**: Bottom Navigation UX Pivot & Ad Placement Optimization (Golden Zone).
- [x] **Product Version 2.0 UX/Security Upgrades**:
  - Implemented Graceful Degradation in Web Workers for Multimodal Image Analysis.
  - Built IP-based 15-minute Rate Limit Cooldown (3 consecutive failures).
  - Designed "Tuning Navigator" with clipboard integration and deep-link fallbacks.
  - Optimized Auth to Google + Magic Links (Cost Defense).
- [ ] **Phase 4.3**: Promotion Strategy & Viral Copy. Invoke `@sns-marketer` (Gemika) to create copy.
- [ ] **Phase 4.5**: Affiliate Monetization (Amazon Associates & Native Ads).
- [ ] Production Deployment (Vercel) & Custom Domain setup.
- [ ] Real Stripe Integration (Replace Mock).
- [ ] **Future UI Improvement**: Inline Edit Profit Simulator. (Currently, the inline edit mode in `InventoryList.tsx` provides a minimal editing experience. If requested, port the real-time profit calculation logic from `InventoryForm.tsx` into the inline edit form to allow users to adjust prices while watching the profit change in real-time.)
- [ ] **Future Feature**: Theme Customization (To satisfy users' desire for self-expression, implement a feature to switch themes. See below for proposed themes).

### Theme Proposals for Future Customization
**🎨 Proposal B: Stone & Espresso**
Minimal, calming, modern tone like dark roasted coffee.
- Base Background: Greige (`#EAE6E1`)
- Brand/Accent: Espresso (`#3E2723`)
- Text: Off-Black (`#1C1B1A`)
- Success (Sold): Olive (`#73795C`)
- Warning/Alert: Rust (`#A05E4C`)

**🎨 Proposal C: Linen & Slate**
Clean, cool-toned Scandinavian slow-life feel.
- Base Background: Linen White (`#F9F8F6`)
- Brand/Accent: Slate Blue (`#5C6B73`)
- Text: Deep Slate (`#253237`)
- Success (Sold): Matcha Green (`#9CA894`)
- Warning/Alert: Dusty Rose (`#B27C7C`)
