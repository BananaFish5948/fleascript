# FleaScript Handover Context (For AI Agents)

## System Status
- **Phase**: Premium Analytics & Advanced AI Insights Completed. UI Color Theme Guardrails, Pricing Transparency, and Gentle Boundary Helper (BNC) added. Ready for Marketing/Promotion & Deployment.
- **Framework**: Next.js 16.2.10 (App Router), Tailwind CSS v4, TypeScript.
- **Design System**: "Aesthetic / Kinfolk" design (Terracotta & Sage with Earth Tones) replacing the old app-like design. Emojis replaced with Lucide icons for a refined, premium feel.
- **External Services**: Supabase (Database & Auth), OpenAI (`gpt-4o-mini`).
- **Core Features**: Inventory and profit management dashboard, AI description generation, IP/User-based rate limiting, Developer Mode, Monetization Mock, **Cost-Driven Roadmap Gauge**, and **Gentle Boundary Helper (BNC)** (extracts screenshot text locally using Tesseract.js and drafts defensive responses).

## Architecture & Data Flow
1. **Frontend**: Single-page React UI (`src/app/page.tsx`) implementing a "Switcher" pattern.
   - **Unauthenticated**: Displays the Landing Page (`LandingPage.tsx`) which highlights the core value (text-to-description generation). The `AuthModal` is triggered only via CTA buttons.
   - **Authenticated**: Displays the Dashboard containing `SummaryCard`, `InventoryForm`, and `InventoryList`.
2. **API Routes**:
   - `GET /api/inventory`, `POST /api/inventory`: CRUD for inventory items. Checks user auth and limits (3 for free, 500 for premium).
   - `PATCH /api/inventory/[id]`, `DELETE /api/inventory/[id]`: Update and delete inventory items.
   - `POST /api/generate`: Queries OpenAI (`gpt-4o-mini`) to generate descriptions based on item data. No longer saves to DB (pure API wrapper).
   - `POST /api/analyze-chat`: Performs friction analysis and drafts defensive responses for Standard/Premium users using `gpt-4o-mini`. Uses IP suffix rate limits.
   - `GET /api/user-status`: Returns `remaining`, `isPremium`, `subscriptionStatus`, and `isLoggedIn` based on Supabase Auth.
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
   - **Data Loss Prevention (Zero-Cost Backup)**: Before executing any destructive SQL or schema migration on the Free Plan, AI MUST explicitly prompt the Master to perform a manual CSV export from the Supabase Table Editor. This is a strict rule defined in `.agents/AGENTS.md`.
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
17. **Multimodal API Integration & JSON Schema Enforcement (Gotcha)**:
    - When calling `gpt-4o-mini` with image inputs (`api/analyze-image`), **you MUST explicitly define the JSON schema and the output language in the system prompt** (e.g., "値は全て「日本語」で出力してください").
    - If you only say "output as JSON", the AI will invent its own keys (e.g., `{"特徴": "..."}` instead of `{"category": "..."}`) or output English based on the image context, causing frontend destructuring to fail (`undefined`).
    - The API now infers `estimated_target_price` and `estimated_postage` at zero extra cost, which the frontend (`InventoryForm`) automatically applies as highlighted "estimations" that disappear upon manual user edits.
18. **Human-mimicking Dev Log System (Stealth UI & Next.js Routing Gotcha)**:
    - To prevent the "Uncanny Valley" effect of AI generating instant release notes, we implemented a Human-in-the-Loop (HITL) architecture.
    - AI agents must insert draft logs to the `release_logs` table via `POST /api/dev/patch-log` with `status: 'draft'`.
    - The Master manually reviews and publishes them from the Stealth Admin UI.
    - **Gotcha**: The Admin UI URL is `http://localhost:3001/backstage/logs`. Next.js App Router ignores folders prefixed with an underscore (`_`) as "Private Folders". We intentionally named the folder `backstage` inside `(stealth-ops)` so it routes correctly while remaining obscure. Do NOT use `_backstage` for routable pages.
