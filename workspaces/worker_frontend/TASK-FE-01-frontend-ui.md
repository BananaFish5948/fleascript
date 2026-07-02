---
ticket_id: "TASK-FE-01-frontend-ui"
status: "done"
assignee: "gemini-worker"
created_by: "claude-coordinator"
created_at: "2026-07-02"
---

# TASK-FE-01: フロントエンド UI 全実装

## 1. 目的・背景

FleaScript MVPの1画面完結UIを実装する。
デザインコンセプト: **「薄青緑（Teal/Cyan）×ダークネイビー」のサイバーかつ親しみやすいUI**。
ターゲットはネット初心者なので、操作は直感的で迷いのない導線にすること。

**⚠️ TASK-BE-01が完了していること（ビルドが通ること）を前提とする。**

**⚠️ 実装順序を必ず守ること:**
1. `src/app/globals.css`（デザイントークン定義が最優先）
2. `src/app/layout.tsx`
3. `src/components/InputArea.tsx`
4. `src/components/GenerateButton.tsx`
5. `src/components/OutputArea.tsx`
6. `src/components/FeedbackPanel.tsx`
7. `src/components/FooterFeedback.tsx`
8. `src/app/page.tsx`（最後に全部組み合わせ）

## 2. 受け入れ条件（Definition of Done）

- [x] `npm run build` がエラーなく通る
- [x] テキストエリアに入力 → ボタンクリック → 生成テキスト表示の基本フローが動く
- [x] 500文字超入力時にカウンターが赤くなりボタンが disabled になる
- [x] 「ワンクリックでコピー」ボタンでクリップボードにコピーされる
- [x] 👍クリック → feedback=positive が /api/feedback に送信される
- [x] 👎クリック → 理由選択モーダルが表示され、選択後 feedback=negative + reason が送信される
- [x] フッターの匿名意見箱が表示されている
- [x] レスポンシブ対応（スマホ・PC両方で崩れない）
- [x] バイラルクレジットがテキスト末尾に必ず含まれている（バックエンド側で付与済みのため表示するのみ）

## 3. 技術仕様

---

### 3-1. `src/app/globals.css` （上書き）

Tailwind v4 の `@theme` ディレクティブでデザイントークンを定義する。
既存内容を **全て以下に置き換える** こと。

```css
@import "tailwindcss";

/* ===== デザイントークン ===== */
@theme inline {
  /* カラーパレット: Teal × ダークネイビー */
  --color-bg-base:        #0a1628;
  --color-bg-surface:     #0f2035;
  --color-bg-elevated:    #162840;

  --color-brand:          #00c8b4;   /* メインTeal */
  --color-brand-light:    #4de8d8;   /* ホバー時 */
  --color-brand-dim:      rgba(0, 200, 180, 0.12);

  --color-accent:         #38bdf8;   /* ライトブルー */
  --color-text-primary:   #e2f0f9;
  --color-text-secondary: #7da5be;
  --color-text-muted:     #4d7a94;

  --color-border:         rgba(0, 200, 180, 0.18);
  --color-border-focus:   rgba(0, 200, 180, 0.6);
  --color-danger:         #f87171;

  /* フォント */
  --font-sans: 'Noto Sans JP', system-ui, sans-serif;

  /* シャドウ（Tealグロー） */
  --shadow-glow:  0 0 20px rgba(0, 200, 180, 0.15);
  --shadow-card:  0 4px 24px rgba(0, 0, 0, 0.4);
}

/* ===== ベーススタイル ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
}

body {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  line-height: 1.7;
}

/* ===== スクロールバーカスタム ===== */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-surface); }
::-webkit-scrollbar-thumb {
  background: var(--color-brand);
  border-radius: 3px;
}

/* ===== グロー装飾ライン ===== */
.glow-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-brand),
    transparent
  );
  opacity: 0.4;
}

/* ===== アニメーション ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(0, 200, 180, 0.3); }
  50%       { box-shadow: 0 0 20px rgba(0, 200, 180, 0.6); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease both;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* ===== カードベース ===== */
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
}
```

---

### 3-2. `src/app/layout.tsx` （上書き）

**変更点:**
- フォントを Geist → `Noto Sans JP`（subsets: `['japanese']`）に変更
- `lang="ja"` に変更
- SEO用メタデータを FleaScript 仕様に更新
- `next/font/google` から `Noto_Sans_JP` をインポート

