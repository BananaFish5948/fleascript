# FleaScript Handover Context (For AI Agents)

## System Status
- **Phase**: Phase 3 Completed (Auth, Rate Limits, and Roadmap Gauge Implemented). Ready for Phase 4 (Promotion & Monetization).
- **Framework**: Next.js 16.2.10 (App Router), Tailwind CSS v4, TypeScript.
- **Design System**: "Flea Market Native" design (Coral Red `#ea352d` & Warm White) with Ambient Glassmorphism backgrounds.
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

## Next Potential Steps
- [x] Phase 3: Auth Integration, UI Refinement, Share Bonus & Roadmap Gauge.
- [x] Landing Page (LP) Implementation using Switcher pattern (`src/app/page.tsx`).
- [ ] **Phase 4: Promotion & Viral Strategy**: Invoke `@sns-marketer` (Gemika) to create copy and viral loops.
- [ ] Production Deployment (Vercel) & Custom Domain setup.
- [ ] Real Stripe Integration (Replace Mock).