19. **Object Iteration Order (Frontend Rendering Gotcha)**:
    - Data constants like `seoCategories` are defined as `Record<string, Type>`. When rendering these in the UI (e.g., via `Object.values()`), the display order relies entirely on the JavaScript engine's default insertion order (ES2015+ spec for non-numeric string keys).
    - If a feature request asks to "sort categories by popularity" or "reorder items," DO NOT rely on rearranging the object properties. You MUST refactor the data structure to an array `Type[]` or add an explicit `order` property for safe, deterministic sorting.
    - **UIデザインシステム・CSSカラー変数の絶対死守ルール (重要)**: FleaScriptのデザインコンセプト（オーガニック・スローライフ/Kinfolk風）を守るため、Tailwindのデフォルトカラー（`bg-amber-100` や `text-purple-600` など）を直接ハードコードすることは原則禁止です。必ず `globals.css` に定義されテーママッピングされているCSS変数（`var(--color-brand)` [テラコッタ], `var(--color-accent)` [セージ] 等）を使用してください。これはテーマエンジン（sunsetテーマ等への切り替え）が正しく稼働するための絶対前提です。
    - **Premium AI分析キャッシュと24時間制限**: プレミアムのAI分析機能（`POST /api/premium/analytics`）は、マスターのOpenAIトークン浪費を防ぐため、結果を `users.preferences.ai_insights` にキャッシュし、前回実行日時 `last_ai_analysis_at` から24時間以内の二重実行を制限（`429` エラーを返却）するガードレールを設けています。
21. **Satori (next/og) 画像合成API開発における極めて重大な仕様制限 (Gotchas)**:
    - **日本語の隔離と対話品質（最重要）**: 開発中、思考プロセスや結果報告に生のエラーログや英語をそのまま流すのは厳禁。必ず綺麗な日本語に翻訳・クレンジングした上でマスターと対話し、許可を得てからコマンドや修正を行うこと。
    - **SVG `<text>` の完全非サポート**: SatoriはSVGの `<text>` タグをサポートしておらずクラッシュ（TypeError）します。テキストはすべてHTML（`div` / `span`）を用いて `position: absolute` で上に重ね合わせて配置すること。
    - **直接属性の禁止**: `fontSize` や `fontWeight` 等をタグ属性として直接指定するとパースエラーになるため、必ず `style={{ fontSize: '18px', fontWeight: 'bold' }}` のようにインライン `style` に記述すること。
    - **テキスト内 `<span>` の重なりバグ**: `<p>` や `<div>` の中に `<span>` をネストして部分的な装飾（カラー変更や太字化）を行うと、Satori内部の幅計算バグで文字がグチャグチャに重なります。必ずプレーンなテキストにするか、Flexboxで明示的に並べること。
    - **フォント読み込み形式制限**: 可変フォント（VF）や TTC コレクション形式は描画エンジンをクラッシュさせます。ローカルフォントを使用する際は、Windows標準の `yumin.ttf`（游明朝の単一TTF）などを `fs.readFileSync` で直接 `ArrayBuffer` に読み込ませて使用すること。
22. **Tesseract.jsの動的遅延ロードとOCR中間UIによる品質防御**:
    - BNC（穏やかな対話境界線ヘルパー）ではクライアントサイドOCR（`tesseract.js`）を使用しています。初期ロード（LCP）への悪影響を防ぐため、モーダル起動時に `import('tesseract.js')` を用いて動的に遅延ロードしてください。
    - OCRの日本語認識精度は解像度等に依存するため、サーバー送信前にユーザーが手動で誤字を修正できるよう、編集可能な中間テキストエリア（textarea）の設置が必須です。
23. **DBスキーマ変更不要のIPサフィックスハックによるレート制限**:
    - BNC機能のAPI（`/api/analyze-chat`）では、既存の `ip_rate_limits` テーブルをそのまま流用し、IPアドレスキーの末尾に `_bnc` を付与した `${ip}_bnc` 形式で1日のカウントを記録します。
    - これにより、SupabaseのDBスキーマを変更せずに、プラン別の利用制限（Standard: 10回、Premium: 30回）を安全に制御しています。
24. **Stripe決済・プラン管理のローカル/本番ハイブリッド構成**:
    - 開発（ローカル）環境のデバッグ負荷を下げるため、`STRIPE_SECRET_KEY` が未設定または `NODE_ENV === 'development'` の場合は、Stripeの決済画面へリダイレクトせず、バックエンドAPI（`/api/checkout`, `/api/checkout/portal`）が直接 Supabase DB を更新し、モック用のリダイレクトURL（`/?upgraded=true`, `/?canceled=true`）を即座に返却します。
    - 本番環境では、Stripe公開鍵が設定されるため、Stripe Checkout Session や Customer Portal Session を作成して本物の Stripe へ安全にリダイレクトさせます。
25. **Stripe Webhook における顧客IDの逆引きとRLSバイパス**:
    - 本番環境では、Stripe Webhook (`api/webhook/stripe`) のイベント `customer.subscription.updated` や `deleted` は `customer_id` (`cus_...`) のみを保持します。そのため、DBの `users` テーブルから `stripe_customer_id = customer` となるユーザーレコードを検索して特定します。
    - Webhook による更新処理は RLS をバイパスして安全に動作させるため、必ず `SUPABASE_SERVICE_ROLE_KEY` を用いてインスタンス化した **Admin Client** を使用し、非同期にDBを同期してください。
26. **Stripe APIの初期化バージョン指定における罠**:
    - Stripe SDKの初期化時に `apiVersion` オプションに不正なプレビューバージョンやプレースホルダー（例: `2025-01-27.acronyms`）などを指定すると、決済API（`/api/checkout` など）全体が `Invalid Stripe API version` エラーでクラッシュする。バージョン指定は省略し、インストールされているStripeパッケージのデフォルトバージョンを自動適用するのが最も堅牢である。
27. **Stripe未登録アカウントに対するプラン強制リセット（自己修復フォールバック）**:
    - データベース上だけでプラン（`subscription_status`）が有料（`standard` / `premium`）に変更されているにもかかわらず、Stripe上に顧客ID（`stripe_customer_id`）が存在しないエラーアカウントが「プランの解約や変更（ポータル起動）」を試みると、APIがエラーを返し、フロント画面から抜け出せなくなるデッドロックが発生する。
    - これを防ぐため、`/api/checkout/portal` APIにおいて、Stripe顧客IDが存在しない状態で有料プランになっている場合は、**自動的にDBのプランを `free` に強制リセットしてトップにリダイレクトさせる自己修復フォールバック処理**を実装した。
28. **客離れ防止のための決済方法（Google Pay / Apple Pay）の明記**:
    - アプリ側の決済ボタンが「クレジットカードで支払う」のみであると、ウォレット決済（Google Pay / Apple Pay）の対応に気付かず、ユーザーが決済直前で離脱（客離れ）してしまうリスクがある。そのため、ボタン文言を `💳 クレジットカード / Google Pay / Apple Pay で支払う` とし、説明文にも対応ウォレットを明記するUX対策を施した。
29. **Stripeにおけるウォレット決済の表示優先とデバイス制限のGotchas**:
    - Stripe Checkout画面で Google Pay や Apple Pay を最上部にデフォルト表示させたい場合、Stripeダッシュボードの「設定 ➔ Payments ➔ 支払い方法」から **`Link`**（Stripeの1クリック決済）を無効化（Disabled）することで、優先順位が繰り上がり、最上部に表示される。
    - Apple Pay はiOS/Macの Safari 環境でしか表示されず、Chrome（特にWindows）では Google Pay のみが表示されるというデバイス適合仕様を考慮すること。


