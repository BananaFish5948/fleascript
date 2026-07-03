# FleaScript Handover Context (For AI Agents)

## System Status
- **Phase**: Pivot Completed (Transformed from standalone AI generator to "Inventory & Profit Management Dashboard"). MVP Core & UI Refined & Auth Integrated & Pre-Flight Hardening Completed.
- **Framework**: Next.js 16.2.10 (App Router), Tailwind CSS v4, TypeScript.
- **Design System**: "Flea Market Native" design (Coral Red `#ea352d` & Warm White) with Ambient Glassmorphism backgrounds.
- **External Services**: Supabase (Database & Auth), OpenAI (`gpt-4o-mini`).
- **Core Features**: Inventory and profit management dashboard, 1-click status update, real-time profit calculation, AI description generation as a sub-feature (Stock area), IP-based rate limiting (Free: 3 items max, Premium: 500 items max), Developer Mode (limit bypass), Basic Auth protected Admin dashboard, Monetization Mock (Stripe Checkout Simulation).

## Architecture & Data Flow
1. **Frontend**: Single-page React UI (`src/app/page.tsx`) acting as a dashboard. 
   - Uses `SummaryCard`, `InventoryForm`, and `InventoryList`.
   - Requires Supabase Auth login. If not logged in, `AuthModal` is forced.
2. **API Routes**:
   - `GET /api/inventory`, `POST /api/inventory`: CRUD for inventory items. Checks user auth and limits (3 for free, 500 for premium).
   - `PATCH /api/inventory/[id]`, `DELETE /api/inventory/[id]`: Update and delete inventory items.
   - `POST /api/generate`: Queries OpenAI (`gpt-4o-mini`) to generate descriptions based on item data. No longer saves to DB (pure API wrapper).
   - `GET /api/user-status`: Returns `remaining`, `isPremium`, and `isLoggedIn` based on Supabase Auth.
   - `POST /api/checkout-success-mock`, `POST /api/cancel-subscription-mock`: Mocks Stripe logic, upgrades/downgrades user to/from `premium`.
   - `GET /api/dev-mode`, `POST /api/toggle-premium`: Admin utility APIs.
3. **Database (Supabase)**:
   - `users`: Stores user UUIDs (`auth.users` reference) and subscription status (`free`, `premium`).
   - `inventory_items`: Core table storing user's items, prices, postage, fee rates, box numbers, and generated descriptions (`description_stock`). Protected by Row Level Security (RLS).
   - `ip_rate_limits`: Fallback rate limit per IP for the API endpoints.
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

## Next Potential Steps
- [ ] Production Deployment (Vercel) & Custom Domain setup.
- [ ] Real Stripe Integration (Replace Mock).
- [ ] OCR Integration (Future Phase): Allow users to scan receipts or items to automatically pre-fill purchase prices and item names.
