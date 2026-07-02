---
ticket_id: "TASK-BE-01-backend-core"
status: "todo"
assignee: "gemini-worker"
created_by: "claude-coordinator"
created_at: "2026-07-02"
---

# TASK-BE-01: バックエンドコア実装

## 1. 目的・背景

FleaScript MVPのバックエンド全体を実装する。
対象: Supabase スキーマ定義、ライブラリ群（supabase/openai/rateLimit）、
Edge Middleware、2本のAPI Route（/api/generate, /api/feedback）。

**⚠️ 実装順序を必ず守ること:**
1. `supabase/schema.sql`
2. `src/lib/supabase.ts`
3. `src/lib/openai.ts`
4. `src/lib/rateLimit.ts`
5. `src/middleware.ts`
6. `src/app/api/generate/route.ts`
7. `src/app/api/feedback/route.ts`

## 2. 受け入れ条件（Definition of Done）

- [ ] `supabase/schema.sql` が完全に記述されており、Supabaseダッシュボードで実行可能
- [ ] `src/lib/supabase.ts` が SERVER_ROLE_KEY を使う関数を export している
- [ ] `src/lib/openai.ts` が SYSTEM_PROMPT 定数と buildUserPrompt 関数を export している
- [ ] `src/lib/rateLimit.ts` が checkRateLimit(ip) 関数を export している
- [ ] `src/middleware.ts` が x-real-ip ヘッダーを設定している
- [ ] `POST /api/generate` が 429/400/502 を適切に返している
- [ ] `POST /api/feedback` が generation_logs を UPDATE している
- [ ] `npm run build` がエラーなく通る

## 3. 技術仕様

### 3-1. `supabase/schema.sql` （新規作成）

```sql
-- =============================================
-- FleaScript — Supabase Schema
-- =============================================

-- IPごとの1日あたりリクエスト数を管理するテーブル
CREATE TABLE IF NOT EXISTS ip_rate_limits (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address   text NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  count        int  NOT NULL DEFAULT 1,
  CONSTRAINT ip_rate_limits_ip_date_unique UNIQUE (ip_address, date)
);

-- 全生成リクエストのログテーブル
CREATE TABLE IF NOT EXISTS generation_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  ip_address      text,
  input_text      text,
  output_text     text,
  feedback        text CHECK (feedback IN ('positive', 'negative')),
  feedback_reason text CHECK (feedback_reason IN ('文体', 'スペック', 'ハッシュタグ', 'その他'))
);

-- RLS: service_role 以外は操作禁止（anon による直接読み書きを防ぐ）
ALTER TABLE ip_rate_limits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
```

---

### 3-2. `src/lib/supabase.ts` （新規作成）

**要件:**
- `createServerClient()` を export する関数型にすること（キャッシュ禁止、毎回新インスタンス）
- 使用する環境変数: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `@supabase/supabase-js` の `createClient` を使用

```typescript
import { createClient } from '@supabase/supabase-js'

/**
 * サーバーサイド専用 Supabase クライアント。
 * SERVICE_ROLE_KEY を使用するため、必ずサーバーコンポーネント / API Route 内でのみ呼ぶこと。
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

---

### 3-3. `src/lib/openai.ts` （新規作成）

**要件:**
- `openai` インスタンスを export（`new OpenAI({ apiKey: ... })`）
- `SYSTEM_PROMPT` 定数を export（以下のテキストを **一字一句そのまま** 使うこと）
- `buildUserPrompt(inputText: string): string` を export

**SYSTEM_PROMPT（変更禁止）:**
```
あなたはフリマアプリ（メルカリ・ラクマ等）専門の商品説明ライターです。
ユーザーが入力した箇条書きのメモを元に、購入者が安心できる丁寧な商品説明文を生成してください。

必ず以下の構成を守り、自然な日本語で記述してください：
1. ごあいさつ（「ご覧いただきありがとうございます。」から始める）
2. 出品理由（「〜のため出品します。」）
3. 商品の状態（正直・具体的に）
4. スペック・詳細（「・」を使った箇条書き）
5. ハッシュタグ（関連する検索ワードを「#」で3〜5個）

文末に必ず以下のクレジットを追加すること（絶対に変更・省略しない）：

[ 生成：FleaScript - フリマ出品文を一瞬で自動作成 ]
```

**buildUserPrompt:**
```typescript
export function buildUserPrompt(inputText: string): string {
  return `以下のメモを元に商品説明文を作成してください：\n${inputText}`
}
```

**OpenAI 呼び出し設定（route.ts 内で使用）:**
- model: `'gpt-4o-mini'`
- max_tokens: `600`
- temperature: `0.7`

---

### 3-4. `src/lib/rateLimit.ts` （新規作成）

**要件:**
- `checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }>` を export
- 上限は `process.env.RATE_LIMIT_PER_DAY ?? '3'` を parseInt して使用
- Supabase エラー時はフォールスルー（allowed: true を返す）してAPIを止めない
- upsert で `ip_address + date` の複合ユニーク制約を使いカウントアップ

```typescript
import { createServerClient } from './supabase'