```typescript
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FleaScript — フリマ商品説明を一瞬で自動作成',
  description:
    'メモを貼り付けるだけで、メルカリ・ラクマ等に使えるプロ品質の商品説明文をAIが自動生成。完全無料・登録不要。',
  openGraph: {
    title: 'FleaScript — フリマ商品説明を一瞬で自動作成',
    description: 'メモを貼り付けるだけでAIが商品説明文を自動生成します。',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${notoSansJP.className} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

### 3-3. `src/components/InputArea.tsx` （新規作成）

**Props:**
```typescript
interface InputAreaProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}
```

**要件:**
- `maxLength={500}` を textarea に設定
- 文字数カウンターを右下に表示: `{value.length} / 500`
- 残り50文字以下で `--color-danger` 色に変更
- placeholder: `"例：iPhone 14 Pro、256GB、傷なし、充電器付き、3年使用"`
- スタイル: カードUI（`card` クラス使用）、border-focus にTealグロー
- `'use client'` ディレクティブが必要

---

### 3-4. `src/components/GenerateButton.tsx` （新規作成）

**Props:**
```typescript
interface GenerateButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled: boolean
}
```

**要件:**
- ボタンテキスト（通常時）: `✨ 一発で売れる文章を作る`
- ボタンテキスト（ローディング時）: `⏳ AI生成中...`（スピナーアニメーション付き）
- disabled 条件: `isLoading || disabled`
- スタイル:
  - 背景: `--color-brand`（Teal）のグラデーション
  - テキスト: ダークカラー（`#0a1628`）で視認性確保
  - ホバー時: `--color-brand-light` に変化 + scale(1.02)
  - disabled 時: opacity 0.4、cursor-not-allowed
  - 幅: 全幅（`w-full`）
  - フォント: 太字、大きめ（text-lg）
  - パルスグロー: `animate-pulse-glow` を通常時に付与
- `'use client'` ディレクティブが必要

---

### 3-5. `src/components/OutputArea.tsx` （新規作成）

**Props:**
```typescript
interface OutputAreaProps {
  text: string
}
```

**要件:**
- テキスト表示エリア: `<pre>` タグ（whitespace-pre-wrap）で改行を保持
- 「ワンクリックでコピー」ボタン:
  - クリック後 `isCopied` state を true に → ボタンテキストを `✅ コピー完了！` に変化
  - 2秒後に元のテキスト `📋 ワンクリックでコピー` に戻す
  - `navigator.clipboard.writeText(text)` を使用
- コンポーネント全体に `animate-fade-in-up` クラスを付与（表示時のアニメーション）
- スタイル:
  - カードUI（`card` クラス）
  - ヘッダー行に「✅ 生成完了」ラベルとコピーボタンを左右に配置
  - テキストエリア背景: `--color-bg-elevated`
  - バイラルクレジット部分（末尾の `[ 生成：FleaScript...` ）を `--color-text-muted` の小さめフォントで視覚的に区別（**ただしテキストの内容は変更しない**）
- `'use client'` ディレクティブが必要

**バイラルクレジット検出方法:**
テキストを `\n[ 生成：` で分割し、前半を本文、後半をクレジットとして異なるスタイルで表示する。

---

### 3-6. `src/components/FeedbackPanel.tsx` （新規作成）

**Props:**
```typescript
interface FeedbackPanelProps {
  logId: string
  onFeedbackSent?: () => void
}
```

**State:**
- `status: 'idle' | 'thumbsDown' | 'sent'`
- `isSending: boolean`

**要件:**
- idle 時: 👍 と 👎 のボタンを横並びで表示
  - `「この文章はどうでしたか？」` のラベルも表示
- 👍 クリック時:
  - `POST /api/feedback` に `{ logId, feedback: 'positive' }` を送信
  - status を `'sent'` にして `「ありがとうございます！😊」` を表示
- 👎 クリック時:
  - status を `'thumbsDown'` に変更（理由選択モーダルを表示）
- thumbsDown 時（インラインモーダル）:
  - 「どの部分が不自然でしたか？」のラベル表示
  - 4つのボタン: `文体` / `スペック` / `ハッシュタグ` / `その他`
  - いずれかクリック時: `POST /api/feedback` に `{ logId, feedback: 'negative', reason: 選択値 }` を送信
  - 送信後 status を `'sent'` にして `「フィードバックありがとうございます 🙏」` を表示
- 送信エラー時もエラーを握り潰してユーザー体験を損なわない（コンソールログのみ）
- `'use client'` ディレクティブが必要

---

### 3-7. `src/components/FooterFeedback.tsx` （新規作成）

**要件:**
- 匿名意見箱: シングルライン `<input>` + 送信ボタン
- placeholder: `「こんな機能があったら嬉しい...」など、なんでもどうぞ`
- 送信ボタンのラベル: `送る`
- 送信先: `POST /api/feedback` に `{ logId: 'anonymous', feedback: 'comment', reason: inputValue }` を送信
  - ⚠️ logId が不明な匿名フィードバックは `'anonymous'` という固定文字列を使う
  - このケースはAPI側でUPDATE対象が見つからないが、エラーは無視してよい
- 送信後: input をクリアし `「送信しました！」` を1秒間表示
- スタイル:
  - フッター最下部に、薄いボーダー上線で区切ったコンパクトなUI
  - `--color-text-muted` の小さめフォント
- `'use client'` ディレクティブが必要

---

### 3-8. `src/app/page.tsx` （上書き）

**State 設計:**
```typescript
const [inputText,     setInputText]     = useState('')
const [outputText,    setOutputText]    = useState('')
const [logId,         setLogId]         = useState<string | null>(null)
const [isLoading,     setIsLoading]     = useState(false)
const [error,         setError]         = useState<string | null>(null)
const [feedbackSent,  setFeedbackSent]  = useState(false)
```

**ページレイアウト構造（上から順に）:**
```
<main>
  ┌─────────────────────────────────┐
  │  ヘッダー                        │
  │  ロゴ: "FleaScript ✨"           │
  │  サブ: "フリマ出品文を一瞬で自動作成" │
  │  glow-line                      │
  ├─────────────────────────────────┤
  │  <InputArea />                  │
  │  <GenerateButton />             │
  │  エラー表示（error があれば）     │
  │  <OutputArea /> （outputText時）│
  │  <FeedbackPanel /> （logId時）  │
  └─────────────────────────────────┘
  <footer>
    <FooterFeedback />
    コピーライト
  </footer>
</main>
```

**handleGenerate 関数（核心ロジック）:**
```typescript
const handleGenerate = async () => {
  if (!inputText.trim() || inputText.length > 500 || isLoading) return
  setIsLoading(true)
  setError(null)
  setOutputText('')
  setLogId(null)
  setFeedbackSent(false)

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputText }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? '予期せぬエラーが発生しました。')
      return
    }

    setOutputText(data.outputText)
    setLogId(data.logId)
  } catch {
    setError('ネットワークエラーが発生しました。接続を確認して再試行してください。')
  } finally {
    setIsLoading(false)
  }
}
```

**スタイル要件:**
- 最大幅: `max-w-2xl mx-auto` で中央揃え
- ページ全体に縦パディング
- ヘッダーロゴ: Teal グラデーションテキスト（`brand` → `accent`）
- 各セクション間: `gap-6` 相当の余白
- `'use client'` ディレクティブが必要

**ヘッダーデザイン詳細:**
- ツール名 `FleaScript` を大きく（text-3xl以上）、`--color-brand` と `--color-accent` のグラデーション文字で表示
- バッジ: 右上角に `✦ Beta` の小さなバッジ
- サブタイトル: `「メモを貼るだけで、売れる文章に。」`
- ヘッダー下に `.glow-line` を配置

---

## 4. 影響範囲・注意点

- **変更・作成するファイル**: 上記 8 ファイルのみ
- **既存ファイルで削除できるもの**: `public/` 内のNext.jsデフォルトSVG（任意）
- **`'use client'` の配置**: コンポーネントファイル全て + page.tsx の先頭
- **Tailwind v4 の注意点**: `@apply` の代わりに CSS カスタムプロパティ（`var(--color-xxx)`）を直接使うこと。`@layer` の使い方も v4 スタイルに従うこと
- **fetch の絶対 URL 不要**: `/api/generate` などの相対パスで OK

## 5. テスト方法

```powershell
# ビルド確認
npm run build

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:3000` を開き、以下を目視確認:
1. ダークネイビー背景 + Tealアクセントのデザインになっている
2. テキストエリアに入力できる
3. 「一発で売れる文章を作る」ボタンを押すとローディング状態になる
4. 出力テキストが表示される（要: 実際のAPIキー設定）
5. コピーボタンが機能する
6. 👍/👎 ボタンが表示・動作する

## 6. 完了報告欄（Gemini Worker 記入）

- 完了日: 2026-07-02
- コミットハッシュ: df6d511
- 発見したGotchas: 特になし。Tailwind v4 の `@theme` ディレクティブを使用した CSS 変数設計、および Next.js 15+ 対応の `'use client'` ディレクティブを各コンポーネントに適切に配置し、ビルドを通過させた。