## Next Potential Steps
- [x] Phase 3: Auth Integration, UI Refinement, Share Bonus & Roadmap Gauge.
- [x] Landing Page (LP) Implementation using Switcher pattern (`src/app/page.tsx`).
- [x] Native Ad Integration (UI & Dummy Data) & Layout Refinement completed.
- [x] **Phase 4.1**: AI Personalization (Seller Rules) & Multi-Platform Output (Mercari, Yahoo, Rakuma tabs).
- [x] **Phase 4.2**: Dashboard Analytics (Best-Selling Time) & Viral Referral System (+3 slots).
- [x] **Phase 5**: Vercel Deployment Preparation, Theme Engine, & Onboarding UX.
  - Implemented dynamic CSS variables for 4 themes (Kinfolk / Sunset / Stone / Linen). Selector integrated inside Settings panel, removing redundant header toggles.
  - Setup production Supabase tables (`ip_rate_limits`, `feedback_logs`).
  - Fixed TypeScript build errors, UI routing bugs, and Hydration mismatches.
  - Renamed `.env.local.example` to `.env.example` to prevent accidental credential leaks.
  - Enhanced Empty State CTA to prevent new user churn.
  - Implemented manual sample data injection (AirPods Pro) with Ah-ha moment routing.
- [x] **Phase 4.4**: Premium Analytics Upgrade (AI Markdown Suggestion & Recharts Profit Donut Chart).
- [x] **Phase 4.6**: Zero-Cost Virality (Canvas Monthly Activity Report, OGP Twitter Card Integration, Hybrid Shipping Calculator, 3-day stall detection).
- [x] **Phase 4.7**: Bottom Navigation UX Pivot & Ad Placement Optimization (Golden Zone).
- [x] **Product Version 2.0 UX/Security Upgrades**:
  - Implemented Graceful Degradation in Web Workers for Multimodal Image Analysis.
  - Built IP-based 15-minute Rate Limit Cooldown (3 consecutive failures).
  - Designed "Tuning Navigator" with clipboard integration and deep-link fallbacks.
  - Optimized Auth to Google + Magic Links (Cost Defense).
  - Refined Bottom Navigation Architecture: Segregated `InventoryList` into a dedicated 5th tab (`LIST`) to declutter the HOME dashboard.
  - Enhanced Transparency: Explicitly displayed daily remaining limits for multimodal image analysis directly inside the UI button.
- [x] **Product Version 2.1 - Gentle Boundary Helper (BNC)**:
  - Implemented client-side local OCR (`tesseract.js` dynamic load) + backend text analysis (`gpt-4o-mini`) hybrid flow.
  - Placed banners in HOME and ADD tabs, restricting access to Standard/Premium plans.
  - Applied RLS-safe IP suffix hack (`${ip}_bnc`) to enforce daily rate limits without DB schema modifications.
- [ ] **Phase 4.3**: Promotion Strategy & Viral Copy. Invoke `@sns-marketer` (Gemika) to create copy.
- [ ] **Phase 4.5**: Affiliate Monetization (Amazon Associates & Native Ads).
- [x] Production Deployment (Vercel) & Custom Domain setup (Stripe Live Mode integrated).
- [x] Real Stripe Integration (Replace Mock) - Completed via hybrid dev-mock/prod-stripe routing.
- [x] **Future UI Improvement**: Inline Edit Profit Simulator. (Ported real-time profit/fee calculation logic from `InventoryForm.tsx` into the inline edit form to allow live adjustments.)
- [x] **Future Feature**: Theme Customization (Implemented Stone & Espresso and Linen & Slate themes, with switchers in settings and header toggle.)
- [x] **Future Feature**: PremiumInsightPanel Advanced Analytics (Upgraded mock logic of `PremiumInsightPanel` to a backend OpenAI gpt-4o-mini driven algorithm with 24h caching in `users.preferences`.)
- [ ] **Future Feature**: Premium Auto-Generate on Save (Implement a toggle for Premium users to automatically generate AI descriptions simultaneously when saving an inventory item. This highly requested UX enhancement becomes economically viable only under a paid subscription model where API costs are absorbed by the MRR.)

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