const DAILY_LIMIT = parseInt(process.env.RATE_LIMIT_PER_DAY ?? '3', 10)

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createServerClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data, error } = await supabase
    .from('ip_rate_limits')
    .select('count')
    .eq('ip_address', ip)
    .eq('date', today)
    .maybeSingle()

  if (error) {
    // DBエラー時はユーザーをブロックしない（コスト優先でなく可用性優先）
    console.error('[rateLimit] Supabase error:', error.message)
    return { allowed: true, remaining: DAILY_LIMIT }
  }

  const currentCount = data?.count ?? 0

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  // カウントをインクリメント（存在しない場合は INSERT、存在する場合は UPDATE）
  await supabase
    .from('ip_rate_limits')
    .upsert(
      { ip_address: ip, date: today, count: currentCount + 1 },
      { onConflict: 'ip_address,date' }
    )

  return { allowed: true, remaining: DAILY_LIMIT - (currentCount + 1) }
}
```

---

### 3-5. `src/middleware.ts` （新規作成）

**重要制約:**
- DB操作は絶対に行わない（Edge Runtimeの制約）
- x-forwarded-for からIPを抽出し `x-real-ip` ヘッダーにセットするのみ
- matcher は `/api/generate` と `/api/feedback` のみ

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Vercel 環境では x-forwarded-for, ローカルでは req.ip
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.ip ?? '127.0.0.1'

  const res = NextResponse.next()
  res.headers.set('x-real-ip', ip)
  return res
}

export const config = {
  matcher: ['/api/generate', '/api/feedback'],
}
```

---

### 3-6. `src/app/api/generate/route.ts` （新規作成）

**要件 (エラーハンドリングを厳格に実装すること):**

| ケース | HTTPステータス | レスポンス例 |
|---|---|---|
| レートリミット超過 | 429 | `{ error: "本日の利用上限（3回）に達しました。明日またご利用ください。" }` |
| 入力空・形式不正 | 400 | `{ error: "商品情報を入力してください。" }` |
| 500文字超 | 400 | `{ error: "入力は500文字以内にしてください。" }` |
| OpenAI APIエラー | 502 | `{ error: "AI生成に失敗しました。しばらく時間をおいて再試行してください。" }` |
| 正常 | 200 | `{ outputText: string, logId: string \| null, remaining: number }` |

**実装フロー:**
1. `req.headers.get('x-real-ip')` でIP取得
2. `checkRateLimit(ip)` → allowed=false なら 429
3. `req.json()` でボディ取得 → inputText 検証
4. `openai.chat.completions.create(...)` 呼び出し
5. `supabase.from('generation_logs').insert(...)` でログ保存 → `logId` 取得
6. `{ outputText, logId, remaining }` を 200 で返す

---

### 3-7. `src/app/api/feedback/route.ts` （新規作成）

**要件:**
- `POST /api/feedback` を実装
- リクエストボディ: `{ logId: string, feedback: 'positive' | 'negative', reason?: string }`
- `generation_logs` テーブルの対象行を UPDATE する
- `logId` または `feedback` が欠如した場合 400 を返す
- 正常時: `{ ok: true }` を 200 で返す

---

## 4. 影響範囲・注意点

- **変更予定ファイル**: 上記 7 ファイルのみ（既存ファイルは一切変更しない）
- **新規ディレクトリ**: `supabase/`, `src/lib/`, `src/app/api/generate/`, `src/app/api/feedback/`
- **依存パッケージ**: `@supabase/supabase-js`, `openai` — すでにインストール済み
- **型安全**: `any` 型の使用は禁止。すべての関数に戻り値型を明示すること
- `'use client'` ディレクティブはサーバー専用ファイルに書かない

## 5. テスト方法

```powershell
# ビルドが通ることを確認（型エラーがないか）
npm run build

# 開発サーバー起動
npm run dev

# 別ターミナルで生成APIをテスト
Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"inputText":"iPhone 14 Pro、256GB、傷なし、充電器付き"}'

# フィードバックAPIをテスト（logIdは上記レスポンスから取得）
Invoke-RestMethod -Uri "http://localhost:3000/api/feedback" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"logId":"<上記のlogId>","feedback":"positive"}'
```

## 6. 完了報告欄（Gemini Worker 記入）

- 完了日:
- コミットハッシュ:
- 発見したGotchas:
